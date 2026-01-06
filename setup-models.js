const fs = require('fs');
const path = require('path');
const axios = require('axios');

const modelsDir = path.join(__dirname, 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir);
    console.log('Created models directory');
}

const baseUrl = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

const files = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

async function downloadFile(filename) {
    const filePath = path.join(modelsDir, filename);
    if (fs.existsSync(filePath)) {
        console.log(`Skipping ${filename} (exists)`);
        return;
    }

    console.log(`Downloading ${filename}...`);
    try {
        const response = await axios({
            method: 'get',
            url: `${baseUrl}/${filename}`,
            responseType: 'stream',
            timeout: 60000, // Increased timeout to 60s
            headers: { 'User-Agent': 'Mozilla/5.0' } // Add User-Agent
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Downloaded ${filename}`);
                resolve();
            });
            writer.on('error', (err) => {
                console.error(`File write error for ${filename}:`, err);
                reject(err);
            });
        });
    } catch (error) {
        console.error(`Error downloading ${filename}:`, error.message);
        // Clean up partial file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

async function main() {
    console.log('Starting model download...');
    for (const file of files) {
        await downloadFile(file);
        // Add delay between downloads
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('Download process completed.');
}

main();
