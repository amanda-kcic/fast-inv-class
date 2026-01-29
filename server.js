// CommonJs
const fastify = require('fastify')({
  logger: true
})
const pool=require('./db/pool.js')
const fastifyStatic = require('@fastify/static')
const bcryptjs=require('bcryptjs');

// Register fastify-static to serve static files
const path = require('path');

//registger view engine
fastify.register(require('@fastify/view'), {
  engine:{ejs:require('ejs')},
  root:path.join(__dirname,'views')
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

fastify.register(require('@fastify/formbody'));
// Serve index.html at root
fastify.get('/', (request, reply) => {
  return reply.view('login.ejs',{currentUser:"daniel"}); // index.html must be in the 'public' directory
});

fastify.get('/users', async(request, reply) => {
const roles=await pool.query('SELECT * FROM roles')

 
  try{
 return reply.view('users.ejs', { currentUser: "daniel" , roles:roles.rows})
  }catch(err){
    console.error(err)
    return reply.status(500).send('Server Error')
  }
})

//submit users

 // Handle form POST
  fastify.post('/users/create', async (req, reply) => {
    const { user_name, passwords, role_id } = req.body;
    console.log(req.body);
   

    try {
       let roleid =Number(role_id);
       //hash password
       const saltRounds=10;
       const hashedPassword=await bcryptjs.hash(passwords,saltRounds);
        await pool.query(
            "INSERT INTO users (user_name, passwords, role_id) VALUES ($1, $2, $3)",
            [user_name, hashedPassword, roleid]
        );

        return reply.send({ success: true, message: "User created" });

    } catch (err) {
        return reply.send({ success: false, message: err.message });
    }
});

// Run the server!
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  // Server is now listening on ${address}
  fastify.log.info(`server listening on ${address}`)
})