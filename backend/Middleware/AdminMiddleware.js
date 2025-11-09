// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  console.log("Checking admin access for user:", req.user);
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};