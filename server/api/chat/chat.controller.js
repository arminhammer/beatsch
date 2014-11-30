'use strict';

var _ = require('lodash');
var Chat = require('./chat.model');

// Get list of chats
exports.index = function(req, res) {
  Chat.find(function (err, chats) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(chats);
  });
};

// Creates a new chat in the DB.
exports.create = function(req, res) {
  Chat.create(req.body, function(err, chat) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(chat);
  });
};

/*
// Get a single chat
exports.show = function(req, res) {
  Chat.findById(req.params.id, function (err, chat) {
    if(err) { return handleError(res, err); }
    if(!chat) { return res.send(404); }
    return res.json(chat);
  });
};

// Updates an existing chat in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Chat.findById(req.params.id, function (err, chat) {
    if (err) { return handleError(res, err); }
    if(!chat) { return res.send(404); }
    var updated = _.merge(chat, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, chat);
    });
  });
};

// Deletes a chat from the DB.
exports.destroy = function(req, res) {
  Chat.findById(req.params.id, function (err, chat) {
    if(err) { return handleError(res, err); }
    if(!chat) { return res.send(404); }
    chat.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
*/

function handleError(res, err) {
  return res.status(500).send(err);
}
