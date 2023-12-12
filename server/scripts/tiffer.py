import argparse
import json
import os
import rasterio
from shapely.geometry import Polygon
import geojson
from ultralytics import YOLO
import random 

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

    # Open the GeoTIFF file with rasterio
    with rasterio.open(source_image) as src:
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

    for item in input_json:
        lat1, lng1, lat2, lng2 = item['lat1'], item['lng1'], item['lat2'], item['lng2']

        # Ensure coordinates are in the correct order (longitude, latitude)
        coordinates = [
            (lng1, lat1),
            (lng1, lat2),
            (lng2, lat2),
            (lng2, lat1),
            (lng1, lat1)  # Close the polygon
        ]

        # Get the color based on the class from the mapping dictionary
        color = class_color_mapping.get(item["class"])

        # If the class doesn't have a color, generate a random color
        if color is None:
            color = "#{:06x}".format(random.randint(0, 0xFFFFFF))  # Random hex color

            # Store the color in the mapping dictionary for future use
            class_color_mapping[item["class"]] = color

        feature = geojson.Feature(
            geometry=geojson.Polygon([coordinates]),
            properties={
                "name": item["name"],
                "class": item["class"],
                "confidence": item["confidence"],
                "color": color  # Include color information
            }
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