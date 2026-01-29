const {Pool}=require('pg');

const pool=new Pool({
    user:'postgres',
    host:'localhost',
    database:'fastinv_class',
    password:'Welcome@123',
    port:5432,
})

module.exports=pool;