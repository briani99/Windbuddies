var express = require('express');
var activityRouter = express.Router();

var mongoose = require('mongoose');
var Activity = require('../models/activity.js');
var Authorize = require('../../config/authorize');

/* GET /activity listing. */
activityRouter.get('/', Authorize.isLoggedIn, function(req, res, next) {
  Activity.find(function (err, activities) {
    if (err) return next(err);
    res.json(activities);
  });
});

/* POST /activity */
activityRouter.post('/', Authorize.isLoggedIn, function(req, res, next) {
  Activity.create(req.body, function (err, activity) {
    if (err) return next(err);
    res.json(activity);
  });
});

/* GET /activity/id */
activityRouter.get('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Activity.findById(req.params.id, function (err, activity) {
    if (err) return next(err);
    res.json(activity);
  });
});

/* PUT /activity/:id */
activityRouter.put('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Activity.findByIdAndUpdate(req.params.id, req.body, function (err, activity) {
    if (err) return next(err);
    res.json(activity);
  });
});

/* DELETE /activity/:id */
activityRouter.delete('/:id', Authorize.isLoggedIn, function(req, res, next) {
  Activity.findByIdAndRemove(req.params.id, req.body, function (err, activity) {
    if (err) return next(err);
    res.json(activity);
  });
});

module.exports = activityRouter;