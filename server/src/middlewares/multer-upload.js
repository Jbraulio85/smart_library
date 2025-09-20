import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";

import cloudinary from "../../configs/cloudinary.js";
import bucket from "../../configs/firebase.js";

const sanitizeFileName = (originalname) => {
  const fileExtension = extname(originalname);
  const rawName = originalname.split(fileExtension)[0];
  return rawName.replace(/[^a-zA-Z0-9-_]/g, "-");
};

const createCloudinaryStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder,
    public_id: (req, file) => `${sanitizeFileName(file.originalname)}-${Date.now()}`,
  },
});

export const uploadFieldImage = multer({
  storage: createCloudinaryStorage('fields'),
  fileFilter: (req, file, cb) => cb(null, true),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadPaymentImage = multer({
  storage: createCloudinaryStorage('payments'),
  fileFilter: (req, file, cb) => cb(null, true),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadProfileImage = multer({
  storage: createCloudinaryStorage('profiles'),
  fileFilter: (req, file, cb) => cb(null, true),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadCourseImage = multer({
  storage: createCloudinaryStorage('courses'),
  fileFilter: (req, file, cb) => cb(null, true),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF o Word'));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const handleUploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo" });
  }

  try {
    const { originalname, buffer, mimetype } = req.file;
    const sanitizedName = sanitizeFileName(originalname);
    const filename = `documents/${Date.now()}-${uuidv4()}-${sanitizedName}${extname(originalname)}`;

    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: {
        contentType: mimetype,
      },
      public: true,
      resumable: false,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return res.status(201).json({
      message: "Documento subido correctamente",
      fileUrl: publicUrl,
      originalName: originalname,
    });
  } catch (error) {
    console.error("Error al subir a Firebase:", error);
    return res.status(500).json({ message: "Error al subir el documento" });
  }
};
