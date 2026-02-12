import { z } from 'zod';

export const heirSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
});

export const vaultEntrySchema = z.object({
    title: z.string().min(1, "Title is required"),
    encrypted_content: z.string().min(1, "Content is required"),
    category: z.enum(['message', 'key', 'document']).default('message'),
});
