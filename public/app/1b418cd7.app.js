"use strict";angular.module("beatschApp",["ngCookies","ngResource","ngSanitize","btford.socket-io","ui.router","ui.bootstrap","youtube-embed","infinite-scroll"]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(a,b,c,d){b.otherwise("/"),c.html5Mode(!0),d.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b,c,d){return{request:function(a){return a.headers=a.headers||{},c.get("token")&&(a.headers.Authorization="Bearer "+c.get("token")),a},responseError:function(a){return 401===a.status?(d.path("/login"),c.remove("token"),b.reject(a)):b.reject(a)}}}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$stateChangeStart",function(a,d){c.isLoggedInAsync(function(a){d.authenticate&&!a&&b.path("/login")})})}]),angular.module("beatschApp").config(["$stateProvider",function(a){a.state("login",{url:"/login",templateUrl:"app/account/login/login.html",controller:"LoginCtrl"}).state("signup",{url:"/signup",templateUrl:"app/account/signup/signup.html",controller:"SignupCtrl"}).state("settings",{url:"/settings",templateUrl:"app/account/settings/settings.html",controller:"SettingsCtrl",authenticate:!0})}]),angular.module("beatschApp").controller("LoginCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.login=function(d){a.submitted=!0,d.$valid&&b.login({email:a.user.email,password:a.user.password}).then(function(){c.path("/")}).catch(function(b){a.errors.other=b.message})},a.loginOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("beatschApp").controller("SettingsCtrl",["$scope","User","Auth",function(a,b,c){a.errors={},a.changePassword=function(b){a.submitted=!0,b.$valid&&c.changePassword(a.user.oldPassword,a.user.newPassword).then(function(){a.message="Password successfully changed."}).catch(function(){b.password.$setValidity("mongoose",!1),a.errors.other="Incorrect password",a.message=""})}}]),angular.module("beatschApp").controller("SignupCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.register=function(d){a.submitted=!0,d.$valid&&b.createUser({name:a.user.name,email:a.user.email,password:a.user.password}).then(function(){c.path("/")}).catch(function(b){b=b.data,a.errors={},angular.forEach(b.errors,function(b,c){d[c].$setValidity("mongoose",!1),a.errors[c]=b.message})})},a.loginOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("beatschApp").controller("AdminCtrl",["$scope","$http","Auth","User",function(a,b,c,d){a.users=d.query(),a.delete=function(b){d.remove({id:b._id}),angular.forEach(a.users,function(c,d){c===b&&a.users.splice(d,1)})}}]),angular.module("beatschApp").config(["$stateProvider",function(a){a.state("admin",{url:"/admin",templateUrl:"app/admin/admin.html",controller:"AdminCtrl"})}]),angular.module("beatschApp").controller("MainCtrl",["$scope","$http","socket","Auth",function(a,b,c,d){function e(){for(var b=a.currentSong.date,c=0;c<a.playLog.length;){if(a.playLog[c].date>b)return console.log("Found %s",a.playLog[c]._song.title),a.currentSong=a.playLog[c],a.playLog[c];c++}return console.log("Could not find a more recent song, replaying current song %s",a.currentSong.title),a.currentSong}function f(a){jQuery("body").css("background-image","url("+a+")").fadeIn("slow")}a.currentSong=null,a.catalog=[],a.playLog=[],a.playList=[],a.timer=0,c.socket.on("timer",function(b){a.timer=b}),b.get("/api/playlist").success(function(b){a.playList=b,c.syncUpdates("playlist",a.playList)}),b.get("/api/songs").success(function(b){a.catalog=b,c.syncUpdates("song",a.catalog)}),b.get("/api/playlog/5").success(function(b){a.playLog=b,a.currentSong=b[b.length-1],c.syncUpdates("playlog",a.playLog),jQuery("#my-thumbs-list").mThumbnailScroller({axis:"y"})}),a.voteFor=function(a){console.log("Voting as "),console.log(d.getCurrentUser()),d.getCurrentUser()?(console.log("User is not null"),console.log(d.getCurrentUser()._id?"Id is not null!":"Id is null.")):console.log("User is null!"),b.post("/api/songs/vote",{song:a,user:d.getCurrentUser()})},a.addSong=function(){""!==a.newSong&&(console.log("Adding new song"),console.log(a.newSong),b.post("/api/songs/add",{newSong:a.newSong,user:d.getCurrentUser()}),a.newSong="")},a.searchYoutube=function(a){return b.get("https://www.googleapis.com/youtube/v3/search",{params:{part:"snippet",q:a,order:"viewCount",videoEmbeddable:"true",type:"video",key:"AIzaSyCNYKLmc5xIjQ7-M1gGZMn3OK8vLJ-qFzM"}}).then(function(a){return a.data.items.map(function(a){return a})})},a.$on("$destroy",function(){c.unsyncUpdates("song")}),a.$on("youtube.player.ready",function(b,c){console.log("youtube.player.ready"),c.playVideo(),console.log("url: %s",a.currentSong._song.thumbnailUrlHigh),f(a.currentSong._song.thumbnailUrlHigh)}),a.$on("youtube.player.playing",function(){console.log("youtube.player.playing")}),a.$on("youtube.player.paused",function(){console.log("youtube.player.paused")}),a.$on("youtube.player.buffering",function(){console.log("youtube.player.buffering")}),a.$on("youtube.player.queued",function(){console.log("youtube.player.queued")}),a.$on("youtube.player.ended",function(b,c){console.log("youtube.player.ended");var d=e();console.log("nextVid: %s",d),c.loadVideoById(d._song.videoId),c.playVideo(),f(a.currentSong._song.thumbnailUrlHigh)}),a.chats=[],b.get("/api/chats").success(function(b){a.chats=b,c.syncUpdates("chat",a.chats)}),a.addChat=function(){""!==a.newChat&&(b.post("/api/chats",{date:Date.now(),body:a.newChat}),a.newChat="")},a.playerVars={controls:1,autoplay:1},a.isCollapsed=!0}]),angular.module("beatschApp").config(["$stateProvider",function(a){a.state("main",{url:"/",templateUrl:"app/main/main.html",controller:"MainCtrl"})}]),angular.module("beatschApp").factory("Auth",["$location","$rootScope","$http","User","$cookieStore","$q",function(a,b,c,d,e,f){var g={};return e.get("token")&&(g=d.get()),{login:function(a,b){var h=b||angular.noop,i=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=d.get(),i.resolve(a),h()}).error(function(a){return this.logout(),i.reject(a),h(a)}.bind(this)),i.promise},logout:function(){e.remove("token"),g={}},createUser:function(a,b){var c=b||angular.noop;return d.save(a,function(b){return e.put("token",b.token),g=d.get(),c(a)},function(a){return this.logout(),c(a)}.bind(this)).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.changePassword({id:g._id},{oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},getCurrentUser:function(){return g},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)}).catch(function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return"admin"===g.role},getToken:function(){return e.get("token")}}}]),angular.module("beatschApp").factory("User",["$resource",function(a){return a("/api/users/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}}})}]),angular.module("beatschApp").factory("Modal",["$rootScope","$modal",function(a,b){function c(c,d){var e=a.$new();return c=c||{},d=d||"modal-default",angular.extend(e,c),b.open({templateUrl:"components/modal/modal.html",windowClass:d,scope:e})}return{confirm:{"delete":function(a){return a=a||angular.noop,function(){var b,d=Array.prototype.slice.call(arguments),e=d.shift();b=c({modal:{dismissable:!0,title:"Confirm Delete",html:"<p>Are you sure you want to delete <strong>"+e+"</strong> ?</p>",buttons:[{classes:"btn-danger",text:"Delete",click:function(a){b.close(a)}},{classes:"btn-default",text:"Cancel",click:function(a){b.dismiss(a)}}]}},"modal-danger"),b.result.then(function(b){a.apply(b,d)})}}}}}]),angular.module("beatschApp").directive("mongooseError",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(){return d.$setValidity("mongoose",!0)})}}}),angular.module("beatschApp").controller("NavbarCtrl",["$scope","$location","Auth",function(a,b,c){a.menu=[{title:"Home",link:"/"}],a.isCollapsed=!0,a.isLoggedIn=c.isLoggedIn,a.isAdmin=c.isAdmin,a.getCurrentUser=c.getCurrentUser,a.logout=function(){c.logout(),b.path("/login")},a.isActive=function(a){return a===b.path()}}]),angular.module("beatschApp").factory("socket",["socketFactory",function(a){var b=io("",{path:"/socket.io-client"}),c=a({ioSocket:b});return{socket:c,syncUpdates:function(a,b,d){d=d||angular.noop,c.on(a+":save",function(a){var c=_.find(b,{_id:a._id}),e=b.indexOf(c),f="created";c?(b.splice(e,1,a),f="updated"):b.push(a),d(f,a,b)}),c.on(a+":remove",function(a){var c="deleted";_.remove(b,{_id:a._id}),d(c,a,b)})},unsyncUpdates:function(a){c.removeAllListeners(a+":save"),c.removeAllListeners(a+":remove")}}}]),angular.module("beatschApp").run(["$templateCache",function(a){a.put("app/account/login/login.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Login</h1><!--\n      <p>Accounts are reset on server restart from <code>server/config/seed.js</code>. Default account is <code>test@test.com</code> / <code>test</code></p>\n      <p>Admin account is <code>admin@admin.com</code> / <code>admin</code></p>\n      --></div><div class=col-sm-12><form class=form name=form ng-submit=login(form) novalidate><div class=form-group><label>Email</label><input type=email name=email class=form-control ng-model=user.email required></div><div class=form-group><label>Password</label><input type=password name=password class=form-control ng-model=user.password required></div><div class="form-group has-error"><p class=help-block ng-show="form.email.$error.required && form.password.$error.required && submitted">Please enter your email and password.</p><p class=help-block ng-show="form.email.$error.email && submitted">Please enter a valid email.</p><p class=help-block>{{ errors.other }}</p></div><div><button class="btn btn-inverse btn-lg btn-login" type=submit>Login</button> <a class="btn btn-default btn-lg btn-register" href=/signup>Register</a></div><!--\n        <hr>\n        <div>\n          <a class="btn btn-facebook" href="" ng-click="loginOauth(\'facebook\')">\n            <i class="fa fa-facebook"></i> Connect with Facebook\n          </a>\n          <a class="btn btn-google-plus" href="" ng-click="loginOauth(\'google\')">\n            <i class="fa fa-google-plus"></i> Connect with Google+\n          </a>\n          <a class="btn btn-twitter" href="" ng-click="loginOauth(\'twitter\')">\n            <i class="fa fa-twitter"></i> Connect with Twitter\n          </a>\n        </div>\n        --></form></div></div><hr></div>'),a.put("app/account/settings/settings.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show="(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class="btn btn-lg btn-primary" type=submit>Save changes</button></form></div></div></div>'),a.put("app/account/signup/signup.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Sign up</h1></div><div class=col-sm-12><form class=form name=form ng-submit=register(form) novalidate><div class=form-group ng-class="{ \'has-success\': form.name.$valid && submitted,\n                                            \'has-error\': form.name.$invalid && submitted }"><label>Name</label><input name=name class=form-control ng-model=user.name required><p class=help-block ng-show="form.name.$error.required && submitted">A name is required</p></div><div class=form-group ng-class="{ \'has-success\': form.email.$valid && submitted,\n                                            \'has-error\': form.email.$invalid && submitted }"><label>Email</label><input type=email name=email class=form-control ng-model=user.email required mongoose-error><p class=help-block ng-show="form.email.$error.email && submitted">Doesn\'t look like a valid email.</p><p class=help-block ng-show="form.email.$error.required && submitted">What\'s your email address?</p><p class=help-block ng-show=form.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class="{ \'has-success\': form.password.$valid && submitted,\n                                            \'has-error\': form.password.$invalid && submitted }"><label>Password</label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show="(form.password.$error.minlength || form.password.$error.required) && submitted">Password must be at least 3 characters.</p><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.password }}</p></div><div><button class="btn btn-inverse btn-lg btn-login" type=submit>Sign up</button> <a class="btn btn-default btn-lg btn-register" href=/login>Login</a></div><!--\n        <hr>\n        <div>\n          <a class="btn btn-facebook" href="" ng-click="loginOauth(\'facebook\')">\n            <i class="fa fa-facebook"></i> Connect with Facebook\n          </a>\n          <a class="btn btn-google-plus" href="" ng-click="loginOauth(\'google\')">\n            <i class="fa fa-google-plus"></i> Connect with Google+\n          </a>\n          <a class="btn btn-twitter" href="" ng-click="loginOauth(\'twitter\')">\n            <i class="fa fa-twitter"></i> Connect with Twitter\n          </a>\n        </div>\n        --></form></div></div><hr></div>'),a.put("app/admin/admin.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><p>The delete user and user index api routes are restricted to users with the \'admin\' role.</p><ul class=list-group><li class=list-group-item ng-repeat="user in users"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user) class=trash><span class="glyphicon glyphicon-trash pull-right"></span></a></li></ul></div>'),a.put("app/main/main.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class="col-lg-12 beatschBlock"><div class=col-lg-6><div id=videoPlayer><youtube-video player-width="\'550\'" player-height="\'400\'" video-id=currentSong._song.videoId player-vars=playerVars></youtube-video></div></div><div class=col-lg-6><div class=beatschBlock id=playList><h1 class=page-header>VOTING QuEuE <span id=beatschTimer>{{ timer }}</span></h1><div id=addVideoForm><form class=thing-form><p class=input-group><input ng-model=newSong placeholder="Add a new song from Youtube here." typeahead="video as video.snippet.title for video in searchYoutube($viewValue) | filter: $viewValue" typeahead-loading=loadingLocations typeahead-wait-ms=0 class=form-control> <i ng-show=loadingLocations class="glyphicon glyphicon-refresh"></i> <span class=input-group-btn><button type=submit class="btn btn-default" ng-click=addSong()>Add New</button></span></p></form></div><div><ul class="beatschBlock nav nav-tabs nav-stacked"><li ng-repeat="track in playList | orderBy: \'-votes.length\'"><a href=# tooltip="{{ track._song.title }}" ng-click=voteFor(track._song)>{{ track._song.title }} Current Votes: {{ track.votes.length }}, Total votes: {{ track._song.votes.length }}</a></li></ul></div></div></div></div></div><div class=row><div class="col-lg-12 beatschBlock" id=playLog><h1 class=page-header>PLAYLIST</h1><ul class="beatschBlock nav nav-tabs nav-stacked col-md-12 col-lg-12 col-sm-12"><li class=beatschPlayLogItem ng-repeat="track in playLog | orderBy: \'date\'">{{ track.date }}: <b>{{ track._song.title }}</b> Current Votes: {{ track.votes.length }}, Total Votes: {{ track._song.votes.length }}</li></ul></div></div><div class=row><div class="col-lg-12 beatschBlock" id=songCatalog><h1 class=page-header>SONG CATALOG</h1><div infinite-scroll=songList.loadMore() infinite-scroll-distance=1><ul class="nav nav-tabs nav-stacked col-md-12 col-lg-12 col-sm-12"><li ng-repeat="song in catalog | orderBy: \'-votes.length\'"><a href=# tooltip={{song.title}} ng-click=voteFor(song)>{{ song.title }}, Votes: {{ song.votes.length }}</a></li></ul></div></div></div></div><footer class="footer navbar-fixed-bottom"><div class=container><div class=beatschChatBlock id=chatBlock><button id=chatToggleButton class="btn btn-default" ng-click="isCollapsed = !isCollapsed">TOGGLE Chat</button><div collapse=isCollapsed><div><h1 class=page-header>CHAT</h1><ul class="nav nav-tabs nav-stacked"><li class=beatschChatItem ng-repeat="chat in chats">{{chat.date}}: {{chat.body}}</li></ul></div><div><form class=chat-form><p class=input-group><input class=form-control placeholder="Chat here" ng-model=newChat> <span class=input-group-btn><button type=submit class="btn btn-default" ng-click=addChat()>Submit</button></span></p></form></div></div></div></div></footer>'),a.put("components/modal/modal.html",'<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'),a.put("components/navbar/navbar.html",'<div class="navbar navbar-default navbar-static-top" id=beatschNavBar ng-controller=NavbarCtrl><div class=container><div id=beatschHeader><a href="/"><img src="../../assets/images/8dc25a91.header.png"></a> Now Playing: <b>{{ currentSong._song.title }}</b></div><div class=navbar-header><button class=navbar-toggle type=button ng-click="isCollapsed = !isCollapsed"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button><!--<a href="/" class="navbar-brand">beatsch1</a>--></div><div collapse=isCollapsed class="navbar-collapse collapse" id=navbar-main><!--\n      <ul class="nav navbar-nav">\n        <li ng-repeat="item in menu" ng-class="{active: isActive(item.link)}">\n            <a ng-href="{{item.link}}">{{item.title}}</a>\n        </li>\n        <li ng-show="isAdmin()" ng-class="{active: isActive(\'/admin\')}"><a href="/admin">Admin</a></li>\n      </ul>\n      --><ul class="nav navbar-nav navbar-right" id=navLinks><li ng-hide=isLoggedIn() ng-class="{active: isActive(\'/signup\')}"><a href=/signup>Sign up</a></li><li ng-hide=isLoggedIn() ng-class="{active: isActive(\'/login\')}"><a href=/login>Login</a></li><li ng-show=isLoggedIn()><p class=navbar-text>Hello {{ getCurrentUser().name }}</p></li><li ng-show=isLoggedIn() ng-class="{active: isActive(\'/settings\')}"><a href=/settings><span class="glyphicon glyphicon-cog"></span></a></li><li ng-show=isLoggedIn() ng-class="{active: isActive(\'/logout\')}"><a href="" ng-click=logout()>Logout</a></li></ul></div></div></div>')}]);