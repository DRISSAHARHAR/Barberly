const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4000;

// Demo in-memory users store
// In production, replace with a real database.
const users = new Map();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'barberly-1-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  return next();
}

function renderWithFlash(req, res, view, extra = {}) {
  const message = req.session.message;
  req.session.message = null;
  res.render(view, { message, user: req.session.user || null, ...extra });
}

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return renderWithFlash(req, res, 'register');
});

app.post('/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    req.session.message = 'Email et mot de passe sont obligatoires.';
    return res.redirect('/register');
  }

  if (password.length < 6) {
    req.session.message = 'Le mot de passe doit contenir au moins 6 caractères.';
    return res.redirect('/register');
  }

  if (users.has(email)) {
    req.session.message = 'Cet email existe déjà.';
    return res.redirect('/register');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.set(email, { email, passwordHash });

  req.session.message = 'Compte créé. Connectez-vous.';
  return res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return renderWithFlash(req, res, 'login');
});

app.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const found = users.get(email);
  if (!found) {
    req.session.message = 'Identifiants invalides.';
    return res.redirect('/login');
  }

  const isValid = await bcrypt.compare(password, found.passwordHash);
  if (!isValid) {
    req.session.message = 'Identifiants invalides.';
    return res.redirect('/login');
  }

  req.session.user = { email: found.email };
  return res.redirect('/dashboard');
});

app.get('/dashboard', requireAuth, (req, res) => {
  return renderWithFlash(req, res, 'dashboard');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Barberly_1 auth web app running on http://localhost:${PORT}`);
});
