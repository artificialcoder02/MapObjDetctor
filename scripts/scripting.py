import argparse
import json
import geojson
from ultralytics import YOLO
import os

def pixel_to_latlng(pixel_x, pixel_y, nw_lat, nw_lng, se_lat, se_lng, image_width, image_height):
    lat = nw_lat - ((nw_lat - se_lat) * (pixel_y / image_height))
    lng = nw_lng + ((se_lng - nw_lng) * (pixel_x / image_width))
    return lat, lng

def get_next_file_number(output_folder):
    existing_files = os.listdir(output_folder)
    existing_numbers = [
        int(f.split("_")[1].split(".")[0])
        for f in existing_files
        if f.startswith("output_") and f.endswith(".geojson")
    ]
    next_file_number = max(existing_numbers) + 1 if existing_numbers else 1
    return next_file_number

def run_inference(model_path, source_image, nw_lat, nw_lng, se_lat, se_lng, image_width, image_height):
    model = YOLO(model_path)
    results = model(source_image)
    detections = []

    for result in results:
        pre = json.loads(result.tojson())
        for item in pre:
            box = item.get("box")
            x1 = box.get("x1")
            y1 = box.get("y1")
            x2 = box.get("x2")
            y2 = box.get("y2")
            lat1, lng1 = pixel_to_latlng(x1, y1, nw_lat, nw_lng, se_lat, se_lng, image_width, image_height)
            lat2, lng2 = pixel_to_latlng(x2, y2, nw_lat, nw_lng, se_lat, se_lng, image_width, image_height)

            item["lat1"] = lat1
            item["lng1"] = lng1
            item["lat2"] = lat2
            item["lng2"] = lng2
            detections.append(item)

    return detections

def detections_to_geojson(input_json, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    file_number = get_next_file_number(output_folder)
    output_filename = os.path.join(output_folder, f"output_{file_number}.geojson")
    features = []

    for item in input_json:
        lat1, lng1, lat2, lng2 = item['lat1'], item['lng1'], item['lat2'], item['lng2']
        feature = geojson.Feature(
            geometry=geojson.Polygon([[(lng1, lat1), (lng1, lat2), (lng2, lat2), (lng2, lat1), (lng1, lat1)]]),
            properties={"name": item["name"], "class": item["class"], "confidence": item["confidence"]}
        )
        features.append(feature)

    feature_collection = geojson.FeatureCollection(features)

    with open(output_filename, "w") as geojson_file:
        geojson.dump(feature_collection, geojson_file)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run YOLOv8 object detection on a source image.")
    parser.add_argument("--model", required=True, help="Path to the YOLOv8 model checkpoint file")
    parser.add_argument("--source", required=True, help="Path to the source image for inference")
    parser.add_argument("--nw_lat", required=True, type=float, help="Northwest latitude")
    parser.add_argument("--nw_lng", required=True, type=float, help="Northwest longitude")
    parser.add_argument("--se_lat", required=True, type=float, help="Southeast latitude")
    parser.add_argument("--se_lng", required=True, type=float, help="Southeast longitude")
    parser.add_argument("--image_width", required=True, type=int, help="Image width")
    parser.add_argument("--image_height", required=True, type=int, help="Image height")
    args = parser.parse_args()

    output_folder = "/Users/tuhinrc/Desktop/newnew/MapObjDetctor/geoj"
    detections = run_inference(args.model, args.source, args.nw_lat, args.nw_lng, args.se_lat, args.se_lng, args.image_width, args.image_height)

    detections_to_geojson(detections, output_folder)
