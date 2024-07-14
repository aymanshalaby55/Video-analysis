const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

// Configure the path to the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

// Function to extract only the first frame
function extractFirstFrame(videoPath, outputFolder) {
    // Create output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        console.log(outputFolder);
        fs.mkdirSync(outputFolder);
    }
    // Run ffmpeg to extract only the first frame
    const savedFramePath = `image-${Date.now()}.jpg`;
    ffmpeg(videoPath)
        .on('filenames', function(filenames) {
            console.log('Will generate ' + filenames[0]); // Only log the first frame filename
        })
        .on('end', function() {
            console.log('Finished extracting the first frame');
        })
        .on('error', function(err) {
            console.error('Error extracting the first frame:', err);
        })
        .output(path.join(outputFolder, savedFramePath)) // Save only the first frame
        .frames(1) // Set to extract only 1 frame
        .run();
    return savedFramePath;
}

module.exports = {extractFirstFrame};