import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { cloudFlareR2Service } from './service/CloudFlareR2.service';

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
  "application/pdf", "text/csv",
];

export const cloudFlareR2Router = createTRPCRouter({
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string()
          .max(255)
          .regex(/^[a-zA-Z0-9._-]+$/, "Invalid filename characters"),
        contentType: z.string().refine(
          (ct) => ALLOWED_CONTENT_TYPES.includes(ct),
          "Content type not allowed"
        ),
        folder: z.string().regex(/^[a-zA-Z0-9_/-]+$/).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { filename, contentType } = input;
      // You might want to prepend the folder to the filename here if needed
      // const key = input.folder ? `${input.folder}/${filename}` : filename;
      return await cloudFlareR2Service.getPresignedUploadUrl(filename, contentType);
    }),
});
