var express = require('express');
var userRouter = express.Router();

var mongoose = require('mongoose');
var Authorize = require('../../config/authorize.js');
var Auth = require('../../config/auth.js');

var easyimg = require('easyimage');
var fs = require('fs');
var multer = require('multer');


var uploading = multer({
  limits: {fileSize: 1050000}//1MB ~1024*1024
});

var User = require('../models/user.js');

//////AWS////
var aws = require('aws-sdk');

var AWS_ACCESS_KEY = Auth.aws.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = Auth.aws.AWS_SECRET_KEY;
var S3_BUCKET = Auth.aws.S3_BUCKET;

aws.config.update({accessKeyId: AWS_ACCESS_KEY , secretAccessKey: AWS_SECRET_KEY });

/* GET /User listing. */
userRouter.get('/', Authorize.isLoggedIn, function(req, res, next) {
  User.find(function (err, Users) {
    if (err) return next(err);
    res.json(Users);
  });
});


/* GET Profile...ie User by User name. */
userRouter.get('/:id', Authorize.isLoggedIn, function(req, res, next) {
    
    User.findById(req.params.id, function (err, u) {
        if (err) return next(err);
        
        User.populate(u, {path: 'favbeach beaches'}, function (err, newU) {
            
            if(req.user.id == req.params.id){
                //Only possible to edit own profile
                res.render('profile.ejs', {
                    user : newU,
                    message :""
                });
            }else{
                res.render('publicprofile.ejs', {
                    publicuser : newU,
                    user : req.user,
                    message :""
                });
            }
        });
    });

});

userRouter.get('/json/:id', Authorize.isLoggedIn, function(req, res, next) {
    User.findById(req.params.id, function (err, u) {
        if (err) return next(err);
        res.json(u);
    });
});

/* Crop and save the image in here */
userRouter.post('/avatar', Authorize.isLoggedIn, uploading, function(req, res, next) {
    
    user = req.user;
    
    cropData = JSON.parse(req.body.avatar_data);
    
    //console.log(req.body.avatar_data);
    
    console.log(cropData.x);
    console.log(cropData.y);
    console.log(cropData.height);
    console.log(cropData.width);
    
    console.log("req.files.avatar_file.path : " + req.files.avatar_file.path);
    //Do the cropping here
    fs.readFile(req.files.avatar_file.path, function (err, data) {
        if (err) return next(err);
        
        var fileName = req.files.avatar_file.name;
        
        fs.writeFile(__dirname + '/../../public/img/tmp/' + fileName, data, function (err) {
            if (err) return next(err);
            
            user.avatar = "/public/img/cropped/" + fileName;
            
            //Activate once NPM installs easyimage
            var srcImage = __dirname + '/../../public/img/tmp/' + fileName;
            var tgtImage = __dirname + '/../../public/img/cropped/' + fileName;
            
            console.log("srcImage: " + srcImage);
            console.log("tgtImage: " + tgtImage);
            
            easyimg.info(srcImage).then(function(info){
                
                console.log("Image w: " + info.width);
                console.log("Image H: " + info.height);
                console.log("X: " + cropData.x);
                console.log("Y: " + cropData.y);
                console.log("H: " + cropData.height);
                console.log("W: " + cropData.width);
                //OK easy image is cropping with x,y 0,0 as the center of the image
                //The parameters I am passing is are from the top corner
                //So easyimage is adding 1/2 of the width and height to my coord
                //So I need to subtract
                
                //This formula was worked out with pen and paper and trig!
                //****** DO NOT CHANGE THESE THE NEXT 2 LINES *****************
                var x = cropData.x -(info.width - cropData.width)/2;
                var y = cropData.y -(info.height - cropData.height)/2;
                
                x = Math.round(x);
                y = Math.round(y);
                //*************************************************************
                console.log("x: " + x);
                console.log("y: " + y);
                
                easyimg.crop({
                        src: srcImage, dst: tgtImage,
                        cropwidth: cropData.width, cropheight: cropData.height,
                        x:x, y:y
                    }).then(
                    function(image) {
                        
                        console.log('Cropped: ' + image.width + ' x ' + image.height);
                        
                        
                        //AWS
                        
                        var fileBuffer = fs.readFileSync(tgtImage);
                        var ContentType = getContentTypeByFile(tgtImage);
                        
                        //Put avatars into the avatar folder
                        fileName = "avatars/" + fileName;
                        
                        console.log("S3_BUCKET : " + S3_BUCKET);
                        console.log("Key : " + fileName);
                        console.log("ContentType : " + ContentType);
                    
                        var params = {
                            ACL: 'public-read',
                            Bucket: S3_BUCKET,
                            Key: fileName,
                            Body: fileBuffer,
                            ContentType: ContentType
                        };
                
                        var s3 = new aws.S3();
                        s3.putObject(params, function(error, response) {
                            if (error) return next(error);
                            console.log('file uploaded');
                            
                            user.avatar = "https://s3-eu-west-1.amazonaws.com/" + S3_BUCKET + "/" + fileName;
                            user.save(function(err,user){
                                if (err) return next(err);
                                    //res.redirect('/profile');
                                if (req.xhr) {
                                    console.log("XHR")
                                    res.status(200).send({ 
                                        state: 200,
                                        message: 'User Saved',
                                        result: user.avatar});
                                } else {
                                    next(err);
                                }
                            });        
                            

                        }); 
                    },
                    function (err) {
                        console.log(err);
                    });                  
            });
        });
    
    });

});

