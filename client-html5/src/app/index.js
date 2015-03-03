'use strict';

angular.module('beatschClientHtml5', [
  'ui.router',
  'ui.bootstrap'
])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/',
        views: {
          'navbar': {
            templateUrl: '../components/navbar/navbar.html',
            controller: 'NavbarController'
          },
          'content@': {
            templateUrl: 'app/main/main.html',
            controller: 'MainController'
          }
        }
      });

    $urlRouterProvider.otherwise('/');
  })
;
