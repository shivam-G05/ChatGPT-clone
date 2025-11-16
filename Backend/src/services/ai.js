const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({});

// Import tools
const weatherTool = require("../../tools/weather");
const datetimeTool = require("../../tools/datetime");
const newsTool = require("../../tools/news");

// Map tool names to functions
const toolsMap = {
    weather: weatherTool,
    datetime: datetimeTool,
    news: newsTool
};

// 1. MAIN FUNCTION TO GENERATE AI RESPONSE (HANDLE TOOL CALLS)
async function generateResponse(messages) {
    let modelResponse = await callModel(messages);

    // If model requests a tool
    while (isToolCall(modelResponse)) {
        const toolCall = JSON.parse(modelResponse.text);

        const toolName = toolCall.tool;
        const toolInput = toolCall.input;

        const toolFn = toolsMap[toolName];

        if (!toolFn) {
            return `❌ Unknown tool requested: ${toolName}`;
        }

        // Run tool
        const toolResult = await toolFn(toolInput);

        // Send tool output BACK to model
        const newMessages = [
            ...messages,
            {
                role: "tool",
                parts: [{ text: JSON.stringify(toolResult) }]
            }
        ];

        modelResponse = await callModel(newMessages);
    }

    return modelResponse.text;
}

// 2. LOW-LEVEL CALL TO GEMINI
async function callModel(contents) {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: {
            temperature: 0.4,
            systemInstruction: systemPrompt
        }
    });

    return response;
}

// 3. CHECK IF MODEL OUTPUT IS A TOOL CALL
function isToolCall(response) {
    try {
        const text = response.text.trim();

        if (!text.startsWith("{")) return false;

        const json = JSON.parse(text);

        return json.tool && json.input;
    } catch {
        return false;
    }
}

// 4. VECTOR EMBEDDINGS
async function generateVector(content) {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
        config: {
            outputDimensionality: 768
        }
    });

    return response.embeddings[0].values;
}

// 5. SYSTEM PROMPT — EXACT SAME AS BEFORE
const systemPrompt = `
<persona>
<name>Aurora</name>
<mission>Be a helpful, accurate AI with a playful, upbeat vibe.</mission>
<voice>Friendly, concise, light Gen-Z energy.</voice>
</persona>

<customTools>
You have access to backend tools:

1. Weather  
   {
     "tool": "weather",
     "input": { "city": "Delhi" }
   }

2. Datetime  
   {
     "tool": "datetime",
     "input": {}
   }

3. News  
   {
     "tool": "news",
     "input": { "topic": "technology" }
   }

When needed → output ONLY the JSON above.
The backend will execute the tool and send you the result.
</customTools>
`;

module.exports = {
    generateResponse,
    generateVector
};
