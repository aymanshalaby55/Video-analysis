const AiModel = require('../models/AiModel');
const fs = require('fs');
const FormData = require('form-data');
const catchAsync = require('express-async-handler');
const axios = require('axios');

exports.analyzeVideo = catchAsync(async (req, res, next) => {
    // const modelId = req.params.modelId;

    // const aiModel = await AiModel.findById({ _id: modelId });
    const formData = new FormData();
    formData.append('video', fs.createReadStream("D:/Programming/Graduation-Project/x.mp4"));

    // Note: You do not need to log headers here unless debugging
    // console.log({...formData.getHeaders()})

    try {
        const response = await axios.post('http://127.0.0.1:5000/detect/detect', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity, // Increase max content length for larger files
            maxRedirects: 0, // Optional: Disable redirects if necessary
        });

        console.log(response.data);
        res.json({
            data: response.data
        });
    } catch (error) {
        next(error); // Pass errors to error handler
    }
});
