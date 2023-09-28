const express = require('express');
const app = express();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cors = require("cors");
app.use(cors({ origin: true, credentials: true }));
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10000mb' }));

// app.use(express.json());

// Serve the HTML file for the root URL
app.use(express.static("client"));
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
});


app.post('/save-captured-image', (req, res) => {
    const { image } = req.body;

    // Remove the data URL prefix (e.g., 'data:image/png;base64,')
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    // Create a unique filename or use a timestamp-based name
    const fileName = `captured_${Date.now()}.png`;

    // Specify the path to the "image" folder
    const imagePath = path.join(__dirname, 'image', fileName);

    // Write the base64 data to a PNG file
    fs.writeFile(imagePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ error: 'Error saving image' });
        }

        console.log('Image saved successfully');

        const detect = path.join(__dirname, 'yolov5', 'detect.py');
        const best = path.join(__dirname, 'yolov5', 'weights', 'best.pt');

        // Find the highest existing experiment number in the "yolov5/runs/detect" directory
        const detectDir = path.join(__dirname, 'yolov5', 'runs', 'detect');
        const existingExpFolders = fs.readdirSync(detectDir).filter(folder => folder.startsWith('exp'));
        const highestExp = existingExpFolders.reduce((max, folder) => {
            const number = parseInt(folder.replace('exp', ''), 10);
            return number > max ? number : max;
        }, 0);

        const newExpFolder = `exp${highestExp + 1}`; // Increment the folder name

        console.log(newExpFolder);
        // Perform object detection using YOLOv5 on the saved PNG file
        exec(`python3 ${detect} --weights yolov5x6.pt --source ${imagePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing YOLOv5: ${stderr}`);
                return res.status(500).json({ error: 'Error performing object detection' });
            }
            console.log(stderr);

            const detectedObjects = parseDetectionOutput(stdout);  // Parse the output to get detected objects
            return res.json({ detectedObjects });
        });
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
