import argparse
import json
import geojson
from ultralytics import YOLO

def pixel_to_latlng(pixel_x, pixel_y, nw_lat, nw_lng, se_lat, se_lng, image_width, image_height):
    lat = nw_lat - ((nw_lat - se_lat) * (pixel_y / image_height))
    lng = nw_lng + ((se_lng - nw_lng) * (pixel_x / image_width))
    return lat, lng

def run_inference(model_path, source_image, nw_lat, nw_lng, se_lat, se_lng, image_width, image_height):
    # Load the specified YOLOv8 model
    model = YOLO(model_path)

    # Run inference on the specified image
    results = model(source_image)

    # Process and save the results as GeoJSON with latitude and longitude
    detections = []

    for result in results:
        pre = json.loads(result.tojson())  # Parse the string as JSON
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

def detections_to_geojson(input_json):
    # Create a FeatureCollection to hold the GeoJSON features
    features = []

    for item in input_json:
        lat1, lng1, lat2, lng2 = item['lat1'], item['lng1'], item['lat2'], item['lng2']
        feature = geojson.Feature(
            geometry=geojson.Polygon([[(lng1, lat1), (lng1, lat2), (lng2, lat2), (lng2, lat1), (lng1, lat1)]]),
            properties={"name": item["name"], "class": item["class"], "confidence": item["confidence"]}
        )
        features.append(feature)

    feature_collection = geojson.FeatureCollection(features)

    return feature_collection

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

    detections = run_inference(args.model, args.source, args.nw_lat, args.nw_lng, args.se_lat, args.se_lng, args.image_width, args.image_height)

    geojson_output = detections_to_geojson(detections)
    with open("output.geojson", "w") as geojson_file:
        geojson.dump(geojson_output, geojson_file)
