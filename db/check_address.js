const pool = require('./pool');

(async () => {
  try {
    const res = await pool.query('SELECT * FROM address ORDER BY address_id DESC LIMIT 10');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    await pool.end();
  }
})();
