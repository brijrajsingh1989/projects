/**
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 *
 */
;



(function() {


    angular
        .module('selfieapp')
        .controller('apierrorController', function($scope, $location,insert_step_movement, $http,appStorage)
        {
          window.addEventListener('popstate', function () {
            if(document.URL.endsWith('selfie-quote/#!/') || document.URL.indexOf('selfie_max_limit')>-1 || document.URL.endsWith('errorinfo') || document.URL.endsWith('errorage') || document.URL.endsWith('err')){
               history.pushState(null, null, document.URL);
            }
          });
          insert_step_movement.insertStepMovement(25)
          $scope.$on('$locationChangeStart', function(event, next, current){
           event.preventDefault();
           });
        })
})();
