const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/routes');

const app = express();
dotenv.config();

app.use(express.json()); // Ensure express can parse JSON bodies
app.use('/', routes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is running on port ${port}`));
