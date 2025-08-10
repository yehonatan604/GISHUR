import type { RequestHandler } from 'express';
import type { ZodSchema } from '@bridgepoint/zod-schemas';

type Part = 'body' | 'query' | 'params' | 'headers';

export const validate = (part: Part, schema: ZodSchema): RequestHandler =>
    async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync((req)[part]);
            (req as any)[part] = parsed;
            next();
        } catch (e: any) {
            res.status(400).json({ error: 'ValidationError', issues: e?.issues ?? [] });
        }
    };
