import { z } from 'zod';

export const textScanSchema = z.object({
  text: z.string().min(5, 'Text content must be at least 5 characters long').max(100000, 'Content is too long (limit: 100,000 characters)'),
});

export const urlScanSchema = z.object({
  url: z.string().url('Invalid URL format (must include protocol, e.g. http:// or https://)'),
});
