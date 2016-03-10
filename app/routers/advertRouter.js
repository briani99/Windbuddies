var express = require('express');
var advertRouter = express.Router();

var mongoose = require('mongoose');
var Advert = require('../models/advert.js');
var Authorize = require('../../config/authorize');

/* GET /Advert listing. */
advertRouter.get('/', Authorize.isLoggedIn, function(req, res, next) {
  Advert.find(function (err, Adverts) {
    if (err) return next(err);
    res.json(Adverts);
  });
});

/* POST /Advert */
advertRouter.post('/', Authorize.isLoggedIn, function(req, res, next) {
  Advert.create(req.body, function (err, Advert) {
    if (err) return next(err);
    res.json(Advert);
  });
});

/* GET /Advert/id */
advertRouter.get('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Advert.findById(req.params.id, function (err, Advert) {
    if (err) return next(err);
    res.json(Advert);
  });
});

/* PUT /Advert/:id */
advertRouter.put('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Advert.findByIdAndUpdate(req.params.id, req.body, function (err, Advert) {
    if (err) return next(err);
    res.json(Advert);
  });
});

/* DELETE /Advert/:id */
advertRouter.delete('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Advert.findByIdAndRemove(req.params.id, req.body, function (err, Advert) {
    if (err) return next(err);
    res.json(Advert);
  });
});

module.exports = advertRouter;