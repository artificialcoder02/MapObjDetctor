import argparse
import json
import os
import rasterio
import geojson
from ultralytics import YOLO
import random

os.environ["PROJ_LIB"] = r"C:\ProgramData\anaconda3\pkgs\proj-6.2.1-h3758d61_0\Library\share\proj"

def pixel_to_latlng(pixel_x, pixel_y, src, lat_offset=-0.00001, lng_offset=0.00001):
    transform = src.transform
    lon, lat = transform * (pixel_x, pixel_y)
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

def run_inference(model_path, source_directory):
    model = YOLO(model_path)
    all_detections = []

    for filename in os.listdir(source_directory):
        if filename.endswith(".tif"):
            source_image = os.path.join(source_directory, filename)
            with rasterio.open(source_image) as src:
                results = model(source_image)
                for result in results:
                    pre = json.loads(result.tojson())
                    for item in pre:
                        box = item.get("box")
                        x1, y1, x2, y2 = box.get("x1"), box.get("y1"), box.get("x2"), box.get("y2")
                        lat1, lon1 = pixel_to_latlng(x1, y1, src)
                        lat2, lon2 = pixel_to_latlng(x2, y2, src)
                        item["lat1"], item["lng1"], item["lat2"], item["lng2"] = lat1, lon1, lat2, lon2

                        # Handle segmentation
                        if 'segments' in item:
                            masks = item["segments"]
                            x, y = masks.get("x"), masks.get("y")
                            segment_coords = []
                            for px, py in zip(map(int, x), map(int, y)):
                                mlat, mlon = pixel_to_latlng(px, py, src)
                                segment_coords.append((mlat, mlon))
                            item["segment_coords"] = segment_coords
                        
                        all_detections.append(item)
    return all_detections

def detections_to_geojson(detections, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    file_number = get_next_file_number(output_folder)
    output_filename = os.path.join(output_folder, f"output_{file_number}.geojson")
    features = []
    class_color_mapping = {}
    used_colors = set()

    for item in detections:
        color = class_color_mapping.get(item["class"])
        if color is None:
            color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
            while color in used_colors:
                color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
            used_colors.add(color)
            class_color_mapping[item["class"]] = color

        properties = {
            "name": item["name"],
            "class": item["class"],
            "confidence": item["confidence"],
            "color": color
        }

        if 'segment_coords' in item:
            segment_polygon = [(lon, lat) for lat, lon in item['segment_coords']]
            segment_polygon.append(segment_polygon[0]) # Close the polygon
            segment_feature = geojson.Feature(
                geometry=geojson.Polygon([segment_polygon]),
                properties={"type": "Segmentation", **properties}
            )
            features.append(segment_feature)
        elif 'lat1' in item and 'lng1' in item and 'lat2' in item and 'lng2' in item:
            coordinates = [(item['lng1'], item['lat1']), (item['lng1'], item['lat2']), 
                           (item['lng2'], item['lat2']), (item['lng2'], item['lat1']), 
                           (item['lng1'], item['lat1'])] # Close the polygon
            bbox_feature = geojson.Feature(
                geometry=geojson.Polygon([coordinates]),
                properties={"type": "Bbox", **properties}
            )
            features.append(bbox_feature)

    feature_collection = geojson.FeatureCollection(features)
    with open(output_filename, "w") as geojson_file:
        geojson.dump(feature_collection, geojson_file)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run YOLOv8 object detection on GeoTIFF images in a directory.")
    parser.add_argument("--model", required=True, help="Path to the YOLOv8 model checkpoint file")
    parser.add_argument("--source", required=True, help="Directory path containing GeoTIFF images")
    parser.add_argument("--output", required=True, help="Output directory for the GeoJSON file")

    args = parser.parse_args()
    detections = run_inference(args.model, args.source)
    detections_to_geojson(detections, args.output)
