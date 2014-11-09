'use strict';

var _ = require('lodash');
var Song = require('./song.model');
var Playlist = require('./playlist');

var playList = new Playlist();
playList.addTrack({ title: 'Title1', tLength: 10000 });
playList.addTrack({ title: 'Title2', tLength: 25000 });
playList.addTrack({ title: 'Title3', tLength: 20000 });

playList.start();

// Get list of songs
exports.index = function(req, res) {
  Song.find({ 'inPlaylist' : false }, function (err, songs) {
    if(err) { return handleError(res, err); }
    return res.json(200, songs);
  });
};

exports.playlist = function(req, res) {

  return res.json(200, playList.getTrackList());

  /*
  Song.find({ 'inPlaylist' : true })
    .sort('votes.current')
    .exec(function (err, songs) {
    if(err) { return handleError(res, err); }
    return res.json(200, songs);
  });
  */

  /*
  Song.find()
    .where('inPlaylist').equals(fart)
    .sort('votes')
    .exec(function (err, songs) {
    if(err) { return handleError(res, err); }
    return res.json(200, songs);
  });
  */
};

// Get a single song
exports.show = function(req, res) {
  Song.findById(req.params.id, function (err, song) {
    if(err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    return res.json(song);
  });
};

// Creates a new song in the DB.
exports.create = function(req, res) {
  Song.create(req.body, function(err, song) {
    if(err) { return handleError(res, err); }
    return res.json(201, song);
  });
};

// Updates an existing song in the DB.
exports.addVote = function(req, res) {
  //if(req.body._id) { delete req.body._id; }
  Song.findById(req.params.id, function (err, song) {
    if (err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    song.votes.current++;
    song.votes.total++;
    if(!song.inPlaylist) {
      song.inPlaylist = true;
    }
    song.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, song);
    });
  });
};

// Updates an existing song in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Song.findById(req.params.id, function (err, song) {
    if (err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    var updated = _.merge(song, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, song);
    });
  });
};

// Deletes a song from the DB.
exports.destroy = function(req, res) {
  Song.findById(req.params.id, function (err, song) {
    if(err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    song.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
