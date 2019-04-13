'use strict';

/**
 * @ngdoc function
 * @name legalGeneralApp.controller:QuotationCtrl
 * @description
 * # QuotationCtrl
 * Controller of the legalGeneralApp
 */
angular.module('legalGeneralApp')
    .controller('QuoteDataCtrl', function ($rootScope, $loadingOverlay, $filter, $scope, quoteApiReq, $sce, dataCache, $location, $window, setStepMovement, $http, $uibModal, quoteDataInfo, quoteRespList, appStorage, $cookies,$document) {

        var quoteData = JSON.parse((appStorage.get('quoteDataInfo') == 'undefined' || appStorage.get('quoteDataInfo') == null) ? '{}' : appStorage.get('quoteDataInfo'))
        var respData = JSON.parse((appStorage.get('quoteRespList') == 'undefined' || appStorage.get('quoteRespList') == null) ? '{}' : appStorage.get('quoteRespList'))
        var quoteApiReq = JSON.parse((appStorage.get('quoteApiReq') == 'undefined' || appStorage.get('quoteApiReq') == null) ? '{}' : appStorage.get('quoteApiReq'))
        quoteData.health = Number(quoteData.health);
        quoteData.tobacco = (quoteData.tobacco === true || quoteData.tobacco === "true") ? (true) : (false);
        quoteData.quit_tabacco = (quoteData.tobacco === true || quoteData.tobacco === "true") ? Number(quoteData.quit_tabacco) : null;
        quoteData.tenure = Number(quoteData.tenure)
        $scope.personal_info = {}
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
        setStepMovement.setStepMovement(2);
        /* preparing for slider*/
        $scope.term_lengths = [10, 15, 20, 25, 30]
        var x = quoteData.amount.split('$');
        x = x[1].split(',').join('');
        //console.log("new x",x);
        $scope.coverage_amount = Number(x) / 1000;
        $scope.$on('tfn', function(events, toll_free_number){
          console.log("TFN received! ", toll_free_number);
           $scope.toll_free_number = toll_free_number
         })
        var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
        $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
        var req_data = {
            'stateCode': quoteData.state_name
            , 'dateOfBirth': quoteData.dob.replace(/ /g, '').replace(/-/g, '/')
            , 'isTobaccoUser': (quoteData.tobacco)
        , }
        $http.post('/api/v1/dynamic_term_length', req_data)
            .then(function (data) {
                $loadingOverlay.hide();
                if (data.data.data.termLengths) {
                    $scope.term_lengths = data.data.data.termLengths
                }
            }, function (err) {
                $loadingOverlay.hide();
                //console.log("error", err);
            })
        $scope.amount = quoteData.amount;
        $scope.premium = respData.modalPremium;
        $scope.premium = decimalPlace($scope.premium)
        document.getElementById('premiumLbl').innerHTML = $scope.premium;
        $scope.amountList = respData.comparisonPremiumsByFace
        $scope.dob = quoteData.dob;
        $scope.coverage_through_age = getAge(quoteData.dob) + quoteData.tenure;
        $scope.tenure = quoteData.tenure.toString();
        $scope.coverage_amount = '';
        $scope.monthly_coverage = ''; //207.77;
        $scope.term_duration = '';

        $scope.sliderVal = parseInt(quoteData.amount.split("$")[1].replace(/,/g, ""));
        //console.log($scope.sliderVal);
        var tmp = document.getElementById('ex1')
        if ($scope.sliderVal <= 1000000) {
            //Case 1
            $scope.sliderMin = 100000;
            $scope.sliderMax = 1000000;
            $scope.sliderRange = 50000;
        } else if ($scope.sliderVal > 1000000 && $scope.sliderVal <= 2500000) {
            //Case 2
            $scope.sliderMin = 100000;
            $scope.sliderMax = 2500000;
            $scope.sliderRange = 100000;
        } else if ($scope.sliderVal > 2500000 && $scope.sliderVal < 5000000) {
            //Case 3
            $scope.sliderMin = 2500000;
            $scope.sliderMax = 5000000;
            $scope.sliderRange = 250000;
        } else {
            //Case 4
            $scope.sliderMin = 1000000;
            $scope.sliderMax = 10000000;
            $scope.sliderRange = 500000;
        }
        tmp.setAttribute('data-slider-value', $scope.sliderVal);
        tmp.setAttribute('data-slider-min', $scope.sliderMin);
        tmp.setAttribute('data-slider-max', $scope.sliderMax);
        tmp.setAttribute('data-slider-step', $scope.sliderRange);

        var slider = new Slider('#ex1', {
            formatter: function (value) {
                value = parseInt(value);
                $scope.sliderVal = value;
                $scope.premium = calcPremium(value);
                $scope.premium = decimalPlace($scope.premium)
                    //console.log($scope.premium);
                var t = document.getElementById('hiddenFaceamount')
                if (t !== null && t !== undefined) {
                    t.value = $scope.sliderVal;
                }
                t = document.getElementById('premiumLbl')
                if (t !== null && t !== undefined) {
                    t.innerHTML = $scope.premium;
                }
                t = document.getElementById('currentAmount')
                if (t !== null && t !== undefined) {
                    t.innerHTML = '$' + numberWithCommas($scope.sliderVal);
                }
                return 'Current value: $' + numberWithCommas($scope.sliderVal);
            }
        });

        function calcPremium(data) {
            for (var i = 0; i < $scope.amountList.length; i++) {
                if (data === $scope.amountList[i].faceAmount) {
                    return ($scope.amountList[i].modalPremium)
                }
            }
        }

        $scope.change_monthly_coverage_amt = function (coverage_amt) {
            $scope.monthly_coverage = coverage_amt;
        }

        $scope.tenureModified = function () {
            var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
            $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
            quoteData.tenure = parseInt($scope.tenure);
            quoteData.faceAmount = document.getElementById('hiddenFaceamount')
                .value;
            quoteDataInfo.setQuoteDataInfo(quoteData);
            quoteApiReq.termDuration = $scope.tenure;
            quoteApiReq.faceAmount = document.getElementById('hiddenFaceamount')
                .value;
            $scope.amount = "$" + document.getElementById('hiddenFaceamount')
                .value;

            var url = "/api/v1/quote_data";
            $http.post(url, quoteApiReq)
                .then(function (data) {
                    //console.log("data from lga",data.data.data);
                    try {
                        let returnData = data.data.data
                        quoteRespList.setQuoteResp(returnData);
                        $scope.premium = decimalPlace(returnData.modalPremium);
                        document.getElementById('premiumLbl').innerHTML = $scope.premium;
                        $scope.coverage_through_age = getAge(quoteData.dob) + quoteData.tenure;
                        $scope.amountList = returnData.comparisonPremiumsByFace;
                        quoteData.lga_response_code = (returnData.status.statusCode == null || returnData.status.statusCode === "" ) ? 0 : returnData.status.statusCode;
                        $loadingOverlay.hide();
                        if (returnData.isEligible === false && returnData.status.errors.length > 0) {
                            $loadingOverlay.hide();
                            //console.log("displaying error message");
                            toastr.error(returnData.status.errors[0], 'Attention!');
                        } else if (returnData.isEligible != true) {
                            //console.log("call to apply");
                        }

                    } catch (e) {
                        //console.log(e);
                    }
                }, function (error) {
                    //console.log("error",error);
                })
        }


        $scope.coverage_change = function (cov) {
            //console.log("coverage change",cov);
            var com_amt = cov.split("$");
            var amt = com_amt[1].replace(/,/g, "");
            amt = Number(amt);
            //console.log("amt",Number(amt));
            //console.log("list",$scope.amountList);
            var list = $scope.amountList;
            var found = false;
            angular.forEach(list, function (value, key) {
                if (!found)
                //console.log("value",value.faceAmount);
                    if (value.faceAmount === amt) {
                    //console.log("amount found",value);
                    $scope.premium = value.modalPremium;
                    //console.log($scope.premium);
                    $scope.premium = decimalPlace($scope.premium)
                    document.getElementById('premiumLbl')
                        .innerHTML = $scope.premium;
                    found = true;
                }
            });
        }
        $scope.amount_range = [
            "$100,000", "$150,000", "$200,000", "$250,000", "$300,000", "$350,000", "$400,000"
            , "$450,000", "$500,000", "$550,000", "$600,000", "$650,000", "$700,000", "$750,000"
            , "$800,000", "$850,000", "$900,000", "$950,000", "$1,000,000", "$2,000,000", "$3,000,000"
            , "$4,000,000", "$5,000,000", "$6,000,000", "$7,000,000", "$8,000,000", "$9,000,000"
            , "$10,000,000"
        ]

        function numberWithCommas(x) {
            if (x !== null && x !== undefined) {
                return x.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        }

        $scope.bind_slider = function () {
            //set time range slider value
            var coverage_amount = quoteData.amount.split('$');
            coverage_amount = coverage_amount[1].split(',').join('');

            coverage_amount = Number(coverage_amount) / 1000;
            var tooltipElement = $('<div id="monthly_coverage_lbl" class="ui-slider-tooltip" aria-hidden="true" />');
            //console.log('tooltipElement',tooltipElement);
            var tooltip;
            var values = respData.comparisonPremiumsByFace;

            function findNearest(includeLeft, includeRight, value) {
                var nearest = null;
                var diff = null;
                for (var i = 0; i < values.length; i++) {
                    if ((includeLeft && values[i].faceAmount <= value) || (includeRight && values[i].faceAmount >= value)) {
                        var newDiff = Math.abs(value - values[i].faceAmount);
                        if (diff === null || newDiff < diff) {
                            nearest = values[i].faceAmount;
                            diff = newDiff;
                        }
                    }
                }
                return nearest;
            }
        }
        $scope.bind_slider();

        $scope.openLegalStuff = function () {
            //console.log("opeing legal stuff");
            $rootScope.modalInstance = $uibModal.open({
                animation: true
                , templateUrl: 'smart-term/views/legalStuffQuote.html'
                , scope: $scope
            });
        }

        $rootScope.closestuff = function () {
            $scope.modalInstance.close();
        }
        var health = [" ", "I'm working on it", "Average", "Fit", "Super Fit"];


        function getAge(dateString) {
            dateString = dateString.replace(/-/g, '/');
            //console.log("Replaced string is "+ dateString);
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
                if (($scope.personal_info.mobile_number.length === 3 || $scope.personal_info.mobile_number.length === 7))
                    $scope.personal_info.mobile_number += '-';
            }
        }
        $scope.checkMobile = function (mobile, ignore_message) {
            if (mobile !== undefined && mobile !== null && mobile !== "") { //Data exists
                if (mobile !== null && mobile != undefined) {
                    mobile = mobile.replace(/-/g, '');
                    if ((mobile.length !== 10) || (mobile.match(/^-?\d+\.?\d*$/) === null)) {
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
          if ($scope.personal_info.first_name === "" || $scope.personal_info.first_name === undefined || $scope.personal_info.first_name === null) {
              toastr.error('Please Enter First Name.', 'Attention')
              return
          }
          if ($scope.personal_info.last_name === "" || $scope.personal_info.last_name === undefined || $scope.personal_info.last_name === null) {
              toastr.error('Please Enter Last Name.', 'Attention')
              return
          }
          if ($scope.checkMobile($scope.personal_info.mobile_number, 1) === -1) {
              toastr.error('Please Enter a valid Phone Number.', 'Attention')
              return
          }
          if ($scope.checkEmail($scope.personal_info.email_address, 1) === -1) {
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
                console.log("err", err);
                $loadingOverlay.hide();
                //$scope.personal_info.mobile_number = "";
                toastr.error('Please enter a valid phone number where we can reach you.', 'Attention')
              })
            }
          }
        }
        $scope.checkEmail = function (email, ignore) {
            if (email !== null && email !== undefined && email !== "") {
                if (email.match(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i) === null) {
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
            // if ($scope.personal_info.first_name === "" || $scope.personal_info.first_name === undefined || $scope.personal_info.first_name === null) {
            //     toastr.error('Please Enter First Name.', 'Attention')
            //     return
            // }
            // if ($scope.personal_info.last_name === "" || $scope.personal_info.last_name === undefined || $scope.personal_info.last_name === null) {
            //     toastr.error('Please Enter Last Name.', 'Attention')
            //     return
            // }
            // if ($scope.checkMobile($scope.personal_info.mobile_number, 1) === -1) {
            //     toastr.error('Please Enter a valid Phone Number.', 'Attention')
            //     return
            // }
            // if ($scope.checkEmail($scope.personal_info.email_address, 1) === -1) {
            //     toastr.error('Please Enter a valid Email ID.', 'Attention')
            //     return
            // }
            $scope.amount = "$" + document.getElementById('hiddenFaceamount').value;
            quoteData.amount = $scope.amount;
            quoteData.tenure = $scope.tenure;
            quoteData.premium = $scope.premium;
            quoteData.step1_visited = true;
            quoteDataInfo.setQuoteDataInfo(quoteData);
            quoteData.Case_Id = appStorage.get('case_id');
            quoteData.amount = quoteData.amount.replace("$", '');
            quoteData.lga_response_code = '';
            // var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
            // $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
            $http.post("/api/v1/quote_data_info", quoteData)
                .then(function (data) {
                    $http.post("/api/v1/personal_info", $scope.personal_info)
                        .then(function (data) {
                                //console.log("Success", data);
                            }
                            , function (err) {
                                // console.log("err", err);
                            })
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
                    // console.log("Data layer is ", $window.dataLayer);
                    $loadingOverlay.hide();
                    $location.path("/call_to_apply");
                }, function (err) {
                    $loadingOverlay.hide();
                    $location.path("/call_to_apply");
                })
            return;
        }


        $scope.openLegalStuff = function () {
            // console.log("opeing legal stuff");
            $rootScope.modalInstance = $uibModal.open({
                animation: true
                , templateUrl: 'smart-term/views/legalStuffQuote.html'
                , scope: $scope
            });
        }

        $window.scrollTo(0, 0);


    })
    .filter('health', function () {
        return function (value) {
            if (value === "4") {
                return "Super Fit";
            } else if (value === "3") {
                return "Fit";
            } else if (value === "2") {
                return "Average";
            } else {
                return "I'm working on it";
            }
        }
    })
    .filter('tobacco', function () {
        return function (value) {
            if (value === false) {
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
            if (value !== null && value !== undefined) {
                value = value.toString()
                    .split(/(?=(?:\d{3})+$)/)
                    .join(",");
                return '$' + value
            }
        }
    })
    .filter('tenure', function () {
        return function (value) {
            if (value === 1) {
                return 10;
            } else if (value === 2) {
                return 15;
            } else if (value === 3) {
                return 20;
            } else if (value === 4) {
                return 25;
            } else {
                return 30;
            }
        }
    })
