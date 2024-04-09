import argparse
import json
import os
import rasterio
from shapely.geometry import Polygon
import geojson
from ultralytics import YOLO
import random 
import tempfile
import shutil
from osgeo import gdal
from skimage import exposure
from rasterio.plot import reshape_as_raster, reshape_as_image
from skimage.exposure import equalize_adapthist
from rasterio.warp import calculate_default_transform, reproject, Resampling
from skimage.filters import unsharp_mask
from skimage.restoration import denoise_wavelet

os.environ["PROJ_LIB"] = r"C:\ProgramData\anaconda3\pkgs\proj-6.2.1-h3758d61_0\Library\share\proj"


def pixel_to_latlng(pixel_x, pixel_y, src, lat_offset= -0.00001, lng_offset=0.00001):

    # Get the transform from pixel coordinates to geographic coordinates
    transform = src.transform

    # Calculate the geographic coordinates
    lon, lat = transform * (pixel_x, pixel_y)

    # Apply the offset
    lat += lat_offset
    lon += lng_offset

    return lat, lon



def get_next_file_number(output_folder):
    existing_files = os.listdir(output_folder)
    existing_numbers = [
        int(f.split("_")[1].split(".")[0])
        for f in existing_files
        if f.startswith("output_") and f.endswith(".geojson")
    ]
    next_file_number = max(existing_numbers) + 1 if existing_numbers else 1
    return next_file_number


def run_inference(model_path, source_image):

    model = YOLO(model_path)

    # Use GDAL to reproject and directly write to a new temporary file
    with tempfile.NamedTemporaryFile(suffix='.tif', dir=os.getcwd(), delete=False) as tmp:
        reprojected_temp_filename = tmp.name
    gdal.Warp(reprojected_temp_filename, source_image, dstSRS='EPSG:4326')

    # Process the reprojected image
    with tempfile.NamedTemporaryFile(suffix='.tif', dir=os.getcwd(), delete=False) as tmp:
        enhanced_temp_filename = tmp.name

    with rasterio.open(reprojected_temp_filename) as src:
        data = src.read([1, 2, 3]) if src.count >= 3 else src.read()
        img = reshape_as_image(data).astype('float32') / 255
        img_normalized = (img - img.min()) / (img.max() - img.min())
        img_eq = exposure.equalize_adapthist(img_normalized)
        # Denoise the image
        img_denoised = denoise_wavelet(img_eq, method='BayesShrink', mode='soft')
        # Sharpen the image
        img_sharpened = unsharp_mask(img_denoised, radius=1.0, amount=1.0)
        # Prepare for saving
        img_final = (img_sharpened * 255).astype('uint8')
        data_final = reshape_as_raster(img_final)
        out_meta = src.meta.copy()
        out_meta.update({"count": 3, "dtype": 'uint8'})

    with rasterio.open(enhanced_temp_filename, 'w', **out_meta) as dest:
        dest.write(data_final)

    print(f"Enhanced and reprojected TIFF saved at: {enhanced_temp_filename}")
    results = model(enhanced_temp_filename)
    detections = []

    for result in results:
            # Check and handle OBB first
            obb = getattr(result, 'obb', None)
            if obb is not None:
                all_obb_coords = obb.xyxyxyxy.cpu().numpy().tolist()
                class_labels = obb.cls.cpu().numpy().tolist() 
                for obb_coords in all_obb_coords:
                    geo_coords = []
                    for x, y in obb_coords:
                        lat, lon = pixel_to_latlng(int(x), int(y), src)
                        geo_coords.append((lon, lat))  # Longitude, Latitude order
                    
                    class_names = []
                    for key in result.names:
                        if key in class_labels:
                            class_names.append(result.names[key])
                                                            
                    #class_names = [result.names.get(cls_id, "Unknown") for cls_id in class_labels]
                    obb_detection = {
                        "coordinates": geo_coords,  # Coordinates for this specific OBB
                        "confidence": obb.conf.tolist(),
                        "class_label": obb.cls.tolist(),
                        "class_names": class_names
                    }
                    detections.append(obb_detection)
                
                continue  
            

            pre = json.loads(result.tojson())

            for item in pre:
                box = item.get("box")
                x1 = box.get("x1")
                y1 = box.get("y1")
                x2 = box.get("x2")
                y2 = box.get("y2")
                #Handle segmentation 
                if (item.get('segments') is not None ):
                    masks = item.get("segments")
                    x = masks.get("x")
                    y = masks.get("y")
                    segment_coords = []
                    
                    # Convert to integer and iterate over each point in the segment
                    for px, py in zip(map(int, x), map(int, y)):
                        mlat, mlon = pixel_to_latlng(px, py, src)
                        segment_coords.append((mlat, mlon))
                    
                    # Store the converted segment coordinates
                    item["segment_coords"] = segment_coords

                    
                    ''' mcx , mcy = pixel_to_latlng (x , y , src)
                    item["mx"] = mcx
                    item["my"] = mcy  '''
            
                # Convert pixel coordinates to latitude and longitude
                lat1, lon1 = pixel_to_latlng(x1, y1, src)
                lat2, lon2 = pixel_to_latlng(x2, y2, src)
                

                item["lat1"] = lat1
                item["lng1"] = lon1
                item["lat2"] = lat2
                item["lng2"] = lon2
                
                detections.append(item)

    return detections

