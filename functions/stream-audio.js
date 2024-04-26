const { Handler } = require('@netlify/functions');
const { S3 } = require('aws-sdk');

const BUCKET_NAME = 'audio-blob-recorder';
const ACCESS_KEY = 'a788ae4a61b1449e82d37513a9ec70c6';
const SECRET_KEY = '44fec0bc4c716824ee1af9cfec4c091484cfcb8bf46b4aa1';

const s3 = new S3({
    endpoint: 'https://s3.ams03.cloud-object-storage.appdomain.cloud', // Adjust endpoint to your region
    accessKeyId: 'a788ae4a61b1449e82d37513a9ec70c6',
    secretAccessKey: '44fec0bc4c716824ee1af9cfec4c091484cfcb8bf46b4aa1',
    signatureVersion: 'v4'
});

const handler = async (event) => {
  const key = event.queryStringParameters.key; // Obtain the key of the audio to stream

  const getObjectParams = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    const stream = await s3.getObject(getObjectParams).createReadStream();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/wav' // Adjust as needed
      },
      body: stream
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error streaming audio: ${error.message}`
    };
  }
};

module.exports = { handler: Handler(handler) };
