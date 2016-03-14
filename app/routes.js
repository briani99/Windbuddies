// load all the things we need
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var configAuth = require('../config/auth'); // use this one for testing
var User = require('./models/user.js');

var Authorize = require('../config/authorize');


module.exports = function(app, passport) {
    
// normal routes ===============================================================

	// show the home page
	app.get('/', Authorize.isLoggedIn,  function(req, res) {
        if(req.user.favbeach){
            res.redirect('/post');
        }else{
            res.redirect('/beach/map');
        }
	});

	// PROFILE SECTION =========================
    
    app.get('/profile', Authorize.isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user,
            message : ""
        });
	});

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
        res.clearCookie('remember_me');
		req.logout();
		res.redirect('/');
	});
    
    // Static content ==============================
	app.get('/privacypolicy', function(req, res) {
        res.render('privacy.ejs');
	});
    
    app.get('/terms', function(req, res) {
        res.render('terms.ejs');
	});


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', Authorize.alreadyConnected, function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
//		app.post('/login', validateLoginForm, passport.authenticate('local-login', {
//			successRedirect : '/index', // redirect to the secure profile section
//            failureRedirect : '/login', // redirect back to the signup page if there is an error
//			failureFlash : true // allow flash messages
//		}));
    
        app.post('/login', validateLoginForm, passport.authenticate('local-login', { failureRedirect: '/login', failureFlash: true }),
              function(req, res, next) {
                    // Issue a remember me cookie if the option was checked
                    if (!req.body.rememberme) { return next(); }

                    Authorize.issueToken(req.user, function(err, token) {
                      if (err) { return next(err); }
                      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
                      return next();
                    });
              },
              function(req, res) {
                //Success 
                res.redirect('/');
              }
        );


		// SIGNUP =================================
		// show the signup form
		app.get('/signup', Authorize.alreadyConnected, function(req, res) {
			res.render('signup.ejs', { message: req.flash('loginMessage') });
		});

    
		// process the signup form
		app.post('/signup', validateRegisterForm, passport.authenticate('local-signup', {
			successRedirect : '/', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

		// handle the callback after twitter has authenticated the user
		app.get('/auth/twitter/callback',
			passport.authenticate('twitter', {
				successRedirect : '/',
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

		// the callback after google has authenticated the user
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successRedirect : '/',
				failureRedirect : '/'
			}));
    
    
    // instagram ---------------------------------

		// send to google to do the authentication
		app.get('/auth/instagram', passport.authenticate('instagram'));

		// the callback after google has authenticated the user
		app.get('/auth/instagram/callback',
			passport.authenticate('instagram', {
				successRedirect : '/',
				failureRedirect : '/'
			}));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : '/',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		// handle the callback after twitter has authorized the user
		app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
				successRedirect : '/',
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

		// the callback after google has authorized the user
		app.get('/connect/google/callback',
			passport.authorize('google', {
				successRedirect : '/',
				failureRedirect : '/'
			}));

   // instagram ---------------------------------

		// send to google to do the authentication
		app.get('/connect/instagram', passport.authorize('instagram'));

		// the callback after google has authorized the user
		app.get('/connect/instagram/callback',
			passport.authorize('instagram', {
				successRedirect : '/',
				failureRedirect : '/'
			}));
// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', Authorize.isLoggedIn, function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/index');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', Authorize.isLoggedIn, function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/index');
		});
	});

	// twitter --------------------------------
	app.get('/unlink/twitter', Authorize.isLoggedIn, function(req, res) {
		var user           = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
			res.redirect('/index');
		});
	});

	// google ---------------------------------
	app.get('/unlink/google', Authorize.isLoggedIn, function(req, res) {
		var user          = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/index');
		});
	});
    
    // instagram ---------------------------------
	app.get('/unlink/instagram', Authorize.isLoggedIn, function(req, res) {
		var user          = req.user;
		user.instagram.token = undefined;
		user.save(function(err) {
			res.redirect('/index');
		});
	});

    // =============================================================================
    // FORGOT PASSWORD =============================================================
    // =============================================================================
    app.get('/forgot', function(req, res) {
        res.render('forgot.ejs', {
            user: req.user
        });
    });
    
    app.post('/forgot', function(req, res, next) {
      async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          User.findOne({ 'local.email': req.body.email }, function(err, user) {
            if (!user) {
              req.flash('error', 'No account with that email address exists.');
              return res.redirect('/forgot');
            }

            user.local.resetPasswordToken = token;
            user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function(err) {
              done(err, token, user);
            });
          });
        },
        function(token, user, done) {
          var smtpTransport = nodemailer.createTransport('SMTP', {
            service: configAuth.mailAuth.service,
            auth: {
                user: configAuth.mailAuth.user,
                pass: configAuth.mailAuth.password
                //api_key: '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'
            }
          });
          var mailOptions = {
            to: user.local.email,
            from: 'brian.keenan@Kitenect.com',
            subject: 'Node.js Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            done(err, 'done');
          });
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
      });
    });

    app.get('/reset/:token', function(req, res) {
      User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
        }
        res.render('resetpassword.ejs', {
          user: req.user
        });
      });
    });
    
    app.post('/reset/:token', function(req, res) {
      async.waterfall([
        function(done) {
          User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('back');
            }

            user.local.password = user.generateHash(req.body.password);
            user.local.resetPasswordToken = undefined;
            user.local.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          });
        },
        function(user, done) {
          var smtpTransport = nodemailer.createTransport('SMTP', {
            service: configAuth.mailAuth.service,
            auth: {
              user: configAuth.mailAuth.user,
              pass: configAuth.mailAuth.password
            }
          });
          var mailOptions = {
            to: user.local.email,
            from: 'passwordreset@demo.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
          });
        }
      ], function(err) {
        res.redirect('/');
      });
    });


};

// =============================================================================
// VALIDATION ==================================================================
// =============================================================================
//function isLoggedIn(req, res, next) {
//	if (req.isAuthenticated())
//		return next();
//    res.render('welcome.ejs');
//}

function validateRegisterForm(req, res, next) {

    req.assert('email', 'An email address is required').notEmpty();//Validate name
    req.assert('password', 'A password is required').notEmpty();  //Validate password
    req.assert('email', 'A valid email is required').isEmail();  //Validate email
    
    var errors = req.validationErrors();
    
    if(!errors){   //No errors were found, just check if the passwords match
        if (req.body.password != req.body.passwordConfirm){
            req.flash('loginMessage', 'Passwords are not the same');
            res.render('signup.ejs', { message: req.flash('loginMessage') });
            return;
        };
        return next();
    }
    else {   
        //Display errors to user
        console.log(errors);
        req.flash('loginMessage', errors[0].msg);
        res.render('signup.ejs', { message: req.flash('loginMessage') });
        return;
    }   
}

function validateLoginForm(req, res, next) {

    req.assert('email', 'An email address is required').notEmpty();//Validate name
    req.assert('password', 'A password is required').notEmpty();
    req.assert('email', 'A valid email is required').isEmail();  //Validate email
    
    var errors = req.validationErrors();
    
    if(!errors){   //No errors were found.  next!
        return next();
    }
    else {   
        //Display errors to user
        console.log(errors);
        req.flash('loginMessage', errors[0].msg);
        res.render('login.ejs', { message: req.flash('loginMessage') });
        return;
    }   
}