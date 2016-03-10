var express = require('express');
var postRouter = express.Router();

var mongoose = require('mongoose');
var Post = require('../models/post.js');
var Beach = require('../models/beach.js');
var User = require('../models/user.js');
var WindStat = require('../models/windstat.js');
var Authorize = require('../../config/authorize');


/* POST:  Create an initial Post */
postRouter.post('/', Authorize.isLoggedIn, function(req, res, next) {
        
        Post.create(req.body, function (err, Post) {
            if (err) return next(err);
            //Create Wind statistic
            var ws = new WindStat();
            ws.beach = req.body.beach;
            ws.time = req.body.time;
            ws.knots = req.body.knots;
            ws.direction = req.body.direction;
        
            ws.save(function(err,user){
                if (err) return next(err);
                res.redirect('/post/byBeach/' + req.body.beach);
            });
        });
});

/* GET:  Listing, first call no beach selected, use default beach */
postRouter.get('/', Authorize.isLoggedIn, function(req, res, next) {
    
    res.redirect('/post/byBeach/' + req.user.favbeach);

});

/* GET:  Listing, first call no beach selected, use default beach */
postRouter.get('/json/:beach_id', Authorize.isLoggedIn, function(req, res, next) {
    
        var query = Post.find({beach:req.params.beach_id})
                    .populate('User')
                    .populate('comments.User')
                    .sort({'date': -1})
                    .limit(10);

// execute the query at a later time
    query.exec(function (err, posts) {
      if (err) return next(err);
      if(posts){
          console.log(posts);
          return res.json(posts);
      }
    });
});


/* Adding a link to the  beach to the favroites array */
postRouter.post('/toggleLike/:id', Authorize.isLoggedIn, function(req, res, next) {
    
    Post.findById(req.params.id, function (err, p) {
        if (err) return next(err);
        
        var u = req.user;
        var i = p.userlikes.indexOf(req.user.id);
        console.log(i);
        if (i === -1){
            p.userlikes.push(req.user.id);
            p.likesCnt = p.likesCnt + 1;
        }else{
            p.userlikes.splice(i,1);
            p.likesCnt = p.likesCnt - 1;
        }
        p.save(function(err,post){
            if (err) return next(err);
            return res.json(post);
        });
    });
});

/* Adding a comment to the array */
postRouter.post('/addComment/:id', Authorize.isLoggedIn, function(req, res, next) {
    
    Post.findById(req.params.id, function (err, p) {
        if (err) return next(err);
        var newComment = {text: req.body.text, user: req.user};
        p.comments.push(newComment);
        p.commentsCnt = p.comments.length;

        //now populate the user info in the post
        Post.populate(p, {path: 'comments.user'}, function (err, newP) {

            newP.save(function(err,post){
                if (err) return next(err);
                return res.json(post);
            });
        });
    });
});

/* Adding a comment array */
postRouter.post('/deleteComment/:id', Authorize.isLoggedIn, function(req, res, next) {
    
    Post.findById(req.params.id, function (err, p) {
        if (err) return next(err);
        var i = findArrayIndexByID(p.comments, req.body.id);
        if (i != -1){
            p.comments.splice(i,1);
            p.commentsCnt = p.commentsCnt - 1;
        }
        Post.populate(p, {path: 'comments.user'}, function (err, newP) {
            newP.save(function(err,post){
                if (err) return next(err);
                return res.json(post);
            });
        });
    });
});


/* GET:  List of latest 10 posts for a beach */
postRouter.get('/byBeach/:beach_id', Authorize.isLoggedIn, function(req, res, next) {
    
    var query = Post.find({beach:req.params.beach_id})
                    .populate('user')
                    .populate('comments.user')
                    .sort({'time': -1})
                    .limit(10);
    //get by id is better   
    Beach.findById(req.params.beach_id, function (err, b) {  
        if (err) return next(err);
        User.populate(req.user, {path: 'favbeach beaches'}, function (err, newU) {
            // execute the query 
            query.exec(function (err, Posts) {
              if (err) return next(err);
              if(Posts){
                  res.render('posts.ejs', {posts : Posts, user: newU, beach: b});
              }
            });
        });
    });
});
    
/* GET list of latest 10 posts for a user */
postRouter.get('/byUser/:user_id', Authorize.isLoggedIn, function(req, res, next) {
    
    var query = Post.find({user:req.params.user_id})
                    .sort({'date': -1})
                    .limit(10);

// execute the query at a later time
    query.exec(function (err, Posts) {
      if (err) return next(err);
      if(Posts){
          res.render('posts.ejs', {posts : Posts, user: req.user});
      }
    });
});

/* PUT /Post/:id */
postRouter.put('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Post.findByIdAndUpdate(req.params.id, req.body, function (err, Post) {
    if (err) return next(err);
    res.json(Post);
  });
});

/* DELETE /Post/:id */
postRouter.delete('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Post.findByIdAndRemove(req.params.id, req.body, function (err, Post) {
    if (err) return next(err);
    res.json(Post);
  });
});

function findArrayIndexByID(source, id) {
    for (var i = 0; i < source.length; i++) {
        console.log("array id" + source[i]._id);
        console.log("id      " + id);
        if (source[i]._id == id) {
            return i;
        }
    }
    return -1;
}


module.exports = postRouter;