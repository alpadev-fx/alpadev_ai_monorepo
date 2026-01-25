import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class CloudFlareR2Service {
  private client: S3Client | null = null;
  private config: {
    bucketName: string;
    publicDomain: string;
  } | null = null;

  private getClient(): S3Client {
    if (this.client) return this.client;

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKey = process.env.R2_ACCESS_KEY;
    const secretKey = process.env.R2_SECRET_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!accountId || !accessKey || !secretKey || !bucketName || !publicDomain) {
      throw new Error('Missing R2 environment variables');
    }

    this.config = { bucketName, publicDomain };

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });

    return this.client;
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<{ url: string; publicUrl: string; key: string }> {
    const client = this.getClient();

    const command = new PutObjectCommand({
      Bucket: this.config!.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(client, command, { expiresIn });

    return {
      url,
      publicUrl: `${this.config!.publicDomain}/${key}`,
      key,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const client = this.getClient();

    const command = new DeleteObjectCommand({
      Bucket: this.config!.bucketName,
      Key: key,
    });
    await client.send(command);
  }
}

export const cloudFlareR2Service = new CloudFlareR2Service();
