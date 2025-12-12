import mysql from "mysql2/promise";

const mysql_con = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Connection pools for both DB servers
const db_243 = mysql.createPool({
    host: process.env.MYSQL_HOST_243,
    user: process.env.MYSQL_USERNAME_243,
    password: process.env.MYSQL_PASSWORD_243,
    database: process.env.MYSQL_DATABASE_243
});
  
const db_219 = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

export { mysql_con, db_243, db_219 };