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
        .controller('ageErrorController', function($scope, $location,$loadingOverlay, $sce, insert_step_movement, $http,appStorage)
        {
          $scope.attributeDefault = function(){
            $scope.ui_attributes = {
               "selfie_errorage_paragraph_title": $sce.trustAsHtml("Unfortunately we can’t provide you an online quote."),
               "selfie_errorage_paragraph_title_m": $sce.trustAsHtml("Unfortunately we can’t provide <br> you an online quote."),
               "selfie_errorage_slogan_large": $sce.trustAsHtml("Sorry, you must be between the ages of 20 and 75 to be eligible for term life insurance."),
               "selfie_errorage_slogan_large_m": $sce.trustAsHtml("Sorry, you must be between the ages<br> of 20 and 75 to be eligible for term <br>life insurance.")
             }
          }
          $scope.attributeDefault();
          window.addEventListener('popstate', function () {
            // console.log(document.URL);
            // console.log(document.URL.endsWith('selfie-quote/#!/'));
            // console.log(document.URL.indexOf('selfie_max_limit'));
            if(document.URL.endsWith('selfie-quote/#!/') || document.URL.indexOf('selfie_max_limit')>-1 || document.URL.endsWith('errorinfo') || document.URL.endsWith('errorage') || document.URL.endsWith('err')){
               // console.log("Inside Push State");
               history.pushState(null, null, document.URL);
            }else{
              // lowindow.history.back();
              // console.log("Browser default");
            }
          });
          $(document).ready(function(){
            $loadingOverlay.hide()
            insert_step_movement.insertStepMovement(26)
          })
          $scope.$on('$locationChangeStart', function(event, next, current){
           event.preventDefault();
           });
        })
})();
