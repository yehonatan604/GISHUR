import z from "zod";

export const DbActionSchema = z.object({
    action: z.enum([
        "findOne",
        "find",
        "countDocuments",
        "create",
        "insertMany",
        "updateOne",
        "updateMany",
        "deleteOne",
        "deleteMany",
        "aggregate",
    ]),
    collection: z.string(),

    filter: z.record(z.any()).optional(),
    projection: z.any().optional(),
    sort: z.any().optional(),
    limit: z.number().int().positive().max(1000).optional(),
    options: z.record(z.any()).optional(),

    payload: z.any().optional(),
    update: z.any().optional(),
    pipeline: z.array(z.any()).optional(),

    maxTimeMS: z.number().int().positive().max(30000).optional(),
});