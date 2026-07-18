import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import User from '../models/User';
import Scan from '../models/Scan';
import AuditLog from '../models/AuditLog';
import logger from '../config/logger';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalScans = await Scan.countDocuments();
    const totalAuditLogs = await AuditLog.countDocuments();

    // Scan type distribution
    const typeCounts = await Scan.aggregate([
      { $group: { _id: '$scanType', count: { $sum: 1 } } },
    ]);

    const scanTypes = {
      text: 0,
      url: 0,
      image: 0,
      pdf: 0,
      audio: 0,
    };

    typeCounts.forEach((t) => {
      if (t._id in scanTypes) {
        scanTypes[t._id as keyof typeof scanTypes] = t.count;
      }
    });

    // Category distribution
    const categoryCounts = await Scan.aggregate([
      { $group: { _id: '$result.category', count: { $sum: 1 } } },
    ]);

    const riskCategories = {
      Safe: 0,
      Suspicious: 0,
      Fraud: 0,
      'High Risk Scam': 0,
      Critical: 0,
    };

    categoryCounts.forEach((c) => {
      if (c._id in riskCategories) {
        riskCategories[c._id as keyof typeof riskCategories] = c.count;
      }
    });

    res.status(200).json({
      totalUsers,
      totalScans,
      totalAuditLogs,
      scanTypes,
      riskCategories,
    });
  } catch (error) {
    logger.error('Admin stats query error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAdminUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Admin users query error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAdminScans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, search = '', scanType = '', category = '' } = req.query;

  try {
    const query: any = {};

    if (search) {
      query.$or = [
        { inputData: { $regex: search, $options: 'i' } },
        { 'result.reasons': { $regex: search, $options: 'i' } },
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
      .populate('userId', 'name email')
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
    logger.error('Admin scans query error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteAdminScan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const scan = await Scan.findByIdAndDelete(id);
    if (!scan) {
      res.status(404).json({ message: 'Scan not found' });
      return;
    }

    // Log deletion
    await AuditLog.create({
      userId: req.user?.id,
      action: 'admin.scan.delete',
      details: { scanId: id, targetUserId: scan.userId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({ message: 'Scan deleted successfully by administrator' });
  } catch (error) {
    logger.error('Admin scan delete error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
