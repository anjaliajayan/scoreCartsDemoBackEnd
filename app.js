const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const moment = require('moment');
const app = new express();
var cors = require('cors');
var db = require('./db_connection');

/**
 *
 * Cors handling
 */

var corsOptions =
{origin: [
  "http://localhost:4200"
], credentials: true};

app.use(cors(corsOptions));
/**
 *  to read request bodies
 */
app.use(bodyParser.json());

app.use(cookieParser());
/**
 * Initializing the express-session
 */

app.use(session({
  name: "session-id",
  key: 'cookie_id',
  secret: "secret",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000,
    secure: false
  }
}));

/**
 * these static data is only for demo purpose
 */
const appUsers = {
  'AnjaliAnju': {
    userName: 'AnjaliAnju',
    name: 'Anjali',
    passWord: '12345'
  },
  'gagan@scorecarts.com': {
    userName: 'gagan@scorecarts.com',
    name: 'Gagan',
    passWord: '12345'
  }
};
/**
 * Middleware to check that a payload is present
 */
const validatePayloadMiddleware = (req, res, next) => {
  if (req.body) {
    next();
  } else {
    res.status(403).send({
      errorMessage: 'You need a payload'
    });
  }
};

app.post('/api/login', validatePayloadMiddleware, (req, res) => {

  const user = appUsers[req.body.userName];
  if (user && user.passWord === req.body.passWord) {
    const {
      passWord,
      ...userWithoutPassword
    } = user;
    req.session.user = userWithoutPassword;
    req.session.auth = true;
    req.session.save()
    res.status(200).json({
      user: userWithoutPassword
    });
  } else {
    return res.status(403).send({
      res: {
        status: 403,
        errorMessage: 'Permission denied!'
      }
    });
  }
});

/**
 * Check if user is logged in.
 */
app.get('/api/login', (req, res) => {

  let isUserExist = req.session.user ? true : false
  res.status(200).send({
    loggedIn: isUserExist
  });
});

/**
 * Application logout
 */
app.post('/api/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Could not log out.');
    } else {
      res.status(200).send({
        message: "logout successfull"
      });
    }
  });
});

/**
 *  handling session out
 */

const sessionOutMiddleware = (req, res, next) => {
let now=moment();
let sessionExpTime=moment().add(req.session.cookie.maxAge /1000 ,"seconds");
if(now.isAfter(sessionExpTime) || now.isSame(sessionExpTime)){
 
  res.clearCookie('session-id');
  return res.status(440).json({
    status:false,
    message:"please login again"
  })
}
}
app.use(sessionOutMiddleware);
/**
 * Listen on port 3000
 */
app.listen(3000, () => {
  console.log('Server listening on port 3000')
});

