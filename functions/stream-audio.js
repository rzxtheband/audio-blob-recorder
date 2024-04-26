const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require("stream");

const s3Client = new S3Client({
  region: "<your-region>",
  endpoint: "<your-ibm-cloud-endpoint>",
  credentials: {
    accessKeyId: "<your-access-key-id>",
    secretAccessKey: "<your-secret-access-key>",
  },
});

exports.handler = async (event) => {
  const command = new GetObjectCommand({
    Bucket: "<your-bucket-name>",
    Key: "uploaded_audio.wav",
  });

  const response = await s3Client.send(command);
  const readableStream = response.Body;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "audio/wav",
    },
    body: readableStream,
  };
};
