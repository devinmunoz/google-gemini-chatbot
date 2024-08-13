const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

const uploadsFolder = path.join(__dirname, "uploads");

const router = express.Router();

router.use(fileUpload());

router.post('/', async(req, res) => {
    const { image } = req.files;
    const uniqueFileName = `upload_${Date.now()}.jpg`; // Generate a unique file name
    const filePath = path.join(uploadsFolder, uniqueFileName);

    // Move the uploaded file to the uploads folder
    image.mv(filePath, async (err) => {
        if (err) {
            return res.status(500).json({ message: 'File upload failed', error: err });
        }

        try {
            // Process the file with Gemini API after it has been successfully moved
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent([
                "What is in this photo?",
                {inlineData: {data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                mimeType: 'image/jpeg'}}]);

            console.log(result.response.text());

            // Return the URL to access the uploaded image
            res.status(200).json({ 
                message: 'ok', 
                result: result.response.text(),
                imageUrl: `/uploads/${uniqueFileName}` // Return the unique image URL
            });
        } catch (err) {
            res.status(500).json({ message: 'Error processing image with Gemini', error: err });
        }
    });
});

module.exports = router;
