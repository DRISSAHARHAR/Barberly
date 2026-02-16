import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret
    },
    async (payload, done) => {
      try {
        done(null, {
          id: payload.sub,
          email: payload.email
        });
      } catch (error) {
        done(error, false);
      }
    }
  )
);

export default passport;
