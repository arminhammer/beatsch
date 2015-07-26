
'use strict';

var MainPage = require('./views/main.page');
var VideoModel = require('./models/video.model');

var video1 = new VideoModel({ title: 'Video 1', description: 'This is Video 1', score: 125, youtubeId: 'YqeW9_5kURI' });
var video2 = new VideoModel({ title: 'Video 2', description: 'This is Video 2', score: 475, youtubeId: 'g_uoH6hJilc' });
var video3 = new VideoModel({ title: 'Video 3', description: 'This is Video 3', score: 300, youtubeId: 'QcIy9NiNbmo' });

var playList = [];
playList.push(video1);
playList.push(video2);
playList.push(video3);

m.route.mode = 'hash';

m.route(document.getElementById('beatsch-app'), '/', {
  '/': m.component(MainPage, {
    list: playList
  })
});
