const { Readable } = require('stream');
const { spawn } = require('child_process');
const speech = require('@google-cloud/speech');
require('dotenv').config();

const audioStream = new Readable();
audioStream._read = () => {};

let arecord = spawn('arecord', ['-f', 'S16_LE', '-r', '44100', '-c', '1', '-']);
arecord.stdout.on('data', chunk => {
    audioStream.push(chunk);
});
arecord.stderr.on('data', err => {
    console.error(`arecord error: ${err}`);
});

const client = new speech.SpeechClient({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
        "type": "service_account",
        "project_id": process.env.GOOGLE_PROJECT_ID,
        "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
        "private_key": process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.GOOGLE_CLIENT_EMAIL,
        "client_id": process.env.GOOGLE_CLIENT_ID,
        "auth_uri": process.env.GOOGLE_AUTH_URI,
        "token_uri": process.env.GOOGLE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.GOOGLE_CLIENT_X509_CERT_URL,
        "universe_domain": process.env.GOOGLE_UNIVERSE_DOMAIN
    }
});

const request = {
    config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 44100,
        languageCode: 'tr-TR',
    },
    interimResults: false,
};

let dynamicVariable = ""

const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', ((data) => {
        process.stdout.write(
            data.results[0] && data.results[0].alternatives[0]
                ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                : '\n\nReached transcription time limit, press Ctrl+C\n'
        )
        dynamicVariable = data.results[0].alternatives[0].transcript
        })
    );

audioStream.pipe(recognizeStream);

console.log('Listening, press Ctrl+C to stop.');

let startAudioProcess = () => {
    arecord = spawn('arecord', ['-f', 'S16_LE', '-r', '44100', '-c', '1', '-']);
}

let getDynamicVariable = () => {return dynamicVariable}


module.exports = { getDynamicVariable, startAudioProcess }