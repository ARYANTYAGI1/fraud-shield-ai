import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import Scan from '../models/Scan';
import AuditLog from '../models/AuditLog';
import { analyzeContent } from '../services/aiService';
import { extractTextFromImage } from '../services/ocrService';
import { extractTextFromPDF } from '../services/pdfService';
import { textScanSchema, urlScanSchema } from '../validators/scanValidator';
import logger from '../config/logger';

// Configure multer storage
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only Images (.jpg, .jpeg, .png) and PDFs (.pdf) are allowed'));
    }
  },
});

// Helper for cleaning up uploaded files
const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      logger.error(`Failed to delete temp file ${filePath}:`, err);
    } else {
      logger.debug(`Cleaned up temp file: ${filePath}`);
    }
  });
};

export const scanText = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validation = textScanSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    const { text } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await analyzeContent(text, 'text');

    const scan = new Scan({
      userId,
      scanType: 'text',
      inputData: text.length > 500 ? text.substring(0, 500) + '...' : text,
      result,
    });

    await scan.save();

    await AuditLog.create({
      userId,
      action: 'scan.text',
      details: { scanId: scan._id, riskScore: result.riskScore, category: result.category },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({
      message: 'Text analysis completed successfully',
      scan,
    });
  } catch (error: any) {
    logger.error('Text scanning error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const scanURL = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validation = urlScanSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    const { url } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await analyzeContent(url, 'url');

    const scan = new Scan({
      userId,
      scanType: 'url',
      inputData: url,
      result,
    });

    await scan.save();

    await AuditLog.create({
      userId,
      action: 'scan.url',
      details: { scanId: scan._id, url, riskScore: result.riskScore },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({
      message: 'URL analysis completed successfully',
      scan,
    });
  } catch (error: any) {
    logger.error('URL scanning error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const scanImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No image file uploaded' });
    return;
  }

  const filePath = req.file.path;
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const extractedText = await extractTextFromImage(filePath);

    if (!extractedText || extractedText.trim().length < 5) {
      res.status(400).json({
        message: 'Could not extract sufficient text from image. Ensure the image contains readable scan text.',
      });
      return;
    }

    const result = await analyzeContent(extractedText, 'image');

    const scan = new Scan({
      userId,
      scanType: 'image',
      inputData: `[OCR text from image: "${req.file.originalname}"]: ` + (extractedText.length > 300 ? extractedText.substring(0, 300) + '...' : extractedText),
      result,
    });

    await scan.save();

    await AuditLog.create({
      userId,
      action: 'scan.image',
      details: { scanId: scan._id, originalName: req.file.originalname, riskScore: result.riskScore },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({
      message: 'Image OCR scan completed successfully',
      scan,
      extractedText,
    });
  } catch (error: any) {
    logger.error('Image scan error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  } finally {
    deleteFile(filePath);
  }
};

export const scanPDF = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No PDF file uploaded' });
    return;
  }

  const filePath = req.file.path;
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const extractedText = await extractTextFromPDF(filePath);

    if (!extractedText || extractedText.trim().length < 5) {
      res.status(400).json({
        message: 'Could not extract sufficient text from PDF. Ensure the PDF contains digital text characters.',
      });
      return;
    }

    const result = await analyzeContent(extractedText, 'pdf');

    const scan = new Scan({
      userId,
      scanType: 'pdf',
      inputData: `[Text parsed from PDF: "${req.file.originalname}"]: ` + (extractedText.length > 300 ? extractedText.substring(0, 300) + '...' : extractedText),
      result,
    });

    await scan.save();

    await AuditLog.create({
      userId,
      action: 'scan.pdf',
      details: { scanId: scan._id, originalName: req.file.originalname, riskScore: result.riskScore },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({
      message: 'PDF scan completed successfully',
      scan,
      extractedText,
    });
  } catch (error: any) {
    logger.error('PDF scan error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  } finally {
    deleteFile(filePath);
  }
};
