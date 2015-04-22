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
    });
    
    $locationProvider.html5Mode(true);
});
// services
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
app.controller("NavCtrl", function($scope, NavSvc){
  $scope.tabs = NavSvc.tabs;
  
});
app.controller("HomeCtrl", function($scope, NavSvc){
  console.log("in home control");
  NavSvc.setTab("Home");
  $scope.message = "I am the home control"; 
});

app.controller("PeopleCtrl", function($scope, NavSvc, PeopleSvc){
  NavSvc.setTab("People");
  $scope.inserting = {};
  $scope.message = "I am the people control";
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
app.directive("myWorldDirective", function(){
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