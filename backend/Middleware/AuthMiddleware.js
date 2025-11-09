import jwt from "jsonwebtoken";

// Use JWT secret from environment. In production we require this to be set.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET is not set in the environment. Exiting.');
  process.exit(1);
}

const SECRET = JWT_SECRET || 'dev-secret'; // dev fallback only

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Example: "Bearer eyJhbGciOiJI..."
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ message: "Invalid token", error: err.message });
    }
    console.log("Token decoded successfully. User:", user);
    req.user = user; // attach user info to request
    next();
  });
};

