const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Authorization Header:", authHeader); // Log header for debugging

  if (!authHeader)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  const token = authHeader.split(" ")[1]; // Extract the token after 'Bearer '
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. Invalid token format." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (err) {
    console.error("Token validation error:", err.message); // Log token validation error
    res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = authenticateToken;
