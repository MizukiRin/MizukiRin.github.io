// src/content.config.ts
import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const blogSchema = z.object({
    title: z.string(),
    date: z.coerce.date(), // Automatically parses date strings to Date objects
    tags: z.array(z.string()).optional(),
    project: z.string().optional(), // Used to associate projects
    draft: z.boolean().optional().default(false), // Draft post support (hidden in production)
});

export const collections = {
    'tech': defineCollection({
        loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog/tech' }),
        schema: blogSchema
    }),
    'daily': defineCollection({
        loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog/daily' }),
        schema: blogSchema
    }),
    'diary': defineCollection({
        loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog/diary' }),
        schema: blogSchema
    }),
    'about': defineCollection({
        loader: glob({ pattern: '**/[^_]*.md', base: './src/content/about' })
    }),
    'projects': defineCollection({
        loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
        schema: z.object({
            title: z.string(),
            description: z.string(),
            tags: z.array(z.string()),
            github: z.string().optional(),
            docs: z.string().optional(),
            order: z.number().default(0),
        })
    }),
};


