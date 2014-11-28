'use strict';

var _ = require('lodash');
var Song = require('./song.model');
var Playlist = require('../playlist/playlist.model');
var Vote = require('../vote/vote.model');

// Get list of songs
exports.index = function(req, res) {
  Song.find({}, function (err, songs) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(songs);
  });
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
    return res.status(201).json(song);
  });
};

// Updates an existing song in the DB.
exports.addVote = function(req, res) {
  //if(req.body._id) { delete req.body._id; }
  console.log('req is ');
  console.log(req.body);
  Song.findById(req.body.song._id, function (err, song) {
    if (err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    //song.votes++;

    var userQuery = null;
    if(req.body.user._id) {
      userQuery = req.body.user._id;
    }

    Playlist.find({ _song: song }, function(err, hit) {
      if (err) { return handleError(res, err); }

      if(hit.length > 0) {
        console.log('Found hit');
        console.log(hit[0]);
        //hit[0].votes++;
        hit[0].save();
      }
      else {
        console.log('Found no hit');
        console.log(hit);

        Vote.create({user: userQuery, date: Date.now(), active: true }, function(err, newVote) {
          if(err) { console.log('Error creating new vote: %s', err); }

          song.votes.push(newVote);

          Playlist.create({ _song: song._id }, function(err, newPlaylist) {

            newPlaylist.votes.push(newVote);
            newPlaylist.save(function(err) {

              if (err) { return handleError(res, err); }
              console.log('Added %s to playlist.', song.title);
              console.log(newPlaylist);

              song.save(function (err) {
                console.log('Saving song...');
                console.log(song);
                if (err) { return handleError(res, err); }

                return res.status(200).json(song);
              });

            });

          })

        });

      }

    });

    /*if(!song.inPlaylist) {
      song.inPlaylist = true;
    }

    song.save(function (err) {
      if (err) { return handleError(res, err); }
      console.log('Saving song...');
      console.log(song);
      return res.status(200).json(song);
    });
     */

  });
};

exports.addSong = function(req, res) {

  console.log('Adding song...');
  console.log(req.body);
  Song.find({ videoId: req.body.id.videoId }, function (err, songs) {
    if (err) { return handleError(res, err); }
    if(songs.length > 0) {
      console.log('Found song in the list already!');
      console.log(songs[0]);
      Playlist.create({
        _song: songs[0]._id,
        votes: 1
      }, function(err, playlist) {

        console.log('Successfully added to the playlist');

      })
    }
    else {
      console.log('Song is not in the catalog yet.');
      console.log(songs);
      Song.create({
        title: req.body.snippet.title,
        artist: req.body.snippet.title,
        source: 'youtube',
        length: 300000,
        url: 'https://www.youtube.com/watch?v=' + req.body.id.videoId,
        videoId: req.body.id.videoId,
        publishedAt: req.body.snippet.publishedAt,
        channelId: req.body.snippet.channelId,
        description: req.body.snippet.description,
        thumbnailUrlDefault: req.body.snippet.thumbnails.default.url,
        thumbnailUrlMedium: req.body.snippet.thumbnails.medium.url,
        thumbnailUrlHigh: req.body.snippet.thumbnails.high.url,
        channelTitle: req.body.snippet.channelTitle,
        liveBroadcastContent: req.body.snippet.liveBroadcastContent,
        votes: 1,
        active: true
      }, function(err, song) {
        if(err) {
          console.log('There was an error adding the song to the catalog: %s', err);
        }

        Playlist.create({
          _song: song._id,
          votes: 1
        }, function(err, playlist) {

          console.log('Successfully added to the playlist');

        })
      })
    }
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
      return res.status(200).json(song);
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
  return res.status(500).send(err);
}
