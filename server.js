const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_register_ejs'
});

db.connect((err) => {
    if (err) {
        console.error('Error connection to database');
    } else {
        console.log('Connected to database');
    }
});

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/home', (req, res) => {
    if (req.session.loggedin) {
      res.render('home', { username: req.session.username });
    } else {
      res.redirect('/login');
    }
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = username;
          res.redirect('home');
        } else {
          res.send('Incorrect Username and/or Password!');
        }
        res.end();
      });
    } else {
      res.send('Please enter Username and Password!');
      res.end();
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});
  
app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (error, results, fields) => {
        if (error) throw error;
        res.redirect('/login');
        res.end();
      });
    } else {
      res.send('Please enter Username and Password!');
      res.end();
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/login');
      }
    });
});

app.listen(port, () => {
    console.log('Server is running');
});