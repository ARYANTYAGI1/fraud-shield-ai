import Tesseract from 'tesseract.js';
import logger from '../config/logger';

/**
 * Extracts readable text from an image file using Tesseract OCR engine.
 */
export const extractTextFromImage = async (filePath: string): Promise<string> => {
  logger.info(`Starting OCR text extraction on image: ${filePath}`);
  try {
    const result = await Tesseract.recognize(
      filePath,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing' && Math.round(m.progress * 100) % 25 === 0) {
            logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    const text = result.data.text || '';
    logger.info(`OCR completed successfully. Extracted text length: ${text.length}`);
    return text.trim();
  } catch (error) {
    logger.error(`OCR processing failed for ${filePath}:`, error);
    throw new Error('Failed to extract text from the provided image screenshot');
  }
};

export default extractTextFromImage;
