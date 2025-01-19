// middleware/authorizeRoles.js
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).send({ message: "Access Denied. No token provided." });
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).send({ message: "Access Denied. You do not have permission to perform this action." });
      }
  
      next();
    };
  };
  
  module.exports = authorizeRoles;
  