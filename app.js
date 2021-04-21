const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const app = new express();
var cors = require('cors');
var sessionStore = new session.MemoryStore(); 
/**
 *
 * Cors handling
 */

var corsOptions = {
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: [
      "Authorization",
      "X-PINGOTHE",
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "X-Custom-header",
      "Set-Cookie",
      "Access-Control-Allow-Origin"
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range", "Set-Cookie"],
    credentials: true,
    preflightContinue: false,
    
  };
app.use(cors(corsOptions));
/**
 * For being able to read request bodies
 */
app.use(bodyParser.json());

/**
 * Initializing the express-session
 */
//fcbeta.m3l2v7.0001.euc1.cache.amazonaws.com
app.use(session({
  key: 'cookie_id',
  secret: "secret",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000,
    secure:false
  },
  store: sessionStore
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

app.post('/api/login',cors(corsOptions), validatePayloadMiddleware, (req, res) => {

  const user = appUsers[req.body.userName];
  if (user && user.passWord === req.body.passWord) {
    const userWithoutPassword = {...user};
    delete userWithoutPassword.passWord;
    req.session.user = userWithoutPassword;
    sessionStore.set("cookie_id",JSON.stringify(req.session.user));
    res.status(200).json({
      user: userWithoutPassword
    });
  } else {
    return res.status(403).send({
      res :{status:403,
      errorMessage: 'Permission denied!'}
    });
  }
});

/**
 * Check if user is logged in.
 */
app.get('/api/login', (req, res) => {

  let isUserExist = req.session.user ? true :false
  res.status(200).send({loggedIn: isUserExist});
});

/**
 * Application logout
 */
app.post('/api/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Could not log out.');
    } else {
      res.status(200).send({message:"logout successfull"});
    }
  });
});

/**
 *  checking if user is stored in session.
 */
const authMiddleware = (req, res, next) => {
  if(req.session && req.session.user) {
    next();
  } else {
    res.status(403).send({
      errorMessage: 'You must be logged in.'
    });
  }
};


/**
 * Listen on port 3000
 */
app.listen(3000, () => {
  console.log('Server listening on port 3000')
});