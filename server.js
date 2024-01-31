const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const colors = require('colors')
const morgan = require('morgan')

const app = express();

app.use(morgan('dev'));

app.use(express.json({}));
app.use(express.json({
  extended: true
}))
// use dotenv files
dotenv.config({
  path: './config/config.env'
});

connectDB();

app.use('/api/RS/auth', require('./routes/user'));
app.use('/api/RS', require('./routes/RS'));

const PORT = process.env.PORT || 4000;
app.listen(PORT,
    console.log(`Server running on port: ${PORT}`.red.underline.bold)
    
    );