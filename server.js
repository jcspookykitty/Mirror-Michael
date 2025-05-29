import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import './auth.js'; // must include the .js extension with ESM

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send(`<h2>Mirror Michael Home</h2><a href="/auth/google">Login with Google</a>`);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send(`<h1>Welcome ${req.user.displayName}</h1><p>This is Mirror Michael's memory core.</p>`);
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

app.listen(PORT, () => console.log(`Mirror Michael running on port ${PORT}`));
