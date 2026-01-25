import fs from 'fs';
import path from 'path';

import { PrismaClient } from '@package/db';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Construct path to root .env if needed, or rely on default

// If running from package root, .env might be in root
if (!process.env.R2_ACCOUNT_ID) {
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.R2_SECRET_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_BUCKET_NAME) {
  console.error('❌ Missing R2 environment variables');
  process.exit(1);
}

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

const prisma = new PrismaClient();

// Configuration
// Adjust this path based on where this script is located. Assuming it's in packages/api/src/scripts
const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), '../../apps/frontend/public/assets'); 
const TARGET_FOLDER = 'migrated-uploads'; // Folder in R2

async function uploadToR2(filePath: string, fileName: string): Promise<string> {
  const fileContent = fs.readFileSync(filePath);
  const key = `${TARGET_FOLDER}/${fileName}`;

  await S3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: getContentType(fileName), // Simple mime type helper
    }),
  );

  return `${R2_PUBLIC_DOMAIN}/${key}`;
}

function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

async function main() {
  console.log('🚀 Starting migration to Cloudflare R2...');

  // 1. Scan Local Directory
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    console.warn(`⚠️  Local uploads directory not found: ${LOCAL_UPLOADS_DIR}`);
    console.warn('Skipping file upload step. Checking DB only.');
  } else {
    const files = fs.readdirSync(LOCAL_UPLOADS_DIR);
    console.log(`Found ${files.length} files in ${LOCAL_UPLOADS_DIR}`);

    for (const file of files) {
      if (file === '.DS_Store' || file === '.gitkeep') continue;

      const filePath = path.join(LOCAL_UPLOADS_DIR, file);
      if (fs.statSync(filePath).isDirectory()) continue;

      try {
        console.log(`Uploading ${file}...`);
        const r2Url = await uploadToR2(filePath, file);
        console.log(`✅ Uploaded: ${r2Url}`);

        // OPTIONAL: Update specific records matching this filename if exact match known
        // But relying on DB scan is safer for loose references
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error);
      }
    }
  }

  // 2. Update Database Records (Generic Replace)
  console.log('\n🔄 Updating Database Records...');

  // Update Users
  // Note: Check if 'User' model exists in schema.prisma before running
  // Excluding for safety if model names differ, but user provided code assumes 'User'
  try {
      // @ts-ignore
      const users = await prisma.user.findMany({
        where: { image: { contains: '/uploads/' } },
      });

      console.log(`Found ${users.length} users with local images.`);

      for (const user of users) {
        if (!user.image) continue;
        const fileName = path.basename(user.image);
        const newUrl = `${R2_PUBLIC_DOMAIN}/${TARGET_FOLDER}/${fileName}`;

        // @ts-ignore
        await prisma.user.update({
          where: { id: user.id },
          data: { image: newUrl },
        });
        console.log(`Updated User ${user.email}: ${newUrl}`);
      }
  } catch (e) {
      console.warn("Skipping User update (Model might not exist/match):", e);
  }

  // Add more models here (Announcement, etc.)
  // Note: Announcement.attachments is a separate model 'Attachment'
  try {
      // @ts-ignore
      const attachments = await prisma.attachment.findMany({
        where: { fileUrl: { contains: '/uploads/' } },
      });

      console.log(`Found ${attachments.length} attachments with local files.`);
      for (const att of attachments) {
        if (!att.fileUrl) continue;
        const fileName = path.basename(att.fileUrl);
        const newUrl = `${R2_PUBLIC_DOMAIN}/${TARGET_FOLDER}/${fileName}`;

        // @ts-ignore
        await prisma.attachment.update({
          where: { id: att.id },
          data: { fileUrl: newUrl },
        });
        console.log(`Updated Attachment ${att.id}: ${newUrl}`);
      }
  } catch (e) {
      console.warn("Skipping Attachment update (Model might not exist/match):", e);
  }

  console.log('\n✅ Migration Completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
