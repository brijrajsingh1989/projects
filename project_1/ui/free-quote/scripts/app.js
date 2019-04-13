
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
          templateUrl: '/free-quote/views/main.html',//'views/main.html',//templateUrl: 'views/quote_one.html',//templateUrl: 'views/more_about_you.html',//templateUrl: 'views/beneficiary_details.html',//templateUrl: 'views/sign_application.html',//templateUrl: 'views/personal_info.html',//templateUrl: 'views/call_to_apply.html',//templateUrl: 'views/approval.html',//templateUrl: 'views/summary.html',//templateUrl: 'views/use_terms.html',//templateUrl: 'views/main.html',
          //template: '<div ng-include="app_url"></div>',
          controller: 'MainCtrl',
          controllerAs: 'main'
        })
        .when('/your-results', {
          templateUrl: '/free-quote/views/quote_data.html',
          controller: 'QuoteDataCtrl',
          controllerAs: 'main',
        })
        .when('/quote_data_no_premium', {
          templateUrl: '/free-quote/views/quote_data_no_premium.html',
          controller: 'QuoteDataNoPremiumCtrl',
          controllerAs: 'main',
        })
        .when('/thank-you', {
          templateUrl: '/free-quote/views/call_to_apply.html',
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
