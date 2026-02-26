const fs = require('fs');
require('dotenv').config();

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await resp.json();

        let output = '--- AVAILABLE MODELS ---\n';
        if (data.models) {
            data.models.forEach(m => {
                output += `${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})\n`;
            });
        } else {
            output += 'NO MODELS FOUND\n' + JSON.stringify(data, null, 2);
        }

        fs.writeFileSync('models_list.txt', output);
        console.log('Model list written to models_list.txt');
    } catch (e) {
        fs.writeFileSync('models_list.txt', 'ERROR: ' + e.message);
    }
}

listModels();
