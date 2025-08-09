import { Request, Response, NextFunction } from 'express';

export const badPathHandler = (req: Request, res: Response) => {
    console.error(`Bad path: ${req.url}`);
    res.status(404).json({ error: 'Not Found' });
}

export const errorHandler = (err: Error, _: Request, res: Response, next: NextFunction) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ error: err.message });
    next(err);
}