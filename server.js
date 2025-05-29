// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./auth'); // import Google strategy

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ==== ROUTES ====

app.get('/', (req, res) => {
  res.send(`<h2>Mirror Michael Home</h2><a href="/auth/google">Login with Google</a>`);
});

// Start OAuth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback URL
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Protected route
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send(`<h1>Welcome ${req.user.displayName}</h1><p>This is Mirror Michael's memory core.</p>`);
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

app.listen(PORT, () => console.log(`Mirror Michael running on port ${PORT}`));
