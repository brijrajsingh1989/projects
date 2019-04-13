/**
 *
 * AngularJS selfieapp
 * @description           Description
 * @author                Jozef Butko // www.jozefbutko.com/resume
 * @url                   www.jozefbutko.com
 * @version               1.1.7
 * @date                  March 2015
 * @license               MIT
 *
 */
;
(function () {
    /**
     * Definition of the main app module and its dependencies
     */
    angular
            .module('selfieapp', [
                'ngRoute',
                'ngCookies',
                'ui.bootstrap',
                'ui.bootstrap.tpls',
//                'ui.bootstrap.modal',
                'uiSwitch',
                'rzModule',
//                '720kb.datepicker',
                '720kb.tooltips',
                'ziptastic',
                'ngLoadingOverlay',
                'LocalStorageModule',
                'mdo-angular-cryptography',
                'ngSanitize',
                'ngIdle'
            ]).run(['$rootScope','$http', function ($rootScope,$http) {
              toastr.options.showMethod = 'slideDown';
              toastr.options.hideMethod = 'slideUp';
              toastr.options.timeOut = 3000;
              toastr.options.preventDuplicates = true;
              $rootScope.endpoint = window.location.pathname;

              try {
                var i = sessionStorage.length;
                while(i--) {
                  var key = sessionStorage.key(i);
                  $rootScope[key] = sessionStorage.getItem(key);
                  //console.log('$rootScope[key]',$rootScope[key]);
                }
              } catch (e) {
                //console.log(e);
              } finally {

              }

    }]).config(function(IdleProvider, KeepaliveProvider) {
    // configure Idle settings
    IdleProvider.idle(840); // in seconds
    IdleProvider.timeout(60); // in seconds
    KeepaliveProvider.interval(120); // in seconds
    })
    .run(function(Idle){
        // start watching when the app runs. also starts the Keepalive service by default.
        Idle.watch();
    })
    .run(function($rootScope, $timeout){
      $rootScope.$watch(function(){
        $timeout(function(){
          dataLayer.push({'event': 'optimize.activate'});
        },0,false);
      })
    }).run(function ($rootScope, $location,$window) {
        $rootScope.$on('$routeChangeSuccess', function()
        {
          $window.dataLayer.push({
            event: 'pageview',
            page: $location.path(),
          });
        });
   })
    /*.config([
        '$loadingOverlayConfigProvider',
        function ($loadingOverlayConfigProvider) {
            // set own defaults
            $loadingOverlayConfigProvider.defaultConfig('<p class="loader-txt">Please Wait..</p>', 'rgba(43, 28, 28, 0.43)', '#000');
        }
    ])*/
    .config(config);

    // safe dependency injection
    // this prevents minification issues
    config.$inject = ['$routeProvider', '$locationProvider', '$httpProvider', '$compileProvider'];

    /**
     * App routing
     *
     * You can leave it here in the config section or take it out
     * into separate file
     *
     */
    function config($routeProvider, $locationProvider, $httpProvider, $compileProvider) {

        $locationProvider.html5Mode(false);

        // routes
        $routeProvider
                // .when('/', {
                //     templateUrl: 'views/main.html',
                //     controller: 'HomeController1',
                //     cache : false,
                //     controllerAs: 'main'
                // })
                .when('/', {
                    templateUrl: 'views/404page.html',
                    controller: 'HomeController1',
                    cache : false,
                    controllerAs: 'main'
                })
                .when('/home3', {
                    templateUrl: 'views/sf_home3.html',
                    controller: 'HomeController3',
                    controllerAs: 'main'
                })
                .when('/home4', {
                    templateUrl: 'views/sf_home4.html',
                    controller: 'HomeController4',
                    controllerAs: 'main'
                })
                .when('/error', {
                    templateUrl: 'views/sf_error_page.html',
                    controller: 'errorController',
                    controllerAs: 'main'
                })
                .when('/errorinfo', {
                    templateUrl: 'views/sf_error_info_page.html',
                    controller: 'infoErrorController',
                    controllerAs: 'main'
                })
                .when('/errorage', {
                    templateUrl: 'views/sf_error_age_page.html',
                    controller: 'ageErrorController',
                    controllerAs: 'main'
                })
                .when('/err',
                {
                  templateUrl: 'views/apierror.html',
                  controller: 'HomeController1',
                  controllerAs: 'main'
                })
                .when('/selfie_max_limit',{
                  templateUrl: 'views/selfie_max_limit.html',
                  // controller: 'HomeController1',
                  controllerAs: 'main'
                })
                .otherwise({
                    redirectTo: '/selfie-quote/'
                });
        $httpProvider.defaults.withCredentials = false;
        $httpProvider.interceptors.push('authInterceptor');
        document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
        });

    }


    /**
     * You can intercept any request or response inside authInterceptor
     * or handle what should happend on 40x, 50x errors
     *
     */
    angular
            .module('selfieapp')
            .factory('authInterceptor', authInterceptor);

    authInterceptor.$inject = ['$rootScope', '$q', 'LocalStorage', '$location'];

    function authInterceptor($rootScope, $q, LocalStorage, $location) {

        return {

            // intercept every request
            request: function (config) {
                config.headers = config.headers || {};
                return config;
            },

            // Catch 404 errors
            responseError: function (response) {
                if (response.status === 404) {
                    //$location.path('/');
                    return $q.reject(response);
                } else {
                    return $q.reject(response);
                }
            }
        };
    }


    /**
     * Run block
     */
    angular .module('selfieapp') .run();

    /*run.$inject = ['$rootScope', '$location'];

     function run($rootScope, $location) {
     // put here everything that you need to run on page load

     }*/
})();
