import axios from "axios";

export const geminiGenerate = async (contents) => {
    const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const res = await axios.post(
        url,
        {
            contents
        },
        {
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            }
        }
    );

    const text = res.data.candidates[0].content.parts[0].text;
    if (!text) {
        throw new Error("No response from Gemini API");
    }
    return text
};


// import OpenAI from "openai";

// const openai = new OpenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });

// export { openai };