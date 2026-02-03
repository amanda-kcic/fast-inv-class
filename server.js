// ================== SETUP ==================
const fastify = require('fastify')({ logger: true });
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db/pool');

// Plugins
fastify.register(require('@fastify/view'), {
  engine: { ejs: require('ejs') },
  root: path.join(__dirname, 'views')
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

fastify.register(require('@fastify/formbody'));


// ================== ROUTES ==================

// Login page
fastify.get('/', (req, reply) => {
  return reply.view('login.ejs');
});

// Login logic
fastify.post('/login', async (req, reply) => {
  const { user_name, passwords } = req.body;

  const user = await pool.query(
    'SELECT * FROM users WHERE user_name=$1',
    [user_name]
  );

  if (user.rows.length === 0) {
    return reply.send("User not found");
  }

  const match = await bcrypt.compare(passwords, user.rows[0].passwords);

  if (match) {
    return reply.redirect('/dashboard');
  } else {
    return reply.send("Invalid password");
  }
});

// Dashboard
fastify.get('/dashboard', (req, reply) => {
  return reply.view('dashboard.ejs');
});

// Users page
fastify.get('/users', async (req, reply) => {
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

// Address form
fastify.get('/address', async (req, reply) => {
  const types = await pool.query('SELECT * FROM person_type');
  const users = await pool.query('SELECT * FROM users');

  return reply.view('address.ejs', {
    types: types.rows,
    users: users.rows
  });
});

// Address AJAX save
fastify.post('/address/create', async (req, reply) => {
  const { address_name, type_id, locations, pincode, user_id } = req.body;

  await pool.query(
    `INSERT INTO address (address_name, type_id, locations, pincode, user_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [address_name, type_id, locations, pincode, user_id]
  );

  return reply.send({ message: "Address added successfully" });
});


// ================== START SERVER (LAST) ==================
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  fastify.log.info(`Server listening at ${address}`);
});
