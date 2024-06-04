const mysql = require('mysql2/promise');
const dotenv = require('dotenv');dotenv.config();
app.use(cors());
app.use(express.json({ limit: '250mb' }));
app.use(bodyParser.urlencoded({ limit: '250mb', extended: true }));
const collegesPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const syllabusPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.SYLLABUS_DB_NAME,
});

module.exports = {
    collegesPool,
    syllabusPool
};
