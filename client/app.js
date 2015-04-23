//configuration
var app = angular.module("myWorld", ['ngRoute']);

app.config(function($routeProvider, $locationProvider){
  $routeProvider
    .when("/", {
      controller: "HomeCtrl",
      templateUrl: "/templates/home.html"
    })
    .when("/people", {
      controller: "PeopleCtrl",
      templateUrl: "/templates/people.html"
    })
    .when("/things", {
      controller: "ThingsCtrl",
      templateUrl: "/templates/things.html"
    })
    .when("/login", {
      controller: "LoginCtrl",
      templateUrl: "/templates/login.html"
    });
    
    $locationProvider.html5Mode(true);
});
// services
app.factory("AuthSvc", function($q, $http){
  var _user = {};
  return {
    authenticate: authenticate,
    setUser: setUser,
    user: _user
  }; 
  
  function setUser(token){
    var dfd = $q.defer();
    $http.get("/api/session/" + token).then(
      function(result){
         dfd.resolve(result.data); 
      }
    );
    return dfd.promise;
    
  }
  
  function authenticate(user){
    var dfd = $q.defer();
    $http.post("/api/sessions", user).then(
      function(result){
        var token = result.data;
        setUser(token).then(function(result2){
          _user.username = result2.username;
          dfd.resolve(_user); 
        });
      },
      function(result){
        dfd.reject(result.data.error);
      }
    );
    return dfd.promise;
  }
});

app.factory("PeopleSvc", function($q, $http ){
  return {
    getPeople: function(){
      var dfd = $q.defer();
      $http.get("/api/people").then(function(result){
        dfd.resolve(result.data);
      });
      return dfd.promise;
    },
    insertPerson: function(person){
      var dfd = $q.defer();  
      $http.post("/api/people", person).then(
        function(result){
          console.log(result);
          dfd.resolve(result.data);
        },
        function(result){
          dfd.reject(result.data);
        }
      );
      return dfd.promise;
    }
  };
});
app.factory("NavSvc", function(){
  var _tabs = [
    {
      title: "Home",
      path: "/",
      active: true
    },
    {
      title: "People",
      path: "/people"
    },
    {
      title: "Things",
      path: "/things"
    }
  ];
  return {
    tabs: _tabs,
    setTab: function(title){
      _tabs.forEach(function(tab){
        if(tab.title == title) 
          tab.active = true;
        else
          tab.active = false;
      });
    }
  };
});

//controllers
app.controller("LoginCtrl", function($scope, AuthSvc){
  $scope.user = {};
  
  $scope.login = function(){
    AuthSvc.authenticate($scope.user).then(
      function(token){
        $scope.token = token;
        $scope.error = null;
      },
      function(error){
        $scope.token = null;
        $scope.error = error;
      }
    );
  };
});
app.controller("NavCtrl", function($scope, NavSvc){
  $scope.tabs = NavSvc.tabs;
  
});
app.controller("HomeCtrl", function($scope, NavSvc){
  console.log("in home control");
  NavSvc.setTab("Home");
  $scope.message = "I am the home control"; 
});

app.controller("PeopleCtrl", function($scope, NavSvc, PeopleSvc, AuthSvc){
  NavSvc.setTab("People");
  $scope.inserting = {};
  $scope.message = "I am the people control";
  $scope.user = AuthSvc.user;
  $scope.insert = function(){
    PeopleSvc.insertPerson($scope.inserting).then(
      function(person){
        $scope.success = "Insert successful for " + person.name;
        $scope.error = null;
        $scope.inserting = {};
        activate();
      },
      function(error){
        $scope.error = error;
        $scope.success = null;
      }
    );
  };
  function activate(){
    PeopleSvc.getPeople().then(function(people){
      $scope.people = people;
    });
  }
  activate();
});

app.controller("ThingsCtrl", function($scope, NavSvc){
  NavSvc.setTab("Things");
  $scope.message = "I am the things control";
});

app.controller("FooCtrl", function($scope){
  var rnd = Math.random();
  console.log(rnd);
  $scope.message = rnd; 
});

//directives
app.directive("myWorldNav", function(){
  return {
    restrict: "E",
    templateUrl: "/templates/nav.html",
    controller: "NavCtrl"
  }
});
app.directive("foo", function(){
  return {
    restrict: "EA",
    templateUrl: "/templates/foo.html",
    controller: "FooCtrl",
    scope: {}
  }; 
});