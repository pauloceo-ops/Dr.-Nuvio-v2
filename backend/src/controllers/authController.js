const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prepare } = require('../config/database');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = (req, res) => {
  try {
    const { name, email, password, modules } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const existingUser = prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const modulesJson = JSON.stringify(modules || ['juridico', 'condominio']);

    const result = prepare(
      'INSERT INTO users (name, email, password, modules) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashedPassword, modulesJson);

    const user = prepare('SELECT id, name, email, role, modules, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    user.modules = JSON.parse(user.modules);

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.modules = JSON.parse(userWithoutPassword.modules);

    const token = generateToken(user);
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.me = (req, res) => {
  try {
    const user = prepare('SELECT id, name, email, role, modules, avatar_url, created_at FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    user.modules = JSON.parse(user.modules);
    res.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
