import { v2 as cloudinary } from 'cloudinary';

// Check for missing env vars early or when class used
// process.env.CLOUDINARY_CLOUD_NAME, etc.

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const getUploadSignature = (folder: string = 'codekori_general') => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder
    }, process.env.CLOUDINARY_API_SECRET!);

    return {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder
    };
};
