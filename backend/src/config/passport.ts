import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { UserModel, User } from '../models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

// Configure Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
        passReqToCallback: true, // Enable access to req object
      },
      async (req: any, _accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check for shop context
          if (!req.shop) {
            return done(new Error('Shop context not found'), undefined);
          }

          // Find or create user with shop_id
          const user = await UserModel.findOrCreateOAuthUser({
            email,
            name,
            oauth_provider: 'google',
            oauth_provider_id: profile.id,
            shop_id: req.shop.id, // Add shop_id
          });

          return done(null, user as unknown as Express.User);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

// Serialize user for session (we won't use sessions, but passport requires this)
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    // Note: deserializeUser doesn't have access to req.shop
    // In our multi-tenant setup, we rely on JWT tokens instead of sessions
    const user = await UserModel.findById(id);
    done(null, user as unknown as Express.User);
  } catch (error) {
    done(error as Error, null);
  }
});

export default passport;
