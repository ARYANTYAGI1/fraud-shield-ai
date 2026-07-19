import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import Scan from '../models/Scan';
import AuditLog from '../models/AuditLog';
import logger from '../config/logger';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Total Scans
    const totalScans = await Scan.countDocuments({ userId });

    // Count by category
    const categoryCounts = await Scan.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$result.category', count: { $sum: 1 } } },
    ]);

    const stats = {
      Safe: 0,
      Suspicious: 0,
      Fraud: 0,
      'High Risk Scam': 0,
      Critical: 0,
    };

    categoryCounts.forEach((c) => {
      if (c._id in stats) {
        stats[c._id as keyof typeof stats] = c.count;
      }
    });

    // Recent Scans
    const recentScans = await Scan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Trend analysis (group by day for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendData = await Scan.aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          averageRisk: { $avg: '$result.riskScore' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Audit logs for user actions
    const auditLogs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json({
      totalScans,
      categoryCounts: stats,
      recentScans,
      trendData,
      auditLogs,
    });
  } catch (error) {
    logger.error('Dashboard statistics fetch error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
