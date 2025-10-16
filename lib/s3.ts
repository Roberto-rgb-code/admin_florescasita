import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validar que las variables de entorno estén configuradas
const validateS3Config = () => {
  const required = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  AWS S3 no está completamente configurado. Faltan: ${missing.join(', ')}`
    );
    return false;
  }

  return true;
};

const isS3Configured = validateS3Config();

// Cliente de S3 (solo si está configurado)
export const s3Client = isS3Configured
  ? new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

// Subir imagen a S3
export async function uploadImageToS3(
  file: File,
  folder: string = 'products'
): Promise<string> {
  if (!s3Client) {
    throw new Error('AWS S3 no está configurado. Por favor configura las variables de entorno.');
  }

  const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  // Convertir File a Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
    ACL: 'public-read', // Hacer la imagen pública
  });

  try {
    await s3Client.send(command);

    // Construir URL de la imagen
    if (process.env.AWS_CLOUDFRONT_DOMAIN) {
      return `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${fileName}`;
    }

    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Error al subir la imagen');
  }
}

// Eliminar imagen de S3
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  if (!s3Client) {
    console.warn('AWS S3 no está configurado. No se puede eliminar la imagen.');
    return;
  }

  try {
    // Extraer el key de la URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remover el primer "/"

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Error al eliminar la imagen');
  }
}

// Obtener URL firmada (para subidas seguras)
export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  folder: string = 'products'
): Promise<string> {
  if (!s3Client) {
    throw new Error('AWS S3 no está configurado');
  }

  const key = `${folder}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
    ACL: 'public-read',
  });

  // URL firmada válida por 5 minutos
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return signedUrl;
}

// Verificar si S3 está configurado
export function isS3Available(): boolean {
  return isS3Configured;
}
