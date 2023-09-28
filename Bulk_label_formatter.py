import os
import cv2

class_mapping = {
    "plane": 0,
    "ship": 1,
    "storage-tank": 2,
    "baseball-diamond": 3,
    "tennis-court": 4,
    "basketball-court": 5,
    "ground-track-field": 6,
    "harbor": 7,
    "bridge": 8,
    "large-vehicle": 9,
    "small-vehicle": 10,
    "helicopter": 11,
    "roundabout": 12,
    "soccer-ball-field": 13,
    "swimming-pool": 14
}

def normalize_coordinates(x_min, y_min, x_max, y_max, image_width, image_height):
    normalized_x_center = (x_min + x_max) / (2.0 * image_width)
    normalized_y_center = (y_min + y_max) / (2.0 * image_height)
    normalized_width = (x_max - x_min) / image_width
    normalized_height = (y_max - y_min) / image_height

    return normalized_x_center, normalized_y_center, normalized_width, normalized_height

def extract_image_dimensions(image_folder):
    image_dimensions = {}
    for filename in os.listdir(image_folder):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            img_path = os.path.join(image_folder, filename)
            img = cv2.imread(img_path)
            if img is not None:
                height, width, _ = img.shape
                image_dimensions[os.path.splitext(filename)[0]] = (width, height)
    return image_dimensions

def yolo_format(label, image_dimensions):
    label = label.replace("'acquisition dates':acquisition dates\n", "").replace("'imagesource':imagesource\n", "").replace("'gsd':gsd\n", "")
    lines = label.strip().split('\n')
    yolo_label = ""

    for line in lines:
        parts = line.split(',')
        if len(parts) != 10:  
            continue

        # Extract coordinates
        x1, y1, x2, y2, x3, y3, x4, y4 = map(int, parts[:8])
        filename = os.path.splitext(parts[9].strip())[0]

        image_width, image_height = image_dimensions.get(filename, (1, 1))

        # Normalize the coordinates and calculate class number
        normalized_x_center, normalized_y_center, normalized_width, normalized_height = normalize_coordinates(x1, y1, x3, y3, image_width, image_height)
        category = parts[8].strip()
        class_number = class_mapping.get(category, -1)

        if class_number == -1:
            print(f"Unknown category: {category}")
            continue

        # Append YOLO formatted label
        yolo_label += f"{class_number} {normalized_x_center:.6f} {normalized_y_center:.6f} {normalized_width:.6f} {normalized_height:.6f}\n"

    return yolo_label

def process_file(input_filepath, output_filepath, image_dimensions):
    base_filename = os.path.splitext(os.path.basename(input_filepath))[0]
    image_width, image_height = image_dimensions.get(base_filename, (1, 1))

    print(f"Processing {base_filename}. Image dimensions: {image_width} x {image_height}")

    with open(input_filepath, 'r') as input_file:
        label_content = input_file.read()
        yolo_formatted_label = yolo_format(label_content, image_dimensions)

    with open(output_filepath, 'w') as output_file:
        output_file.write(yolo_formatted_label)

    print(f"Processed {base_filename} and saved the YOLO formatted label to {output_filepath}")

folder_path = '/Users/tuhinrc/Desktop/training_labels/labels_og'
output_path = '/Users/tuhinrc/Desktop/training_labels/labels'
image_folder = '/Users/tuhinrc/Desktop/MapObjDetctor/yolov5/DOTA/TrainingSplit/images'

image_dimensions = extract_image_dimensions(image_folder)

for filename in os.listdir(folder_path):
    if filename.endswith('.txt'):
        input_filepath = os.path.join(folder_path, filename)
        base_filename = os.path.splitext(filename)[0]
        output_filepath = os.path.join(output_path, f"{base_filename}.txt")

        process_file(input_filepath, output_filepath, image_dimensions)

        print(f"Processed {filename} and saved the YOLO formatted label to {output_filepath}")
