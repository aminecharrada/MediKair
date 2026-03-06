const catchAsyncErrors = require("./CatchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const Client = require("../models/clientModel");

// Admin authentication
exports.checkUserAuthentication = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization 
    && req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ErrorHandler("Please login again to access this resource", 401)
    );
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Admin.findById(decodedData.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});

// Client authentication
exports.checkClientAuthentication = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ErrorHandler("Veuillez vous connecter pour accéder à cette ressource", 401)
    );
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedData.role !== "client") {
      return next(new ErrorHandler("Accès non autorisé", 403));
    }
    const client = await Client.findById(decodedData.id);
    if (!client) {
      return next(new ErrorHandler("Client non trouvé", 401));
    }
    req.user = client;
    next();
  } catch (error) {
    return next(new ErrorHandler("Token invalide ou expiré", 401));
  }
});

exports.checkAdminPrivileges = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.privilege)) {  
      return next(
        new ErrorHandler(
          `Role: ${req.user.privilege} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};
