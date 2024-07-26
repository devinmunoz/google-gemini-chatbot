const { GoogleGenerativeAI } = require("@google/generative-ai");
//const fs = require("fs");
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);

export async function getChatResponse(input) {
    const model = genAI.getGenerativeModel(
        { model: "gemini-1.5-flash" }
    );

    const result = await model.generateContent(input);
    const response = await result.response;
    const text = await response.text();

    return text;
}

