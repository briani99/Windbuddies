// config/auth.js
// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1476074872714263', // your App ID
        'clientSecret'  : '51489c5efe55c32cdd3dd72cacfabf47', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:3000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    },
    
    'instagramAuth' : {
        'clientID'      : '45237db651104479897e04d4b51980f7',
        'clientSecret'  : 'f8bd2dea25c4485daeb513b3efdb1e11',
        'callbackURL'   : 'http://localhost:3000/auth/instagram/callback'
    },
    
    'mailAuth' : {
        'service'      : 'Gmail',
        'user'  : 'briani9973',
        'password'   : 'phonecol!(&^',
        'apikey'   : ''       
    },
    'aws' : {
        'AWS_ACCESS_KEY' : 'AKIAJQQFBBCVMLLFK7VA',
        'AWS_SECRET_KEY' : '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',
        'S3_BUCKET' : 'kiteloop'
    }
};