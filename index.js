const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk'); // Use aws-sdk for S3-compatible storage

const app = express();
const port = process.env.PORT || 3000;

// AWS S3 configuration for IBM Cloud Object Storage
const s3 = new AWS.S3({
  endpoint: 'https://s3.ams03.cloud-object-storage.appdomain.cloud', // IBM COS endpoint
  accessKeyId: 'a788ae4a61b1449e82d37513a9ec70c6', // Your IBM COS access key ID
  secretAccessKey: '44fec0bc4c716824ee1af9cfec4c091484cfcb8bf46b4aa1', // Your IBM COS secret access key
  s3ForcePathStyle: true, // Required for S3-compatible endpoints
  signatureVersion: 'v4', // Use V4 signature
});

const bucketName = 'audio-blob-recorder'; // Bucket name from environment variables

// Middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Serves index.html as the default page
});

// Multer setup for in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle audio upload
app.post('/upload', upload.single('audio'), async (req, res) => {
  const audioData = req.file.buffer;
  const key = `${Date.now()}_${req.file.originalname}`; // Unique key for the uploaded file
  
  try {
    await s3.putObject({
      Bucket: bucketName,
      Key: key,
      Body: audioData,
    }).promise();

    res.status(200).send({ message: 'Audio uploaded', key: key });
  } catch (error) {
    console.error("Error uploading to IBM Cloud Object Storage:", error);
    res.status(500).send({ message: 'Error uploading audio' });
  }
});

// Route to handle streaming audio
app.get('/stream/:key', async (req, res) => {
  const key = req.params.key;

  try {
    const objectData = await s3.getObject({
      Bucket: bucketName,
      Key: key,
    }).promise();

    res.setHeader('Content-Type', 'audio/mpeg'); // Content type for audio streaming
    res.send(objectData.Body);
  } catch (error) {
    console.error("Error streaming from IBM Cloud Object Storage:", error);
    res.status(500).send({ message: 'Error streaming audio' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
