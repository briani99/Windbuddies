var express = require('express');
var beachRouter = express.Router();

var mongoose = require('mongoose');
var Beach = require('../models/beach.js');
var User = require('../models/user.js');
var Business = require('../models/business.js');
var Authorize = require('../../config/authorize');

var http = require('http');

/* Search Beaches */
beachRouter.get('/search', Authorize.isLoggedIn, function(req, res) {
   var regex = new RegExp(req.query["term"], 'i');
   var query = Beach.find({name: regex}, { 'name': 1 }).select('name country').sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
    
    // Execute query in a callback and return users list
  query.exec(function(err, beaches) {
      console.log(beaches);
      if (err) return next(err);
      res.json(beaches);
      }
  );
});

/* Users Favorite Beaches */
beachRouter.get('/favs', Authorize.isLoggedIn, function(req, res, next) {
    
    req.user.getBeaches(function(favBeaches){ 
        
        Beach.find({'_id': { $in: favBeaches}}, function(err, beaches){
            if (err) return next(err);
            console.log(beaches);
            return res.json(beaches);
        });
  });
});

/* Get by ID  */
beachRouter.get('/json/:id', Authorize.isLoggedIn, function(req, res) {
   
    Beach.findById(req.params.id, function (err, b) {
        if (err) return next(err);
        res.json(b);
    });
});



/* GET /map listing. */
beachRouter.get('/map/:id', Authorize.isLoggedIn, function(req, res, next) {
    Beach.find(function (err, allBeaches) {
    if (err) return next(err);
        Business.find(function (err, allBusiness) {
            if (err) return next(err);
            Beach.findById(req.params.id, function (err, b) {
                if (err) return next(err);
                User.populate(req.user, {path: 'favbeach beaches'}, function (err, newU) {
                    res.render('map.ejs', {
                        gotoBeach: b,
                        beaches : allBeaches,
                        schools : allBusiness,
                        user : newU
                    });
                });    
            });
        });
    });
});

beachRouter.get('/map', Authorize.isLoggedIn, function(req, res, next) {
    Beach.find(function (err, allBeaches) {
    if (err) return next(err);
        Business.find(function (err, allBusiness) {   
            User.populate(req.user, {path: 'favbeach beaches'}, function (err, newU) {
                res.render('map.ejs', {
                    gotoBeach: "",
                    beaches : allBeaches,
                    schools : allBusiness,
                    user : newU
                });
            });   
        });
    });
});

/* GET - get the beach from to create. */
beachRouter.get('/', Authorize.isLoggedIn, function(req, res, next) {
    res.redirect('/beach/map');
});

/* POST - process the create beach form */
beachRouter.post('/', Authorize.isLoggedIn, function(req, res, next) {
  /* get the information from the form and put in json beach */
    
    var beach     = new Beach(); 
    beach.name = req.body.name; 
    beach.city = req.body.city; 
    beach.country = req.body.country; 
    beach.longitude = req.body.longitude; 
    beach.latitude = req.body.latitude;
    beach.geo    = [ req.body.longitude, req.body.latitude ]; 
    
    beach.save(function (err) {
        if (err) return next(err);
          
        res.render('beach.ejs', {
                user : req.user,
                beach : beach,
                message: "was created sucessfully."
        });
      });
});

/* GET /beach/:id - gets the beach by id to view or update */
beachRouter.get('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Beach.findById(req.params.id, function (err, beach) {
    if (err) return next(err);
        res.render('beach.ejs', {
            user : req.user,
            beach : beach,
            message: ""
    //get the fotos and then sent them to the ejs
    });
  });
});

/* post /beach/:id - updates the beach by id to view or update */
beachRouter.post('/:id', Authorize.isLoggedIn, function(req, res, next) {
    Beach.findByIdAndUpdate(req.params.id, req.body, function (err, b) {
            if (err) return next(err);
            console.log('User saved:', b);
            res.render('beach.ejs', {
                user : req.user,
                beach : b,
                message: "was updated sucessfully."
            });
          });
});

/* PUT /beach/:id - update the beach by id*/
beachRouter.put('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Beach.findByIdAndUpdate(req.params.id, req.body, function (err, beach) {
    if (err) return next(err);
    res.json(beach);
  });
});

/* DELETE /beach/:id -  probably remove this functionality or protect for only admin*/
beachRouter.delete('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Beach.findByIdAndRemove(req.params.id, req.body, function (err, beach) {
    if (err) return next(err);
    res.json(beach);
  });
});



module.exports = beachRouter;