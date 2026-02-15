const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4100;

/**
 * Demo stores (in-memory)
 * - users: account data
 * - pendingOtps: registration verification codes
 */
const users = new Map();
const pendingOtps = new Map();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'barberly-2-secret',
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
  if (!req.session.user) return res.redirect('/login');
  return next();
}

function flash(req, message, type = 'info') {
  req.session.flash = { message, type };
}

function pullFlash(req) {
  const payload = req.session.flash || null;
  req.session.flash = null;
  return payload;
}

function render(req, res, view, extra = {}) {
  return res.render(view, {
    flash: pullFlash(req),
    user: req.session.user || null,
    ...extra
  });
}

function buildOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  return res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  return render(req, res, 'register');
});

app.post('/register', async (req, res) => {
  const firstName = String(req.body.firstName || '').trim();
  const lastName = String(req.body.lastName || '').trim();
  const phone = String(req.body.phone || '').trim();
  const role = req.body.role === 'BARBER' ? 'BARBER' : 'CLIENT';
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!firstName || !lastName || !phone || !email || !password) {
    flash(req, 'Tous les champs sont obligatoires.', 'error');
    return res.redirect('/register');
  }

  if (!/^\+?[0-9]{9,15}$/.test(phone)) {
    flash(req, 'Numéro de téléphone invalide.', 'error');
    return res.redirect('/register');
  }

  if (password.length < 6) {
    flash(req, 'Le mot de passe doit contenir au moins 6 caractères.', 'error');
    return res.redirect('/register');
  }

  if (users.has(email)) {
    flash(req, 'Cet email existe déjà.', 'error');
    return res.redirect('/register');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otpCode = buildOtpCode();

  pendingOtps.set(email, {
    email,
    firstName,
    lastName,
    phone,
    role,
    passwordHash,
    otpCode,
    createdAt: Date.now()
  });

  req.session.pendingEmail = email;
  flash(req, `Code OTP de démo: ${otpCode}`, 'info');
  return res.redirect('/verify-otp');
});

app.get('/verify-otp', (req, res) => {
  const pendingEmail = req.session.pendingEmail;
  if (!pendingEmail || !pendingOtps.has(pendingEmail)) {
    flash(req, 'Aucune inscription en attente.', 'error');
    return res.redirect('/register');
  }
  return render(req, res, 'verify-otp', { email: pendingEmail });
});

app.post('/verify-otp', (req, res) => {
  const pendingEmail = req.session.pendingEmail;
  const otp = String(req.body.otp || '').trim();

  if (!pendingEmail || !pendingOtps.has(pendingEmail)) {
    flash(req, 'Session OTP expirée. Recommencez.', 'error');
    return res.redirect('/register');
  }

  const payload = pendingOtps.get(pendingEmail);
  if (Date.now() - payload.createdAt > 1000 * 60 * 10) {
    pendingOtps.delete(pendingEmail);
    req.session.pendingEmail = null;
    flash(req, 'Code expiré. Recommencez l’inscription.', 'error');
    return res.redirect('/register');
  }

  if (otp !== payload.otpCode) {
    flash(req, 'Code OTP invalide.', 'error');
    return res.redirect('/verify-otp');
  }

  users.set(payload.email, {
    id: `usr_${Date.now()}`,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    role: payload.role,
    passwordHash: payload.passwordHash,
    createdAt: new Date().toISOString()
  });

  pendingOtps.delete(payload.email);
  req.session.pendingEmail = null;
  flash(req, 'Compte vérifié. Connectez-vous.', 'success');
  return res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  return render(req, res, 'login');
});

app.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const rememberMe = req.body.rememberMe === 'on';

  const found = users.get(email);
  if (!found) {
    flash(req, 'Identifiants invalides.', 'error');
    return res.redirect('/login');
  }

  const isValid = await bcrypt.compare(password, found.passwordHash);
  if (!isValid) {
    flash(req, 'Identifiants invalides.', 'error');
    return res.redirect('/login');
  }

  req.session.user = {
    id: found.id,
    email: found.email,
    firstName: found.firstName,
    lastName: found.lastName,
    phone: found.phone,
    role: found.role,
    createdAt: found.createdAt
  };

  if (rememberMe) {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
  } else {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24;
  }

  return res.redirect('/dashboard');
});

app.get('/dashboard', requireAuth, (req, res) => {
  const stats = {
    availableSlots: req.session.user.role === 'BARBER' ? 8 : 0,
    upcomingBookings: req.session.user.role === 'BARBER' ? 5 : 2,
    status: req.session.user.role === 'BARBER' ? 'Barbier actif' : 'Client actif'
  };

  return render(req, res, 'dashboard', { stats });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Barberly_2 auth web app running on http://localhost:${PORT}`);
});
