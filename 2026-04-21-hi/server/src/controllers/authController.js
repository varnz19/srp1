import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { buildPreferenceVector } from '../utils/vector.js';

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
    createdAt: user.createdAt
  };
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user), user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}

export async function updatePreferences(req, res, next) {
  try {
    req.user.preferences = {
      genres: req.body.genres || [],
      people: req.body.people || [],
      moods: req.body.moods || [],
      platforms: req.body.platforms || [],
      contentTypes: req.body.contentTypes || [],
      vector: buildPreferenceVector(req.body)
    };
    await req.user.save();
    res.json({ user: serializeUser(req.user) });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    if (email && email !== req.user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'Email already registered' });
      req.user.email = email;
    }
    if (name) req.user.name = name;

    if (newPassword) {
      const userWithPassword = await User.findById(req.user._id).select('+password');
      if (!currentPassword || !(await userWithPassword.comparePassword(currentPassword))) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      req.user.password = newPassword;
    }

    await req.user.save();
    res.json({ token: signToken(req.user), user: serializeUser(req.user) });
  } catch (error) {
    next(error);
  }
}
