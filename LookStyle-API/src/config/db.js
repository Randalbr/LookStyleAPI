import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",   // o la IP de tu servidor
  user: "root",        // tu usuario MySQL
  password: "",        // tu contraseña MySQL
  database: "lookstyle"
});

export default pool;
