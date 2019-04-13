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
    'LocalStorageModule',
    'mdo-angular-cryptography'
  ])
  .config(function($sceProvider) {
    $sceProvider.enabled(false);
  })
  .run(['$rootScope','$http', function ($rootScope,$http) {
    toastr.options.showMethod = 'slideDown';
    toastr.options.hideMethod = 'slideUp';
    toastr.options.timeOut = 3000;
    toastr.options.preventDuplicates = true;

    try {
      var i = sessionStorage.length;
      while(i--) {
        var key = sessionStorage.key(i);
        $rootScope[key] = sessionStorage.getItem(key);
      }
    } catch (e) {
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
        'smart':true,
        'size':'small',
        'speed': 'fast',
        'side':'bottom',
        'tooltipTemplateUrlCache': true
        //etc...
      });
    }])
  .config(function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
      var val = Math.round(Math.random());
      $locationProvider.html5Mode(false);
      $routeProvider
        .when('/', {
          templateUrl: '/quote/views/main.html',
          controller: 'MainCtrl',
          controllerAs: 'main'
        })
        .when('/quote_data', {
          templateUrl: '/quote/views/quote_data.html',
          controller: 'QuoteDataCtrl',
          controllerAs: 'main',
        })
        .when('/quote_data_no_premium', {
          templateUrl: '/quote/views/quote_data_no_premium.html',
          controller: 'QuoteDataNoPremiumCtrl',
          controllerAs: 'main',
        })
        .when('/call_to_apply', {
          templateUrl: '/quote/views/call_to_apply.html',
          controller: 'callToApplyCtrl',
          controllerAs: 'main',
        })
        .otherwise({
          redirectTo: '/'
        });
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
 });