def detections_to_geojson(input_json, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    file_number = get_next_file_number(output_folder)
    output_filename = os.path.join(output_folder, f"output_{file_number}.geojson")
    features = []

    # Use a dictionary to store dynamically assigned colors for each class
    class_color_mapping = {}
    used_colors = set()

    for item in input_json:
        # Determine the class_key based on the detection type
        if 'class_names' in item:
            class_key = item["class_names"][0] if item["class_names"] else "Unknown"  # First class name or "Unknown"
        else:
            class_key = item.get("class", "Unknown")

        # Assign color based on class_key
        color = class_color_mapping.get(class_key)
        if color is None:
            color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
            while color in used_colors:
                color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
            used_colors.add(color)
            class_color_mapping[class_key] = color

        # Set up properties based on detection type
        if 'class_names' in item:  # For OBB detections
            properties = {
                "name": class_key,
                "confidence": item.get("confidence"),
                "color": color
            }
        else:  # For other detections (segmentations and bounding boxes)
            properties = {
                "name": item.get("name", "Unknown"),
                "class": class_key,  # Use class_key here for consistency
                "confidence": item.get("confidence"),
                "color": color
            }

        
        # Process OBB
        if 'coordinates' in item:
            obb_coords = item['coordinates']
            # Ensure the OBB polygon is closed
            if obb_coords and len(obb_coords) > 2:
                if obb_coords[0] != obb_coords[-1]:
                    obb_coords.append(obb_coords[0])

                # Properties specific to OBB
                obb_properties = {
                    "type": "OBB",
                    "confidence": item.get("confidence"),
                    "class_names": item.get("class_names", ["Unknown"]),
                    **properties  # Add common properties
                }

                obb_feature = geojson.Feature(
                geometry=geojson.Polygon([obb_coords]),
                properties={"type": "OBB", **properties}
                )
                features.append(obb_feature)
        
        #Process Instance Segmentation 
        elif 'segment_coords' in item:
            segment_polygon = [(lon, lat) for lat, lon in item['segment_coords']]
            if segment_polygon:
                segment_polygon.append(segment_polygon[0]) # Ensure the polygon is closed

            segment_feature = geojson.Feature(
                geometry=geojson.Polygon([segment_polygon]),
                properties={"type": "Segmentation", **properties}
            )
            features.append(segment_feature)
        
        # Process bounding box
        elif 'lat1' in item and 'lng1' in item and 'lat2' in item and 'lng2' in item:

            lat1, lng1, lat2, lng2 = item['lat1'], item['lng1'], item['lat2'], item['lng2']
        
            # Ensure coordinates are in the correct order (longitude, latitude)
            coordinates = [
                (lng1, lat1),
                (lng1, lat2),
                (lng2, lat2),
                (lng2, lat1),
                (lng1, lat1),
                # Close the polygon
            ]

            feature = geojson.Feature(
            geometry=geojson.Polygon([coordinates]),
            properties={"type": "Bbox", **properties}
            )

            features.append(feature)
        
        

    feature_collection = geojson.FeatureCollection(features)

    with open(output_filename, "w") as geojson_file:
        geojson.dump(feature_collection, geojson_file)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run YOLOv8 object detection on a source GeoTIFF image.")
    parser.add_argument("--model", required=True, help="Path to the YOLOv8 model checkpoint file")
    parser.add_argument("--source", required=True, help="Path to the source GeoTIFF image for inference")
    parser.add_argument("--userId", required=False, help="Path to the chnage the output file")
    import os
    current_directory = os.getcwd()

    args = parser.parse_args()

    if args.userId:
        output_folder = os.path.join(current_directory,  'detection', 'geoj')
    else:
        output_folder = os.path.join(current_directory, 'geoj')

    detections = run_inference(args.model, args.source)

    detections_to_geojson(detections, output_folder)