//function uploadFile(remoteFilename, fileName) {
//    
//}


function getContentTypeByFile(fileName) {
    var rc = 'application/octet-stream';
    var fileNameLowerCase = fileName.toLowerCase();

    if (fileNameLowerCase.indexOf('.html') >= 0) rc = 'text/html';
    else if (fileNameLowerCase.indexOf('.css') >= 0) rc = 'text/css';
    else if (fileNameLowerCase.indexOf('.json') >= 0) rc = 'application/json';
    else if (fileNameLowerCase.indexOf('.js') >= 0) rc = 'application/x-javascript';
    else if (fileNameLowerCase.indexOf('.png') >= 0) rc = 'image/png';
    else if (fileNameLowerCase.indexOf('.jpg') >= 0) rc = 'image/jpg';

    return rc;
}


/* Adding a favorite beach to the favroites array */
userRouter.post('/toggleFavBeaches/:beachid', Authorize.isLoggedIn, function(req, res, next) {
    
    User.findById(req.user.id, function (err, u) {
        if (err) return next(err);
        
        var i = u.beaches.indexOf(req.params.beachid);
        console.log(i);
        if (i === -1){
            u.beaches.push(req.params.beachid);
        }else{
            u.beaches.splice(i,1);
        }
        User.populate(u, {path: 'favbeach beaches'}, function (err, newU) {
            newU.save(function(err,user){
                if (err) return next(err);
                console.log("USER::::: " + user);
                return res.json(user);
            });
        });
    });
});

/* Adding home beach to the */
userRouter.post('/setHomeBeach/:beachid', Authorize.isLoggedIn, function(req, res, next) {
    
    u = req.user;
    u.favbeach = req.params.beachid;
    u.save(function(err,user){
        if (err) return next(err);
        console.log('User saved:', user);
        return res.json(user);
    });
});

/* post /user/:id - updates the user by id to view or update */
userRouter.post('/:id', Authorize.isLoggedIn, function(req, res, next) {
    
    User.findByIdAndUpdate(req.params.id, req.body, function (err, u) {
        User.populate(u, {path: 'favbeach beaches'}, function (err, newU) {
          newU.save(function(err,user){
            if (err) return next(err);
            res.render('profile.ejs', {
                user : user,
                message :"was updated successfully."
            });
          });
        });
    });
});


/* DELETE /User/:id */
userRouter.delete('/:id', Authorize.isLoggedIn, function(req, res, next) {
  User.findByIdAndRemove(req.params.id, req.body, function (err, User) {
    if (err) return next(err);
    res.json(User);
  });
});

module.exports = userRouter;