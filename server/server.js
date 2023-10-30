const express = require('express');
const app = express();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cors = require("cors");
app.use(cors({ origin: true, credentials: true }));
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10000mb' }));
const multer = require('multer');

// app.use(express.json());

// Serve the HTML file for the root URL
app.use(express.static("client"));
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
});

app.use(express.static("client"));
app.get("/training", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "training.html"));
});

app.use(express.static("client"));
app.get("/pretrained", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "pretrained.html"));
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
        // Find the highest existing experiment number in the "yolov5/runs/detect" directory
        const detectDir = path.join(__dirname, 'runs', 'detect');
        const existingExpFolders = fs.readdirSync(detectDir).filter(folder => folder.startsWith('predict'));
        const highestExp = existingExpFolders.reduce((max, folder) => {
            const number = parseInt(folder.replace('predict', ''), 10);
            return number > max ? number : max;
        }, 0);
        const newExpFolder = `predict${highestExp + 1}`; // Increment the folder name
        const imagePer = path.join(__dirname, 'runs', 'detect', newExpFolder, fileName);
        // Perform object detection using YOLOv5 on the saved PNG file

        // !yolo detect predict model='/Users/tuhinrc/Desktop/best_models/dota_3epch/best.pt' source='/Users/tuhinrc/Desktop/yolov8_testing/Screenshot 2023-10-16 at 11.46.08 AM.png' 
        exec(`yolo detect predict model='/Users/tuhinrc/Desktop/newnew/MapObjDetctor/server/best.pt' source='${imagePath}'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing YOLOv8: ${stderr}`);
                return res.status(500).json({ error: 'Error performing object detection' });
            }
            console.log(stderr);
            // Instead of reading the processed image from a file, you can directly convert it to base64
            const processedImageData = fs.readFileSync(imagePer, 'base64');
            // Send the processed image as base64 in the response
            return res.json({ processedImage: processedImageData });
        });
    });
});



app.post('/upload', (req, res) => {
    const data = req.body; // Access JSON data from the request body

    // Process the data as needed
    const imageBase64 = data.imageBase64;
    const labelBase64 = data.labelBase64;
    const imageFileName = `${data.imageFileName}.png`; // Set the image file name with the '.png' extension
    const labelFileName = `${data.labelFileName}.txt`; // Set the label file name with the '.txt' extension

    // Function to convert Base64 to a file and save it
    function base64ToFile(base64Data, filePath) {
        const base64Image = base64Data.replace(/^data:image\/png;base64,/, ""); // Remove data URI prefix
        const buffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(filePath, buffer);
    }

    // Generate file paths
    const imageFilePath = path.join(__dirname, 'client', 'annotations', 'images', imageFileName);
    const labelFilePath = path.join(__dirname, 'client', 'annotations', 'labels', labelFileName);

    // Convert Base64 to files and save them
    base64ToFile(imageBase64, imageFilePath);
    base64ToFile(labelBase64, labelFilePath);

    res.send('Files saved successfully on the server.');
});


app.get('/training-from-scratch', (req, res) => {
    const train = path.join(__dirname, 'yolov5', 'train.py');
    
    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    
    const cmd = `python3 ${train} --data data.yaml --weights '' --cfg yolov5s.yaml --epochs 10`;

    const childProcess = exec(cmd);

    childProcess.stderr.on('data', (data) => {
        // Send stderr data as SSE messages
        res.write(`data: ${data}\n\n`);
    });

    childProcess.on('close', (code) => {
        // Close the SSE connection when the child process is done
        res.end(`data: Process exited with code ${code}\n\n`);
    });

    childProcess.on('error', (error) => {
        console.error(`Error executing YOLOv5: ${error}`);
        res.status(500).end(`data: Error performing training Model\n\n`);
    });
});


app.get('/training-from-pretrained', (req, res) => {
    const train = path.join(__dirname, 'yolov5', 'train.py');
    
    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    
    const cmd = `python3 ${train} --data data.yaml --weights yolov5x6.pt --epochs 10`;

    const childProcess = exec(cmd);

    childProcess.stderr.on('data', (data) => {
        // Send stderr data as SSE messages
        res.write(`data: ${data}\n\n`);
    });

    childProcess.on('close', (code) => {
        // Close the SSE connection when the child process is done
        res.end(`data: Process exited with code ${code}\n\n`);
    });

    childProcess.on('error', (error) => {
        console.error(`Error executing YOLOv5: ${error}`);
        res.status(500).end(`data: Error performing training Model\n\n`);
    });
});




app.listen(3000, () => {
    console.log('Server is running on port 3000');
});