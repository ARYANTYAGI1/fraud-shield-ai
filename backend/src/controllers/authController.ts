import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import logger from '../config/logger';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_session_jwt_key_123!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_jwt_key_456!';

// Helper to generate tokens
const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    const { name, email, password } = validation.data;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    await newUser.save();

    // Log the verification link to the console for testing
    logger.info(`[TEST MODE] Verification Link for ${email}: http://localhost:3000/verify-email?token=${verificationToken}`);

    // Create audit log
    await AuditLog.create({
      userId: newUser._id,
      action: 'auth.register',
      details: { email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    const { accessToken, refreshToken } = generateTokens(newUser);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = validation.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Create audit log
    await AuditLog.create({
      userId: user._id,
      action: 'auth.login',
      details: { email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ message: 'Refresh token is required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.warn('Refresh token verification failed:', error);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ message: 'Verification token is required' });
    return;
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: 'auth.verify_email',
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    const { email } = validation.data;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: 'User with this email does not exist' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    logger.info(`[TEST MODE] Reset Password Link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);

    await AuditLog.create({
      userId: user._id,
      action: 'auth.forgot_password',
      details: { email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({ message: 'Password reset instructions have been logged to console.' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    const { token, password } = validation.data;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: 'auth.reset_password',
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
