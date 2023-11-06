from flask import Flask, render_template, request, jsonify
import os
import base64
import torch
from PIL import Image

app = Flask(__name__)

# Load the YOLOv5 model
#model = torch.hub.load('ultralytics/yolov5', 'custom','/runs/train/exp14/weights/best.pt')
model = torch.hub.load('/Users/tuhinrc/Desktop/MapObjDetctor/yolov5', 'custom', path='/Users/tuhinrc/Desktop/MapObjDetctor/yolov5/runs/train/exp14/weights/best.pt', source='local')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect-objects', methods=['POST'])
def detect_objects():
    # Get the snapshot image data from the request
    snapshot_data = request.json['snapshot']  # Use request.json to access JSON data

    # Convert the base64 data to bytes
    snapshot_bytes = base64.b64decode(snapshot_data)

    # Define a path for a temporary image file
    temp_image_path = 'temp_snapshot.jpg'

    # Save the image to a temporary file
    with open(temp_image_path, 'wb') as temp_image:
        temp_image.write(snapshot_bytes)

    # Perform object detection using YOLOv5
    detected_objects = perform_object_detection(temp_image_path)

    # Delete the temporary image file
    os.remove(temp_image_path)

    # Return detected objects as JSON response
    response = {'detected_objects': detected_objects}
    return jsonify(response)

def perform_object_detection(image_path):
    # Load the image using PIL
    img = Image.open(image_path)

    # Perform object detection using YOLOv5
    results = model(img)

    # Get the detected objects and their coordinates
    detected_objects = []
    for pred in results.pred[0]:
        label = model.names[pred[-1]]
        bbox = pred[:4].tolist()  # [x_min, y_min, x_max, y_max]
        confidence = float(pred[4])
        detected_objects.append({'label': label, 'bbox': bbox, 'confidence': confidence})

    return detected_objects

if __name__ == '__main__':
    app.run(debug=True)
