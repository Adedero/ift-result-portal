require("dotenv").config();
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const db = require("../database/db");
const secretOrKey = process.env.JWT_SECRET;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey
};

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
  try {
    const user = await db.User.findById(jwtPayload.id);
    if (user) {
      const safeUser = { id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName }
      return done(null, safeUser);
    }
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;