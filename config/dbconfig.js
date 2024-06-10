/*const mysql = require('mysql2/promise');
const dotenv = require('dotenv');dotenv.config();

const collegesPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
<<<<<<< HEAD
    waitForConnections: true,
    connectionLimit: 10, // Adjust this number based on your needs
    queueLimit: 0
=======
    connectTimeout: 10000 
>>>>>>> 187ed976201be290fd2d12dc102357e13a08a665

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

