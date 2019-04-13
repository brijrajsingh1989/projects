'use strict';

/**
 * @ngdoc overview
 * @name legalGeneralApp
 * @description
 * # legalGeneralApp
 *
 * Main module of the application.
 */

angular
    .module('legalGeneralApp', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ui.router',
        'ziptastic',
        'ui.bootstrap',
        'ui.bootstrap.tpls',
        '720kb.tooltips',
        'toggle-switch',
        'ngLoadingOverlay',
        'angular.filter',
        'ngIdle',
        'LocalStorageModule',
        'mdo-angular-cryptography'
    ])
    .config(function ($sceProvider) {
        $sceProvider.enabled(false);
    })
    .run(['$rootScope', '$http', function ($rootScope, $http) {
        toastr.options.showMethod = 'slideDown';
        toastr.options.hideMethod = 'slideUp';
        toastr.options.timeOut = 3000;
        toastr.options.preventDuplicates = true;

        try {
            var i = sessionStorage.length;
            while (i--) {
                var key = sessionStorage.key(i);
                $rootScope[key] = sessionStorage.getItem(key);
                //console.log('$rootScope[key]',$rootScope[key]);
            }
        } catch (e) {
            //console.log(e);
        } finally {

        }

    }])
    .directive('dateMask', function(){
  	return {
  	    restrict: 'A',
      	    require: "ngModel",
      	    link: function (scope, elem, attr, ctrl) {
              $(elem).inputmask();
              elem.on('keyup', function () {
                  scope.$apply(function(){
                  ctrl.$setViewValue(elem.val());
                });
              });
            }
  	};
      })
    .config(['tooltipsConfProvider', function configConf(tooltipsConfProvider) {
        tooltipsConfProvider.configure({
            'smart': true,
            'size': 'small',
            'speed': 'fast',
            'side': 'bottom',
            'tooltipTemplateUrlCache': true
        });
    }])
    .config(function (IdleProvider, KeepaliveProvider) {
        // configure Idle settings
        IdleProvider.idle(840); // in seconds
        IdleProvider.timeout(60); // in seconds
        KeepaliveProvider.interval(120); // in seconds
    })
    .run(function (Idle) {
        // start watching when the app runs. also starts the Keepalive service by default.
        Idle.watch();
    })
    .config(function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(false);
        $routeProvider
            .when('/', {
                template: '<div ng-include="app_url"></div>',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/quote_data', {
                templateUrl: 'best/views/quote_data.html',
                controller: 'QuoteDataCtrl',
                controllerAs: 'main',
            })
            .when('/quote_data_no_premium', {
                templateUrl: 'best/views/quote_data_no_premium.html',
                controller: 'QuoteDataNoPremiumCtrl',
                controllerAs: 'main',
            })
            .when('/personal', {
                templateUrl: 'best/views/personal_info.html',
                controller: 'PersonalCtrl',
                controllerAs: 'main'
            })
            .when('/call_to_apply', {
                templateUrl: 'best/views/call_to_apply.html',
                controller: 'callToApplyCtrl',
                controllerAs: 'main',
            })
            .otherwise({
                redirectTo: '/'
            });
    }).run(function($rootScope, $timeout){
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
   });
