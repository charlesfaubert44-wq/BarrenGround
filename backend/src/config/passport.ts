import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { UserModel } from '../models/User';

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
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Find or create user
          const user = await UserModel.findOrCreateOAuthUser({
            email,
            name,
            oauth_provider: 'google',
            oauth_provider_id: profile.id,
          });

          return done(null, user);
        } catch (error) {
          return done(error, undefined);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

// Serialize user for session (we won't use sessions, but passport requires this)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
