// Middleware to check if user is admin
const admin = (req, res, next) => {
  try {
    // Check if user exists and is admin (auth middleware must run first)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    res.status(500).json({ message: 'Server error in admin verification' });
  }
};

module.exports = admin;
