const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const { Readable } = require("stream");
const formidable = require("formidable");

const s3Client = new S3Client({
  region: "<your-region>",
  endpoint: "<your-ibm-cloud-endpoint>",
  credentials: {
    accessKeyId: "<your-access-key-id>",
    secretAccessKey: "<your-secret-access-key>",
  },
});

exports.handler = async (event) => {
  const form = new formidable.IncomingForm();
  const parsedData = await new Promise((resolve, reject) => {
    form.parse(event, (err, fields, files) => {
      if (err) reject(err);
      resolve(files.audio);
    });
  });

  const audioStream = fs.createReadStream(parsedData.filepath);
  const command = new PutObjectCommand({
    Bucket: "<your-bucket-name>",
    Key: "uploaded_audio.wav",
    Body: audioStream,
  });

  await s3Client.send(command);

  return {
    statusCode: 200,
    body: "Audio uploaded successfully!",
  };
};
