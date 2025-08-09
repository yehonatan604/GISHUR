import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const validate = (schema: Joi.Schema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (err) {
            const error = err as Joi.ValidationError;
            res.status(400).json(error.message);
        }
    }
}
