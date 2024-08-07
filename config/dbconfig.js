/*const mysql = require('mysql2/promise');
const dotenv = require('dotenv');dotenv.config();

const collegesPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Adjust this number based on your needs
    queueLimit: 0

});

const syllabusPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.SYLLABUS_DB_NAME,
    connectTimeout: 10000 

});

module.exports = {
    collegesPool,
    syllabusPool
};*/
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const collegesPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    JWT_SECRET :process.env.JWT_SECRET,
       connectionLimit: 10,
    connectTimeout: 10000 
});

const syllabusPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.SYLLABUS_DB_NAME,
    connectTimeout: 10000 
});

module.exports = {
    collegesPool,
    syllabusPool
};

