import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'guruconnect_secret_token_village_town_development_2026');
      
      // Get user from token and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          message: {
            en: 'Not authorized, user not found',
            hi: 'अधिकृत नहीं है, उपयोगकर्ता नहीं मिला'
          }
        });
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ 
        message: {
          en: 'Not authorized, token failed',
          hi: 'अधिकृत नहीं है, टोकन विफल रहा'
        }
      });
    }
  }

  if (!token) {
    res.status(401).json({ 
      message: {
        en: 'Not authorized, no token provided',
        hi: 'अधिकृत नहीं है, कोई टोकन नहीं दिया गया'
      }
    });
  }
};

export default protect;
