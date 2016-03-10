// server.js

// set up ======================================================================
// get all the tools we need
// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var engine = require('ejs-mate');
var app      = express();

// use ejs-locals for all ejs templates: 
app.engine('ejs', engine);

var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var expressValidator = require('express-validator');
var session      = require('express-session');
var nodemailer = require('nodemailer');

var configDB = require('./config/database.js');

// configuration ===============================================================
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || configDB.url;
mongoose.connect(mongoUri); // connect to our database

require('./config/passport')(passport); // pass passport for configuration


// set up our express application

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator()); 

app.use('/public', express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); // set up ejs for templating


// required for passport
app.use(session({ secret: 'ilovetokiteingustyconditions' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(passport.authenticate('remember-me'));
app.use(flash()); // use connect-flash for flash messages stored in session




// routes ======================================================================
// load our routes and pass in our app and fully configured passport
require('./app/routes.js')(app, passport); 


app.use('/activity', require('./app/routers/activityRouter.js'));
app.use('/advert', require('./app/routers/advertRouter.js'));
app.use('/beach', require('./app/routers/beachRouter.js'));
app.use('/post', require('./app/routers/postRouter.js'));
app.use('/user', require('./app/routers/userRouter.js'));
app.use('/business', require('./app/routers/businessRouter.js'));



// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
