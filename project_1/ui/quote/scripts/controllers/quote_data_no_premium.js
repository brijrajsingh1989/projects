'use strict';

/**
 * @ngdoc function
 * @name legalGeneralApp.controller:QuotationCtrl
 * @description
 * # QuotationCtrl
 * Controller of the legalGeneralApp
 */
angular.module('legalGeneralApp')
  .controller('QuoteDataNoPremiumCtrl', function ($rootScope,$loadingOverlay, setStepMovement,$filter,$scope,quoteApiReq,$sce,dataCache,$location,$window, $http,$uibModal, quoteDataInfo, quoteRespList,appStorage) {

    var quoteData = JSON.parse((appStorage.get('quoteDataInfo') == 'undefined' || appStorage.get('quoteDataInfo') == null) ? '{}' : appStorage.get('quoteDataInfo'))
    var respData = JSON.parse((appStorage.get('quoteRespList') == 'undefined' || appStorage.get('quoteRespList') == null) ? '{}' : appStorage.get('quoteRespList'))
    var quoteApiReq = JSON.parse((appStorage.get('quoteApiReq') == 'undefined' || appStorage.get('quoteApiReq') == null) ? '{}' : appStorage.get('quoteApiReq'))
    if(!quoteData.step0_visited)
    {
      $location.path("/");
      return;
    }
    $scope.$on('tfn', function(events, toll_free_number){
      console.log("TFN received! ", toll_free_number);
       $scope.toll_free_number = toll_free_number
     })
    setStepMovement.setStepMovement(2222);
    $scope.openLegalStuff = function(){
      ////console.log("opeing legal stuff");
      $rootScope.modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'views/legalStuffQuote.html',
        scope:$scope
      });
    }

    $rootScope.closestuff = function(){
      ////console.log("closing")
      $scope.modalInstance.close();
    }

    $window.scrollTo(0, 0);
  })
