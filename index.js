const fs = require('fs');
const { fetch } = require('node-fetch');

const OPENAI_API_URL = "https://api.openai.com/v1/engines/text-embedding-ada-002/completions";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function embedText(text) {
    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: text })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API request failed with status ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].embedding;
}

async function main() {
    // 入力用の文章をロード
    const docs = JSON.parse(fs.readFileSync('docs.json', 'utf8'));

    const index = [];
    for (const doc of docs) {
        const embedding = await embedText(doc.body);
        index.push({
            title: doc.title,
            body: doc.body,
            embedding: embedding
        });
    }

    fs.writeFileSync('index.json', JSON.stringify(index, null, 2));
}

main().catch(error => {
    console.error("An error occurred:", error.message);
});
