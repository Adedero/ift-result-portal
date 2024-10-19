const passport = require("../config/passport.config");

const authenticateWithPassport = (err, user, role) => {
  if (err) {
    return {
      success: false,
      status: 500,
      info: 'Error',
      message: 'Something happened. Try again later.'
    };
  }
  if (!user) {
    return {
      success: false,
      status: 401, info:
      'Unauthorized',
      message: 'Please log in to continue.'
    }
  }
  if (!user.role || user.role.toLowerCase() !== role.toLowerCase()) {
    return {
      success: false,
      status: 403,
      info: 'Forbidden',
      message: 'You are not allowed to access this resource.'
    };
  }
    
  return {
    success: true,
    status: 200,
    user: user,
  };
};

const showResponse = (res, auth) => {
  return res.status(auth.status).json({
    success: false,
    info: auth.info,
    message: auth.message,
  });
};

const authenticateJWT = {
  admin: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const auth = authenticateWithPassport(err, user, "ADMIN");
      if (!auth.success) return showResponse(res, auth)
      req.user = auth.user;
      next();
    })(req, res, next);
  },

  staff: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const auth = authenticateWithPassport(err, user, "STAFF");
      if (!auth.success) return showResponse(res, auth)
      req.user = auth.user;
      next();
    })(req, res, next);
  },

  student: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const auth = authenticateWithPassport(err, user, "STUDENT");
      if (!auth.success) return showResponse(res, auth)
      req.user = auth.user;
      next();
    })(req, res, next);
  }
};

module.exports = authenticateJWT;
