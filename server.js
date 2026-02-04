// ================== SETUP ==================
require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db/pool');

fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/formbody'));

fastify.register(require('@fastify/view'), {
  engine: { ejs: require('ejs') },
  root: path.join(__dirname, 'views')
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});


// ================== JWT HELPERS ==================
function generateToken(user) {
  return jwt.sign(
    { user_id: user.user_id, user_name: user.user_name },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function verifyJWT(req, reply, done) {
  const { token } = req.cookies;

  if (!token) {
    return reply.redirect('/');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    done();
  } catch (err) {
    return reply.redirect('/');
  }
}


// ================== ROUTES ==================

// Login page
fastify.get('/', (req, reply) => {
  return reply.view('login.ejs');
});

// Login logic with error messages
fastify.post('/login', async (req, reply) => {
  const { user_name, passwords } = req.body;

  const result = await pool.query(
    'SELECT * FROM users WHERE user_name=$1',
    [user_name]
  );

  if (result.rows.length === 0) {
    return reply.view('login.ejs', { error: "User not found" });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(passwords, user.passwords);

  if (!match) {
    return reply.view('login.ejs', { error: "Incorrect password" });
  }

  const token = generateToken(user);

  reply
    .setCookie('token', token, {
      httpOnly: true,
      path: '/'
    })
    .redirect('/dashboard');
});

// Logout
fastify.get('/logout', (req, reply) => {
  reply.clearCookie('token').redirect('/');
});

// Dashboard (Protected)
fastify.get('/dashboard', { preHandler: verifyJWT }, (req, reply) => {
  return reply.view('dashboard.ejs', { user: req.user });
});

// Users page (Protected)
fastify.get('/users', { preHandler: verifyJWT }, async (req, reply) => {
  const roles = await pool.query('SELECT * FROM roles');
  return reply.view('users.ejs', { roles: roles.rows });
});

// Create user
fastify.post('/users/create', async (req, reply) => {
  const { user_name, passwords, role_id } = req.body;

  const hashedPassword = await bcrypt.hash(passwords, 10);

  await pool.query(
    "INSERT INTO users (user_name, passwords, role_id) VALUES ($1, $2, $3)",
    [user_name, hashedPassword, Number(role_id)]
  );

  return reply.send({ message: "User created successfully" });
});

// Address form (Protected)
fastify.get('/address', { preHandler: verifyJWT }, async (req, reply) => {
  const types = await pool.query('SELECT * FROM person_type');
  const users = await pool.query('SELECT * FROM users');

  return reply.view('address.ejs', {
    types: types.rows,
    users: users.rows
  });
});

// Address AJAX save (Protected)
fastify.post('/address/create', { preHandler: verifyJWT }, async (req, reply) => {
  const { address_name, type_id, locations, pincode, user_id } = req.body;

  await pool.query(
    `INSERT INTO address (address_name, type_id, locations, pincode, user_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [address_name, type_id, locations, pincode, user_id]
  );

  return reply.send({ message: "Address added successfully" });
});


// ================== START SERVER (ALWAYS LAST) ==================
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  fastify.log.info(`Server listening at ${address}`);
});
