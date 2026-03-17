import asyncHandler from "../utils/asyncHandler.js";
import axios from "axios";


export const generateAIContent = asyncHandler(async (prompt) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = process.env.OPENAI_API_URL;

    const response = await axios.post(
        `${apiUrl}?key=${apiKey}`,
  {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  }
);
    return response.data;

});