var express = require('express');
var businessRouter = express.Router();

var mongoose = require('mongoose');
var Business = require('../models/business.js');
var Authorize = require('../../config/authorize');

/* GET /business listing. */
businessRouter.get('/', Authorize.isLoggedIn, function(req, res, next) {
  Business.find(function (err, business) {
    if (err) return next(err);
    res.json(businesss);
  });
});

/* POST /business*/
businessRouter.post('/', Authorize.isLoggedIn, function(req, res, next) {
    
    var business = new Business(); 
    business.name = req.body.name; 
    business.city = req.body.city; 
    business.country = req.body.country; 
    
    business.phone = req.body.phone; 
    business.email = req.body.email; 
    business.website = req.body.website; 
    
    business.longitude = req.body.longitude; 
    business.latitude = req.body.latitude;
    business.geo    = [ req.body.longitude, req.body.latitude ]; 
    
    business.save(function (err) {
        if (err) return next(err);
            res.redirect('/beach/map');
    });

});

/* GET /business/id */
businessRouter.get('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Business.findById(req.params.id, function (err, b) {
    if (err) return next(err);
    res.json(b);
  });
});

/* PUT /business/:id */
businessRouter.put('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Business.findByIdAndUpdate(req.params.id, req.body, function (err, b) {
    if (err) return next(err);
    res.json(b);
  });
});

/* DELETE /business/:id */
businessRouter.delete('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Business.findByIdAndRemove(req.params.id, req.body, function (err, b) {
    if (err) return next(err);
    res.json(b);
  });
});

module.exports = businessRouter;