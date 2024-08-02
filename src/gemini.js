const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
let chat;

export async function initializeChat() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  chat = await model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
  getChatResponse("You are an elementary school teacher. Answer only in short paragraphs.")
}

export async function getChatResponse(input) {
  if (!chat) {
    await initializeChat();
  }

  const result = await chat.sendMessage(input);
  const response = await result.response;
  const text = await response.text();

  return text;
}