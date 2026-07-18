import fs from 'fs';
import pdfParse from 'pdf-parse';
import logger from '../config/logger';

/**
 * Extracts readable text from a PDF document file buffer using pdf-parse.
 */
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  logger.info(`Starting PDF text extraction on file: ${filePath}`);
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsedData = await pdfParse(dataBuffer);
    const text = parsedData.text || '';
    logger.info(`PDF text extraction completed. Extracted text length: ${text.length}`);
    return text.trim();
  } catch (error) {
    logger.error(`PDF text extraction failed for ${filePath}:`, error);
    throw new Error('Failed to parse text from the uploaded PDF document');
  }
};

export default extractTextFromPDF;
