const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");

let User = require("./models/User");
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    { usernameField: "Username", passwordField: "Password" },
    async (username, password, callback) => {
      await User.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            return callback(null, false, {
              message: "Incorrect username or password",
            });
          }
          return callback(null, user);
        })
        .catch((error) => {
          if (error) {
            return callback(error);
          }
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "this_is_a_secret",
    },
    async (jwt_payload, callback) => {
      return await User.findById(jwt_payload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
