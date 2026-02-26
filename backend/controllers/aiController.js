const { GoogleGenerativeAI } = require("@google/generative-ai");

const handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.json({
                text: "The Gemini AI is currently in 'Training Mode' (API key missing). Please add your GEMINI_API_KEY to the backend .env file to enable live responses!",
                isBot: true
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // List of models verified to exist for this API key
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ];
        let lastError = null;
        let text = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const systemPrompt = `You are the CleanStreet Assistant, an AI helpdesk for a civic issues platform. 
                Your goal is to help citizens of CleanStreet with their complaints regarding:
                - Garbage disposal and waste management
                - Road issues like potholes and street lights
                - Water and sanitation problems
                - General public maintenance
                
                Keep your responses professional, helpful, and concise. 
                If a user asks how to report an issue, tell them to use the 'Report Issue' button in the dashboard or sidebar.
                If they ask about an existing complaint, tell them to check the 'Complaints' page for status updates.
                
                Citizen message: ${message}`;

                const result = await model.generateContent(systemPrompt);
                const response = await result.response;
                text = response.text();

                if (text) break; // Success!
            } catch (err) {
                console.error(`Failed with model ${modelName}:`, err.message);
                lastError = err;
                continue; // Try next model
            }
        }

        if (!text) throw lastError;

        res.json({ text, isBot: true });
    } catch (err) {
        console.error('Gemini API Error:', err);
        res.status(500).json({
            success: false,
            message: `AI Connection Error: ${err.message}`, // Exposing for debugging
            isBot: true
        });
    }
};

module.exports = { handleChat };
