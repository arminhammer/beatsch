/**
 * Created by armin on 1/31/15.
 */
angular.module('beatschClientHtml5')

  .service('PlaylistService', function () {

    var appName = 'wM IS Performance Dashboard';

    this.getAppName = function() {

      return appName;

    }

  });
