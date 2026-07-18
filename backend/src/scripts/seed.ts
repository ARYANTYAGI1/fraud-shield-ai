import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import Scan from '../models/Scan';
import AuditLog from '../models/AuditLog';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fraud-shield';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected.');

    // Clear existing data
    console.log('Cleaning collections...');
    await User.deleteMany({});
    await Scan.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Collections cleaned.');

    // Create users
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('UserPass123!', salt);
    const adminHashedPassword = await bcrypt.hash('AdminPass123!', salt);

    const normalUser = new User({
      name: 'John Doe',
      email: 'user@fraudshield.ai',
      password: hashedPassword,
      role: 'user',
      isVerified: true,
    });

    const adminUser = new User({
      name: 'Admin Shield',
      email: 'admin@fraudshield.ai',
      password: adminHashedPassword,
      role: 'admin',
      isVerified: true,
    });

    await normalUser.save();
    await adminUser.save();
    console.log('Users created:');
    console.log(' - User: user@fraudshield.ai / UserPass123!');
    console.log(' - Admin: admin@fraudshield.ai / AdminPass123!');

    // Create Audit Logs
    console.log('Creating audit logs...');
    await AuditLog.create([
      {
        userId: normalUser._id,
        action: 'auth.register',
        details: { email: normalUser.email },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        userId: normalUser._id,
        action: 'auth.verify_email',
        details: { email: normalUser.email },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        userId: adminUser._id,
        action: 'auth.register',
        details: { email: adminUser.email },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    ]);

    // Create historic scans for normal user (spanning 7 days)
    console.log('Creating historical scans...');
    const now = new Date();
    const mockScans = [];

    // Helper to generate dates relative to today
    const daysAgo = (num: number) => {
      const d = new Date();
      d.setDate(now.getDate() - num);
      return d;
    };

    // Day -6 scans
    mockScans.push({
      userId: normalUser._id,
      scanType: 'text',
      inputData: 'Dear customer, your card is blocked. Please call 1800-333-XXXX to verify your account details.',
      result: {
        riskScore: 78,
        category: 'Fraud',
        confidence: 92,
        reasons: ['Suspicious urgency language', 'Requests direct call to non-official number', 'Threatens account block'],
        recommendation: 'Do not call the listed number. Contact your bank via their official helpline on the back of your card.',
        redFlags: ['Account blocking threat', 'Suspicious contact number'],
      },
      createdAt: daysAgo(6),
    });

    // Day -5 scans
    mockScans.push({
      userId: normalUser._id,
      scanType: 'url',
      inputData: 'http://netflix-secure-billing-update.support-login-portal.net',
      result: {
        riskScore: 92,
        category: 'High Risk Scam',
        confidence: 97,
        reasons: ['Typosquatting and brand impersonation (Netflix)', 'Unsecure plain HTTP connection', 'Registered on a suspicious domain name'],
        recommendation: 'Do not open or enter credentials. Block the sender who shared this link.',
        redFlags: ['Brand Impersonation', 'Fake portal domain'],
      },
      createdAt: daysAgo(5),
    });

    // Day -4 scans
    mockScans.push({
      userId: normalUser._id,
      scanType: 'text',
      inputData: 'Hey Mom, I lost my phone. This is my new number. Can you please transfer $500 for my taxi fare? Urgent.',
      result: {
        riskScore: 85,
        category: 'High Risk Scam',
        confidence: 89,
        reasons: ['Impersonation of family member', 'Urgent financial request', 'Direct cash transfer demand'],
        recommendation: 'Verify the identity of the family member using an alternative channel or phone number before sending money.',
        redFlags: ['Urgency', 'Family impersonation', 'Immediate funds request'],
      },
      createdAt: daysAgo(4),
    });

    mockScans.push({
      userId: normalUser._id,
      scanType: 'pdf',
      inputData: '[Text parsed from PDF: "invoice_10928_pending.pdf"]: Invoice for Cloud Services. Total due: $45.00. Please pay to official accounts.',
      result: {
        riskScore: 5,
        category: 'Safe',
        confidence: 95,
        reasons: ['No urgent threats detected', 'Legitimate invoice schema', 'Standard payment terms'],
        recommendation: 'Safe to process. Standard service charge billing invoice.',
        redFlags: [],
      },
      createdAt: daysAgo(4),
    });

    // Day -3 scans
    mockScans.push({
      userId: normalUser._id,
      scanType: 'url',
      inputData: 'https://paypal.com/signin',
      result: {
        riskScore: 2,
        category: 'Safe',
        confidence: 99,
        reasons: ['Official domain names with secure HTTPS connection', 'No phishing keywords', 'Legitimate global identity issuer'],
        recommendation: 'Safe link. This is the official PayPal sign-in portal.',
        redFlags: [],
      },
      createdAt: daysAgo(3),
    });

    // Day -2 scans
    mockScans.push({
      userId: normalUser._id,
      scanType: 'image',
      inputData: '[OCR text from image: "whatsapp_otp_chat.png"]: Your verification code is 882901. Do not share this code with anyone.',
      result: {
        riskScore: 40,
        category: 'Suspicious',
        confidence: 85,
        reasons: ['Contains one-time password code', 'Sharing codes online is highly discouraged'],
        recommendation: 'Keep this code private. Never share OTP codes with external agents or callers.',
        redFlags: ['Verification code present'],
      },
      createdAt: daysAgo(2),
    });

    // Day -1 scans
    mockScans.push({
      userId: normalUser._id,
      scanType: 'text',
      inputData: 'Congratulations! You have been selected for a work-from-home job earning $500/day. Click link to complete onboarding.',
      result: {
        riskScore: 82,
        category: 'Fraud',
        confidence: 94,
        reasons: ['Unsolicited job offer with abnormally high compensation', 'Lack of formal application details', 'Direct call to onboarding links'],
        recommendation: 'Ignore the offer. Fake work-from-home tasks are standard advance-fee collection scams.',
        redFlags: ['Unrealistic salary offer', 'Suspicious onboarding link'],
      },
      createdAt: daysAgo(1),
    });

    // Day 0 scans (Today)
    mockScans.push({
      userId: normalUser._id,
      scanType: 'url',
      inputData: 'http://block-security-alert-account-login.com/redirect',
      result: {
        riskScore: 98,
        category: 'High Risk Scam',
        confidence: 98,
        reasons: ['Unsecure phishing page', 'Key phrases related to security alerts on generic domains', 'Typosquatting details'],
        recommendation: 'Close this tab immediately. Do not log in.',
        redFlags: ['Suspicious domain keywords', 'Phishing redirection'],
      },
      createdAt: now,
    });

    mockScans.push({
      userId: normalUser._id,
      scanType: 'text',
      inputData: 'Hello John, just wanted to check if you are free for lunch tomorrow? Let me know.',
      result: {
        riskScore: 0,
        category: 'Safe',
        confidence: 98,
        reasons: ['Friendly personal communication', 'No requests for credentials, money, or clicks'],
        recommendation: 'Safe message. Standard peer-to-peer social chat.',
        redFlags: [],
      },
      createdAt: now,
    });

    // Save scans directly in database
    for (const scanData of mockScans) {
      const scan = new Scan(scanData);
      await scan.save();

      // Log scan audit
      await AuditLog.create({
        userId: normalUser._id,
        action: `scan.${scanData.scanType}`,
        details: { scanId: scan._id, riskScore: scanData.result.riskScore, category: scanData.result.category },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: scanData.createdAt,
      });
    }

    console.log(`Successfully seeded ${mockScans.length} scans and related audit logs.`);
    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
