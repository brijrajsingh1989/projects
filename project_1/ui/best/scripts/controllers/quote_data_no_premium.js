'use strict';

/**
 * @ngdoc function
 * @name legalGeneralApp.controller:QuotationCtrl
 * @description
 * # QuotationCtrl
 * Controller of the legalGeneralApp
 */
angular.module('legalGeneralApp')
    .controller('QuoteDataNoPremiumCtrl', function ($rootScope, $loadingOverlay, $filter, $scope, quoteApiReq, setStepMovement, $sce, dataCache, $location, $window, $http, $uibModal, quoteDataInfo, quoteRespList, appStorage, $cookies,$document) {

        var quoteData = JSON.parse((appStorage.get('quoteDataInfo') == 'undefined' || appStorage.get('quoteDataInfo') == null) ? '{}' : appStorage.get('quoteDataInfo'))
        var respData = JSON.parse((appStorage.get('quoteRespList') == 'undefined' || appStorage.get('quoteRespList') == null) ? '{}' : appStorage.get('quoteRespList'))
        var quoteApiReq = JSON.parse((appStorage.get('quoteApiReq') == 'undefined' || appStorage.get('quoteApiReq') == null) ? '{}' : appStorage.get('quoteApiReq'))
        quoteData.health = Number(quoteData.health);
        quoteData.tobacco = (quoteData.tobacco === true || quoteData.tobacco === "true") ? (true) : (false);
        quoteData.quit_tabacco = (quoteData.tobacco === true || quoteData.tobacco === "true") ? Number(quoteData.quit_tabacco) : null;
        quoteData.tenure = Number(quoteData.tenure)
        $scope.personal_info = {}
        $scope.$on('tfn', function(events, toll_free_number){
          console.log("TFN received! ", toll_free_number);
           $scope.toll_free_number = toll_free_number
         })
        var x = quoteData.amount.split('$');
        x = x[1].split(',').join('');
        $scope.coverage_amount = Number(x) / 1000;
        if (!quoteData.step0_visited) {
            $location.path("/");
            return;
        }
        console.log("Quote data from main page is ", quoteData);
        if (quoteData.isEverQuote == true){
          $scope.personal_info.first_name = quoteData.first_name;
          $scope.personal_info.last_name = quoteData.last_name;
          $scope.personal_info.mobile_number = quoteData.mobile_number;
          $scope.personal_info.email_address = quoteData.email_address;
        }
        $scope.amount = quoteData.amount;
        $scope.premium = 0;
        $scope.amountList = respData.comparisonPremiumsByFace;
        $scope.dob = quoteData.dob;
        $scope.user_height = quoteData.height;
        $scope.state_name = quoteData.state_name;
        $scope.tobacco_user = quoteData.tobacco;
        $scope.overall_health = quoteData.health;
        $scope.coverage_through_age = getAge(quoteData.dob) + quoteData.tenure;
        $scope.tenure = quoteData.tenure.toString();
        $scope.coverage_amount = '';
        $scope.monthly_coverage = ''; //207.77;
        $scope.term_duration = '';

        setStepMovement.setStepMovement(222);

        function numberWithCommas(x) {
            if (x !== null && x !== undefined) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        }

        $scope.openLegalStuff = function () {
            $rootScope.modalInstance = $uibModal.open({
                animation: true
                , templateUrl: 'best/views/legalStuffQuote.html'
                , scope: $scope
            });
        }

        $rootScope.closestuff = function () {
            $scope.modalInstance.close();
        }

        var health = [" ", "I'm working on it", "Average", "Fit", "Super Fit"];


        function getAge(dateString) {
            dateString = dateString.replace(/-/g, '/');
            var today = new Date();
            var birthDate = new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }

        $scope.mobileNumberInput = function (event) {
            if (event.keyCode != 8 && $scope.personal_info.mobile_number != undefined && event.keyCode != 229) {
                if (($scope.personal_info.mobile_number.length == 3 || $scope.personal_info.mobile_number.length == 7))
                    $scope.personal_info.mobile_number += '-';
            }
        }
        $scope.checkMobile = function (mobile, ignore_message) {
            if (mobile !== undefined && mobile !== null && mobile !== "") { //Data exists
                if (mobile !== null && mobile != undefined) {
                    mobile = mobile.replace(/-/g, '');
                    if (mobile.length !== 10) {
                        if (ignore_message !== 1) {
                            toastr.error('Enter valid contact number.', 'Attention')
                            return -1;
                        }
                        return -1;
                    }
                }
            } else { //No mobile data
                return -1;
            }
        }
        $scope.verifyMobileNumber = function(){

          if ($scope.personal_info.first_name == "" || $scope.personal_info.first_name == undefined || $scope.personal_info.first_name == null) {
              toastr.error('Please Enter First Name.', 'Attention')
              return
          }
          if ($scope.personal_info.last_name == "" || $scope.personal_info.last_name == undefined || $scope.personal_info.last_name == null) {
              toastr.error('Please Enter Last Name.', 'Attention')
              return
          }
          if ($scope.checkMobile($scope.personal_info.mobile_number, 1) == -1) {
              toastr.error('Please Enter a valid Phone Number.', 'Attention')
              return
          }
          if ($scope.checkEmail($scope.personal_info.email_address, 1) == -1) {
              toastr.error('Please Enter a valid Email ID.', 'Attention')
              return
          }

          if (isValid($scope.personal_info.mobile_number)){
            if ($scope.personal_info.mobile_number.length === 12){
              var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
              $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
              var num = "+1" + $scope.personal_info.mobile_number.replace(/-/g, '')
              $http.post("/api/v1/verify_phone_number", {"phone_number": num})
              .then(function(data){
                console.log("Success", data);
                $scope.quote_data_apply();
              }, function(err){
                 $loadingOverlay.hide();
                console.log("err", err);
                //$scope.personal_info.mobile_number = "";
                toastr.error('Please enter a valid phone number where we can reach you.', 'Attention')
              })
            }
          }
        }
        $scope.checkEmail = function (email, ignore) {
            if (email !== null && email !== undefined && email !== "") {
                if (email.match(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i) == null) {
                    if (ignore !== 1)
                        toastr.error('Enter valid contact email.', 'Attention')
                    return -1;
                }
            } else {
                return -1
            }
        }

        $scope.quote_data_apply = function () {
            //console.log("Personal Info ", $scope.personal_info);
            //console.log("Premiuum is ", $scope.premium);
            // if ($scope.personal_info.first_name == "" || $scope.personal_info.first_name == undefined || $scope.personal_info.first_name == null) {
            //     toastr.error('Please Enter First Name.', 'Attention')
            //     return
            // }
            // if ($scope.personal_info.last_name == "" || $scope.personal_info.last_name == undefined || $scope.personal_info.last_name == null) {
            //     toastr.error('Please Enter Last Name.', 'Attention')
            //     return
            // }
            // if ($scope.checkMobile($scope.personal_info.mobile_number, 1) == -1) {
            //     toastr.error('Please Enter a valid Phone Number.', 'Attention')
            //     return
            // }
            // if ($scope.checkEmail($scope.personal_info.email_address, 1) == -1) {
            //     toastr.error('Please Enter a valid Email ID.', 'Attention')
            //     return
            // }
            // $scope.amount = '$0';
            quoteData.amount = $scope.amount.replace(/,/g, "");;
            quoteData.tenure = $scope.tenure;
            quoteData.premium = $scope.premium;
            quoteData.step1_visited = true;
            quoteDataInfo.setQuoteDataInfo(quoteData);
            quoteData.Case_Id = appStorage.get('case_id');
            quoteData.amount = quoteData.amount.replace("$", '');
            quoteData.lga_response_code = '';
            quoteData.premium = 0;

            // var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
            // $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
            $http.post("/api/v1/quote_data_info", quoteData)
                .then(function (data) {
                    $http.post("/api/v1/personal_info", $scope.personal_info)
                        .then(function (data) {
                                //console.log("Success", data);
                            }
                            , function (err) {
                                //console.log("err", err);
                            })
                    $loadingOverlay.hide();
                    try {
                        $window.dataLayer.push({
                            event: "GAEvent"
                            , eventCategory: "quoting"
                            , eventAction: "personal_infoV2"
                            , eventLabel: appStorage.get('cid')
                            , eventValue: $scope.premium
                        }, {
                            event: "GAEvent"
                            , eventCategory: "conversion"
                            , eventAction: "lead"
                            , eventLabel: "call_to_apply"
                            , eventValue: ($scope.premium * 12)
                        });

                        if (appStorage.get('quoteDataInfo') !== undefined && appStorage.get('quoteDataInfo') !== null) {
                            var quoteData = JSON.parse(appStorage.get('quoteDataInfo'));
                            if(quoteData.isEverQuote && (($cookies.get("gtm_last_visit"))?$cookies.get("gtm_last_visit").toLowerCase().includes("e001"):(($cookies.get("gtm_first_visit"))?$cookies.get("gtm_first_visit").toLowerCase().includes("e001"):false)))
                            {
                              //ever-quote pixel on personal info submit
                              //var myEl = angular.element( document.querySelector('#pixels'));
                              var myEl = $document.find('body').eq(0);
                              myEl.append('<div id="p.adh8.com:pixel"><img style="display:none" width="0" height="0" src="https://p.everquote.com/f?mode=pixel&event=CMZR3PRF9HAYHXD&adhid='+quoteData.adhid+'&psrc=7"/></div>');
                            }
                        }
                    } catch (e) {}
                    $location.path("/call_to_apply");
                }, function (err) {
                    $loadingOverlay.hide();
                    $location.path("/call_to_apply");
                })
        }

        $scope.quote_data_back = function () {
            $location.path("/abc");
            return;
        }
        $window.scrollTo(0, 0);


    })
    .filter('health', function () {
        return function (value) {
            //console.log(" gender value",value);
            if (value == "4") {
                return "Super Fit";
            } else if (value == "3") {
                return "Fit";
            } else if (value == "2") {
                return "Average";
            } else {
                return "I'm working on it";
            }
        }
    })
    .filter('tobacco', function () {
        return function (value) {
            //console.log(" gender value",value);
            if (value == false) {
                return "No";
            } else {
                return "Yes";
            }
        }
    })
    .directive('convertToNumber', function () {
        return {
            require: 'ngModel'
            , link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (val) {
                    return parseInt(val, 10);
                });
                ngModel.$formatters.push(function (val) {
                    return '' + val;
                });
            }
        };
    })
    .filter('incomeSplitter', function () {
        return function (value) {
            //console.log("income received",value);
            if (value !== null && value !== undefined) {
                value = value.toString()
                    .split(/(?=(?:\d{3})+$)/)
                    .join(",");
                return '$' + value;
                //console.log(new_value);
            }
        }
    })
    .filter('tenure', function () {
        return function (value) {
            //console.log(" gender value",value);
            if (value == 1) {
                return 10;
            } else if (value == 2) {
                return 15;
            } else if (value == 3) {
                return 20;
            } else if (value == 4) {
                return 25;
            } else {
                return 30;
            }
        }
    })
