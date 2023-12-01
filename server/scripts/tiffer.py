import argparse
import json
import geojson
import os
#import rasterio
from osgeo import gdal
from osgeo import osr
from ultralytics import YOLO
import random 


def pixel_to_latlng(pixel_x, pixel_y, dataset):
    transform = dataset.GetGeoTransform()
    x = transform[0] + pixel_x * transform[1] + pixel_y * transform[2]
    y = transform[3] + pixel_x * transform[4] + pixel_y * transform[5]

    # Get the spatial reference system of the dataset
    srs = osr.SpatialReference()
    srs.ImportFromWkt(dataset.GetProjection())

    # Create a transformer to convert the coordinates
    transformer = osr.CoordinateTransformation(srs, srs.CloneGeogCS())

    # Transform the x, y coordinates to latitude and longitude
    lon, lat, _ = transformer.TransformPoint(x, y)

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

    # Open the GeoTIFF file with gdal
    dataset = gdal.Open(source_image, gdal.GA_ReadOnly)
    if dataset is None:
        raise Exception(f"Failed to open the source image: {source_image}")

    # Get the transform from pixel coordinates to geographic coordinates
    transform = dataset.GetGeoTransform()

    results = model(source_image)
    detections = []

    for result in results:
        pre = json.loads(result.tojson())

        #print(pre)
        for item in pre:
            box = item.get("box")
            x1 = box.get("x1")
            y1 = box.get("y1")
            x2 = box.get("x2")
            y2 = box.get("y2")
            
            # Convert pixel coordinates to latitude and longitude
            lat1, lon1 = pixel_to_latlng(x1, y1, dataset)
            lat2, lon2 = pixel_to_latlng(x2, y2, dataset)

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
