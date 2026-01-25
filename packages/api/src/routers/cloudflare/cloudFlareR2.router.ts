import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { cloudFlareR2Service } from './service/CloudFlareR2.service';

export const cloudFlareR2Router = createTRPCRouter({
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        folder: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { filename, contentType } = input;
      // You might want to prepend the folder to the filename here if needed
      // const key = input.folder ? `${input.folder}/${filename}` : filename;
      return await cloudFlareR2Service.getPresignedUploadUrl(filename, contentType);
    }),
});
