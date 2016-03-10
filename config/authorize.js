module.exports = {
    //check if connected before doing anything
    isLoggedIn : function(req, res, next) {
	       if (req.isAuthenticated())
		      return next();
            res.render('welcome.ejs');
    },
    
    //if its aready connected go straight to the post screen
    alreadyConnected : function(req, res, next){
        if (!req.isAuthenticated())
		      return next();
            res.redirect('/post');
    },

    tokens : {},    

    consumeRememberMeToken : function(token, fn) {
      var uid = this.tokens[token];
      // invalidate the single-use token
      delete this.tokens[token];
      return fn(null, uid);
    },

    saveRememberMeToken : function(token, uid, fn) {
      this.tokens[token] = uid;
      return fn();
    },
    
    getRandomInt :function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    randomString : function(len) {
        var buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;

        for (var i = 0; i < len; ++i) {
            buf.push(chars[this.getRandomInt(0, charlen - 1)]);
        }

        return buf.join('');
    },

    issueToken : function(user, done) {
        var token = this.randomString(64);
        this.saveRememberMeToken(token, user.id, function(err) {
            if (err) { return done(err); }
            return done(null, token);
        });
    }
};