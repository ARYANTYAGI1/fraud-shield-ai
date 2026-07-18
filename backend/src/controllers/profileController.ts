import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import User from '../models/User';
import Scan from '../models/Scan';
import logger from '../config/logger';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const scanCount = await Scan.countDocuments({ userId });

    res.status(200).json({
      user,
      scanCount,
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { page = 1, limit = 10, search = '', scanType = '', category = '' } = req.query;

  try {
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const query: any = { userId };

    if (search) {
      query.$or = [
        { inputData: { $regex: search, $options: 'i' } },
        { 'result.reasons': { $regex: search, $options: 'i' } },
        { 'result.recommendation': { $regex: search, $options: 'i' } },
      ];
    }

    if (scanType) {
      query.scanType = scanType;
    }

    if (category) {
      query['result.category'] = category;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const scans = await Scan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Scan.countDocuments(query);

    res.status(200).json({
      scans,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Scan history query error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
