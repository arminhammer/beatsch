'use strict';

angular.module('beatschClientHtml5')
  .controller('MainController', function ($scope) {

    var Song = function(title) {

      this.title = title;
      this.votes = [];

      this.getScore = function() {

        var returnScore = 0;
        var voteCount = this.votes.length;

        angular.forEach(this.votes, function(vote) {

          returnScore += vote.date;

        });

        return returnScore * voteCount;

      };

      this.addVote = function() {
        var newVote = { date: Date.now(), user: 'testUser' };
        console.log('New vote: ' + newVote.date);
        this.votes.push(newVote);
        //this.score += newVote.date;
      }

    };

    $scope.songs = [new Song('Title 1'), new Song('Title 2'), new Song('Title 3'), new Song('Title 4') ];

  });
