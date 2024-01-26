import argparse
import json
import os
import rasterio
from shapely.geometry import Polygon
import geojson
from ultralytics import YOLO
import random

os.environ["PROJ_LIB"] = r"C:\ProgramData\anaconda3\pkgs\proj-6.2.1-h3758d61_0\Library\share\proj"

from affine import Affine

def pixel_to_latlng(pixel_x, pixel_y, src, lat_offset=-0.00001, lng_offset=0.00001):
    # Get the transform from pixel coordinates to geographic coordinates
    transform = src.transform

    # Debug: Check the types of pixel_x and pixel_y
    #print("Type of pixel_x:", type(pixel_x))
    #print("Type of pixel_y:", type(pixel_y))

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

    # Open the GeoTIFF file with rasterio
    with rasterio.open(source_image) as src:
        results = model(source_image)
        detections = []

        for result in results:
            obb = getattr(result, 'obb', None)  # Get the 'obb' attribute or None if not present
            if obb is not None:  # Check if 'obb' is not None
                # Convert OBB attributes to Python lists
                xyxyxyxy = result.obb.xyxyxyxy.tolist()
                print(xyxyxyxy)
                confidence = result.obb.conf.tolist()
                class_label = result.obb.cls.tolist()

                # Convert pixel coordinates to latitude and longitude for OBB
                latitudes, longitudes = [], []
                for xy in xyxyxyxy:
                    #x, y = xy[::2], xy[1::2]
                    #lat, lon = pixel_to_latlng(xy[0], xy[1], src)
                    for corner in xy:
                        #centroid_x = sum(corner[0] for corner in xy) / len(xy)
                        #centroid_y = sum(corner[1] for corner in xy) / len(xy)

                       #lat, lon = pixel_to_latlng(centroid_x, centroid_y, src)
                        lat, lon = pixel_to_latlng(corner[0], corner[1], src)
                        latitudes.append(lat)
                        longitudes.append(lon)

                # Prepare the OBB detection entry
                obb_detection = {
                    "latitudes": latitudes,
                    "longitudes": longitudes,
                    "confidence": confidence,
                    "class_label": class_label
                }

                detections.append(obb_detection)
            else:  # Assume it's the regular object detection result
                pre = json.loads(result.tojson())
                # Process the result as you did for object detection
                for item in pre:
                    box = item.get("box")
                x1 = box.get("x1")
                y1 = box.get("y1")
                x2 = box.get("x2")
                y2 = box.get("y2")

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

    class_color_mapping = {}

    for item in input_json:
        # Assuming each item in input_json contains lists of coordinates for one polygon
        coordinates = list(zip(item['longitudes'], item['latitudes']))
        class_label = item['class_label']
        confidence = item['confidence']

        # Ensure coordinates for a polygon are enclosed
        if coordinates[0] != coordinates[-1]:
            coordinates.append(coordinates[0])

        color = class_color_mapping.get(tuple(class_label))
        if color is None:
            color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
            class_color_mapping[tuple(class_label)] = color

        feature = geojson.Feature(
            geometry=geojson.Polygon([coordinates]),
            properties={
                "name": f"Class {class_label}",
                "class": class_label,
                "confidence": confidence,
                "color": color
            }
        )
        features.append(feature)

    feature_collection = geojson.FeatureCollection(features)

    with open(output_filename, "w") as geojson_file:
        geojson.dump(feature_collection, geojson_file)

    


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run YOLOv8 object detection or OBB detection on a source GeoTIFF image.")
    parser.add_argument("--model", required=True, help="Path to the YOLOv8 or OBB model checkpoint file")
    parser.add_argument("--source", required=True, help="Path to the source GeoTIFF image for inference")
    parser.add_argument("--userId", required=False, help="Path to change the output file")
    import os
    current_directory = os.getcwd()

    args = parser.parse_args()

    if args.userId:
        output_folder = os.path.join(current_directory, 'detection', 'geoj')
    else:
        output_folder = os.path.join(current_directory, 'geoj')

    detections = run_inference(args.model, args.source)

    detections_to_geojson(detections, output_folder)
