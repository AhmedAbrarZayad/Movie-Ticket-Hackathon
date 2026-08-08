import { v2 as cloudinary } from 'cloudinary';

const requiredCloudinaryEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingCloudinaryEnv = requiredCloudinaryEnv.filter((key) => !process.env[key]);

if (missingCloudinaryEnv.length > 0) {
  console.warn(
    `[Cloudinary] Missing credential variables: ${missingCloudinaryEnv.join(', ')}. Add them to your .env file before using uploads.`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryService = {
  isConfigured() {
    return requiredCloudinaryEnv.every((key) => Boolean(process.env[key]));
  },

  async uploadImage(filePath, options = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.'
      );
    }

    const uploadOptions = {
      folder: 'movie-ticket-hackathon',
      resource_type: 'image',
      ...options,
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return result;
  },

  async deleteImage(publicId, options = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.'
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      ...options,
    });

    return result;
  },

  generateUrl(publicId, transformations = []) {
    if (!this.isConfigured()) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.'
      );
    }

    return cloudinary.url(publicId, {
      secure: true,
      transformation: transformations,
    });
  },
};

export default cloudinaryService;
