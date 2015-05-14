//configuration
var app = angular.module("myWorld", ['ngRoute']);
app.run(function(AuthSvc){
  AuthSvc.setUser();
});

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
    .when("/people/:id", {
      controller: "PersonCtrl",
      templateUrl: "/templates/person.html"
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
app.factory("AuthSvc", function($window, $q, $http){
  var _user = {
    authenticated: function(){
      return this.username != null;
    } 
  };
  return {
    authenticate: authenticate,
    setUser: setUser,
    logout: logout,
    user: _user,
    getToken: getToken
  }; 
  
  function getToken(){
    return $window.sessionStorage.getItem("token"); 
  }
  
  function logout(){
    delete _user.username;
    $window.sessionStorage.removeItem("token");
  }
  
  function setUser(){
    if(!$window.sessionStorage.getItem("token"))
      return;
    var dfd = $q.defer();
    $http.get("/api/session/" + $window.sessionStorage.getItem("token")).then(
      function(result){
        _user.username = result.data.username;
         dfd.resolve(result.data); 
      }
    );
    return dfd.promise;
  }
  
  function authenticate(user){
    var dfd = $q.defer();
    $http.post("/api/sessions", user).then(
      function(result){
        $window.sessionStorage.setItem("token", result.data);
        setUser().then(function(result2){
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

app.factory("PeopleSvc", function($q, $http, AuthSvc ){
  return {
    user: AuthSvc.user,
    deletePerson: function(person){
      var dfd = $q.defer();
      $http.delete("/api/people/" + person._id).then(
        function(result){
          dfd.resolve(result.data); 
        },
        function(result){
          dfd.reject(result.data); 
        }
      );
      return dfd.promise;
    },
    getPeople: function(){
      var dfd = $q.defer();
      $http.get("/api/people").then(function(result){
        dfd.resolve(result.data);
      });
      return dfd.promise;
    },
    getPerson: function(id){
      var dfd = $q.defer();
      $http.get("/api/people/" + id).then(function(result){
        dfd.resolve(result.data);
      });
      return dfd.promise;
    },
    insertPerson: function(person){
      var dfd = $q.defer();  
      $http.post("/api/people/" + AuthSvc.getToken(), person).then(
        function(result){
          console.log(result);
          dfd.resolve(result.data);
        },
        function(result){
          dfd.reject(result.data);
        }
      );
      return dfd.promise;
    },
    updatePerson: function(person){
      var dfd = $q.defer();  
      $http.post("/api/people/" + person._id + "/" + AuthSvc.getToken(), person).then(
        function(result){
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
app.factory("ThingsSvc", function($q, $http, AuthSvc ){
  return {
    user: AuthSvc.user,
    deleteThing: function(thing){
      var dfd = $q.defer();
      $http.delete("/api/things/" + thing._id +"/" + AuthSvc.getToken()).then(
        function(result){
          dfd.resolve(result.data); 
        },
        function(result){
          dfd.reject(result.data); 
        }
      );
      return dfd.promise;
    },
    getThings: function(){
      var dfd = $q.defer();
      $http.get("/api/things").then(function(result){
        dfd.resolve(result.data);
      });
      return dfd.promise;
    },
    getThing: function(id){
      var dfd = $q.defer();
      $http.get("/api/things/" + id).then(function(result){
        dfd.resolve(result.data);
      });
      return dfd.promise;
    },
    insertThing: function(thing){
      var dfd = $q.defer();  
      $http.post("/api/things/" + AuthSvc.getToken(), thing).then(
        function(result){
          console.log(result);
          dfd.resolve(result.data);
        },
        function(result){
          dfd.reject(result.data);
        }
      );
      return dfd.promise;
    },
    updateThing: function(thing){
      var dfd = $q.defer();
      $http.post("/api/things/" + thing._id + "/" + AuthSvc.getToken(), thing).then(
        function(result){
          dfd.resolve(result.data);
        },
        function(result){
          dfd.reject(result.data);
        }
      );
      return dfd.promise;
    }
  };
})
//controllers
app.controller("LoginCtrl", function($scope, $location, AuthSvc){
  if(AuthSvc.user.authenticated())
    $location.path("/");
  $scope.user = {};
  
  $scope.login = function(){
    AuthSvc.authenticate($scope.user).then(
      function(){
        $location.path("/"); 
      },
      function(error){
        $scope.token = null;
        $scope.error = error;
      }
    );
  };
});
app.controller("NavCtrl", function($scope, NavSvc, AuthSvc){
  $scope.tabs = NavSvc.tabs;
  $scope.user = AuthSvc.user;
  $scope.logout = function(){
    AuthSvc.logout();
  };
});

app.controller("HomeCtrl", function($scope, NavSvc){
  console.log("in home control");
  NavSvc.setTab("Home");
  $scope.message = "I am the home control"; 
});

app.controller("PeopleCtrl", function($scope, $location, NavSvc, PeopleSvc){
  NavSvc.setTab("People");
  $scope.message = "I am the people control";
  $scope.user = PeopleSvc.user;
  $scope.delete = function(person){
    PeopleSvc.deletePerson(person).then(
      function(){
        $scope.error = null;
        $scope.success = "User has been deleted";
        activate();
      },
      function(error){
        $scope.error = error;
      }
    );
  };
  $scope.edit = function(person){
    $location.path("/people/" + person._id);
  };
  $scope.insert = function(){
    $scope.inserting.active = true
    PeopleSvc.insertPerson($scope.inserting).then(
      function(person){
        $scope.success = "Insert successful for " + person.name;
        $scope.error = null;
        activate();
      },
      function(error){
        $scope.error = error;
        $scope.success = null;
      }
    );
  };
  function activate(){
    $scope.inserting = {
      active: false
    };
    PeopleSvc.getPeople().then(function(people){
      $scope.people = people;
    });
  }
  activate();
});

app.controller("PersonCtrl", function($scope, $location, $routeParams, NavSvc, PeopleSvc){
  NavSvc.setTab("People");
  $scope.save = function(){
    
    if ($scope.person.active === 'true') $scope.person.active = true
    else if ($scope.person.active === 'false') $scope.person.active = false

    PeopleSvc.updatePerson($scope.person).then(
      function(person){
        $location.path("/people");
      },
      function(error){
        $scope.error = error; 
      }
    );
  };
  function activate(){
    PeopleSvc.getPerson($routeParams.id).then(function(person){
      $scope.person = person;
    });
  }
  activate();
});

app.controller("ThingsCtrl", function($scope, $location, NavSvc, ThingsSvc){
  NavSvc.setTab("Things");
  $scope.message = "I am the things control";
  $scope.user = ThingsSvc.user;
  $scope.delete = function(thing){
    ThingsSvc.deleteThing(thing).then(
      function(){
        $scope.error = null;
        $scope.success = "User has been deleted";
        activate();
      },
      function(error){
        $scope.error = error;
      }
    );
  };
  $scope.edit = function(thing){
    $location.path("/things/" + thing._id);
  };
  $scope.insert = function(){
    ThingsSvc.insertThing($scope.inserting).then(
      function(thing){
        $scope.success = "Insert successful for " + thing.name;
        $scope.error = null;
        activate();
      },
      function(error){
        $scope.error = error;
        $scope.success = null;
      }
    );
  };
  function activate(){
    ThingsSvc.getThings().then(function(things){
      $scope.things = things;
    });
  }
  activate();
});

app.controller("ThingCtrl", function($scope, $location, $routeParams, NavSvc, ThingsSvc){
  NavSvc.setTab("Things");
  $scope.save = function(){
    ThingsSvc.updateThing($scope.thing).then(
      function(){
        $location.path("/things");
      },
      function(error){
        $scope.error = error; 
      }
    );
  };
  function activate(){
    ThingsSvc.getThing($routeParams.id).then(function(thing){
      $scope.thing = thing;
    });
  }
  activate();
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
    controller: "NavCtrl",
    scope: {
      showLoginButton: '@'
    }
  };
});
app.directive("foo", function(){
  return {
    restrict: "EA",
    templateUrl: "/templates/foo.html",
    controller: "FooCtrl",
    scope: {
    }
  }; 
});
