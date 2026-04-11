#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ML_DIR = path.join(__dirname, 'ml-output');
const TEXT_FILE = path.join(ML_DIR, 'damage-report-text.txt');

// --- read ML text ---
if (!fs.existsSync(TEXT_FILE)) {
    console.error('ML text not found:', TEXT_FILE);
    process.exit(1);
}
const mlText = fs.readFileSync(TEXT_FILE, 'utf8');

// --- find optional image ---
let imageB64 = null;
let imageMime = null;
for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const p = path.join(ML_DIR, 'damage-image.' + ext);
    if (fs.existsSync(p)) {
        imageB64 = fs.readFileSync(p).toString('base64');
        imageMime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        break;
    }
}

// --- check key ---
if (!process.env.OPENAI_API_KEY) {
    console.error('Set OPENAI_API_KEY in .env');
    process.exit(1);
}

// --- call OpenAI ---
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const userContent = [
    {
        type: 'text',
        text:
            'From this ML damage report, produce qualitative JSON with keys: ' +
            'severity_narrative, visible_damage_notes, recommended_actions (array), risk_level, data_quality.\n\n' +
            '--- ML REPORT ---\n' + mlText + '\n--- END ---'
    }
];

if (imageB64) {
    userContent.push({
        type: 'image_url',
        image_url: { url: 'data:' + imageMime + ';base64,' + imageB64 }
    });
}

client.chat.completions
    .create({
        model: process.env.OPENAI_DAMAGE_MODEL || 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are a fleet/motor-claims analyst. Respond ONLY with valid JSON.' },
            { role: 'user', content: userContent }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1200
    })
    .then(function (res) {
        console.log(res.choices[0].message.content);
    })
    .catch(function (err) {
        console.error(err.message || err);
        process.exit(1);
    });
