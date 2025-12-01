import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            session: false, // Fix Issue 6: Disable session
            scope: ['email'], // Minor Issue: Reduce scope
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // If no user found with googleId, check if a user with this email already exists
                user = await User.findOne({ email: profile.emails?.[0]?.value });

                if (user) {
                    // If user exists but googleId is not set, link the Google profile
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        // user.name = profile.displayName; // Optionally update name if Google's is preferred
                        user.avatar = profile.photos?.[0]?.value;
                        await user.save();
                    }
                    return done(null, user);
                }

                // If no user found by googleId or email, create a new user
                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value,
                    avatar: profile.photos?.[0]?.value,
                    // Default role 'staff' as per user model
                    // Note: Role is not provided by Google OAuth, so it defaults to 'staff' or whatever is set in schema.
                });

                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// serialize
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// deserialize
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

export default passport;
