import { Request, Response, NextFunction } from 'express';
import { getUploadSignature } from '../services/cloudinaryService';

export const getSignature = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { folder } = req.query;
        // Force prefix or validation on folder if needed
        const signatureData = getUploadSignature(folder as string || 'codekori_uploads');
        res.json({ data: signatureData });
    } catch (error) {
        next(error);
    }
};
