import { FileUpload } from 'graphql-upload/processRequest.mjs';

export const graphqlFileToMulterFile = async (
  file: FileUpload,
): Promise<Express.Multer.File> => {
  const { createReadStream, filename, mimetype, encoding } = file;

  // Convert stream to buffer
  const stream = createReadStream();
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  const buffer = Buffer.concat(chunks);

  return {
    fieldname: 'file',
    originalname: filename,
    filename,
    encoding,
    mimetype,
    buffer,
    size: buffer.length,
    stream: stream as any,
    destination: '',
    path: '',
  };
};
