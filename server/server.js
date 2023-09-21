const express = require('express');
const app = express();
const { exec } = require('child_process');

app.use(express.json());

app.post('/detect-objects', (req, res) => {
    const snapshot = req.body.snapshot;  // Base64-encoded image snapshot or image URL

    // Save the snapshot to a temporary image file
    // Code to save the snapshot to a file (you may need to handle this based on your backend setup)

    // Perform object detection using YOLOv5
    exec(`python yolov5/detect.py --weights yolov5/weights/best.pt --img-size 640 --conf 0.4 --source ${tempImagePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing YOLOv5: ${stderr}`);
            return res.status(500).json({ error: 'Error performing object detection' });
        }

        const detectedObjects = parseDetectionOutput(stdout);  // Parse the output to get detected objects
        return res.json({ detectedObjects });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
