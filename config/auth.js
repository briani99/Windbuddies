// config/auth.js
// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '', // your App ID
        'clientSecret'  : '', // your App Secret
        'callbackURL'   : 'http://www.windbuddies.com/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : '',
        'consumerSecret'    : '',
        'callbackURL'       : 'http://www.windbuddies.com/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://www.windbuddies.com/auth/google/callback'
    },
    
    'instagramAuth' : {
        'clientID'      : '',
        'clientSecret'  : '',
        'callbackURL'   : 'http://www.windbuddies.com/auth/instagram/callback'
    },
    
    'mailAuth' : {
        'service'      : 'Zoho',
        'user'  : 'brian@windbuddies.com',
        'password'   : '',
        'apikey'   : ''       
    },
    'aws' : {
        'AWS_ACCESS_KEY' : '',
        'AWS_SECRET_KEY' : '',
        'S3_BUCKET' : ''
    }
};
