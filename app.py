from flask import Flask, render_template, request, jsonify
import os
import base64
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

app = Flask(__name__)

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
    temp_image_path = 'yolov5/DOTA/val/images/P0003.png'

    # Save the image to a temporary file
    with open(temp_image_path, 'wb') as temp_image:
        temp_image.write(snapshot_bytes)

    # Perform object detection using YOLOv5 on the temporary image
    detected_objects = perform_object_detection(temp_image_path)

    # Delete the temporary image file
    os.remove(temp_image_path)

    return jsonify({'detected_objects': detected_objects})

def perform_object_detection(image_path):
    # Initialize headless browser (assuming you're using Chrome)
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    driver = webdriver.Chrome(options=chrome_options)
    
    # Open the HTML file with the map
    driver.get('http://127.0.0.1:5000/')  # Update with your actual URL

    # Wait for the map to load (you may need to adjust the sleep time)
    time.sleep(5)

    # Capture a screenshot of the visible portion of the map
    screenshot_path = 'Outputs/screenshot.png'
    driver.save_screenshot(screenshot_path)
    
    # Close the browser
    driver.quit()

    # Process the screenshot for object detection
    detected_objects = process_screenshot_for_detection(screenshot_path)

    # Delete the screenshot file
    os.remove(screenshot_path)

    return detected_objects

def process_screenshot_for_detection(screenshot_path):
    # This is a placeholder for processing the screenshot for object detection
    # Replace this with your actual processing logic
    # You'll read the screenshot image and perform object detection
    # Return a list of detected objects
    # For now, we'll return a hardcoded list of objects for testing
    return ['object1', 'object2']


if __name__ == '__main__':
    app.run(debug=True)
