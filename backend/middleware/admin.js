// Admin middleware - checks if user is admin
// NOTE: This should be used AFTER the protect middleware
exports.adminOnly = (req, res, next) => {
  // Check if user is authenticated and is admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

