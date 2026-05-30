const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: {
          en: `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource`,
          hi: `इस संसाधन को देखने के लिए आपकी भूमिका (${req.user ? req.user.role : 'कोई नहीं'}) अधिकृत नहीं है`
        }
      });
    }
    next();
  };
};

export default authorize;
