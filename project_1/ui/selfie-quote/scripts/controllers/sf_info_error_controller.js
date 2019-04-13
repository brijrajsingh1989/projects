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
        .controller('infoErrorController', function($scope, $location, $sce, $loadingOverlay,insert_step_movement, $http,appStorage)
        {

          $scope.attributeDefault = function()
          {
            $scope.ui_attributes = {
                "selfie_errorinfo_paragraph_title": $sce.trustAsHtml("Unfortunately we can’t provide you an online quote."),
                "selfie_errorinfo_paragraph_title_m": $sce.trustAsHtml("Unfortunately we can’t provide <br> you an online quote."),
                "selfie_errorinfo_slogan_large1": $sce.trustAsHtml('If you wish to speak with a licensed life insurance agent to discuss your options,<br> <b style="font-weight:400;">please call: 1-888-984-3393</b>.')
            }
          }
          $scope.attributeDefault();
          window.addEventListener('popstate', function () {
            //console.log(document.URL);
            //console.log(document.URL.endsWith('selfie-quote/#!/'));
            //console.log(document.URL.indexOf('selfie_max_limit'));
            if(document.URL.endsWith('selfie-quote/#!/') || document.URL.indexOf('selfie_max_limit')>-1 || document.URL.endsWith('errorinfo') || document.URL.endsWith('errorage') || document.URL.endsWith('err')){
               //console.log("Inside Push State");
               history.pushState(null, null, document.URL);
            }else{
              //lowindow.history.back();
              //console.log("Browser default");
            }
          });
            $(document).ready(function(){
              $loadingOverlay.hide()
              insert_step_movement.insertStepMovement(28)
            })
            $scope.$on('$locationChangeStart', function(event, next, current){
             event.preventDefault();
             });
        })
      })();
