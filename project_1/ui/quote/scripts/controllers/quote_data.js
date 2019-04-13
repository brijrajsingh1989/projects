'use strict';

/**
 * @ngdoc function
 * @name legalGeneralApp.controller:QuotationCtrl
 * @description
 * # QuotationCtrl
 * Controller of the legalGeneralApp
 */
angular.module('legalGeneralApp')
    .controller('QuoteDataCtrl', function ($rootScope, $loadingOverlay, $filter, $scope, quoteApiReq, $sce, dataCache, $location, $window, setStepMovement, $http, $uibModal, quoteDataInfo, quoteRespList, appStorage) {

        var stage_id = 1;
        var quoteData = JSON.parse((appStorage.get('quoteDataInfo') == 'undefined' || appStorage.get('quoteDataInfo') == null) ? '{}' : appStorage.get('quoteDataInfo'))
        var respData = JSON.parse((appStorage.get('quoteRespList') == 'undefined' || appStorage.get('quoteRespList') == null) ? '{}' : appStorage.get('quoteRespList'))
        var quoteApiReq = JSON.parse((appStorage.get('quoteApiReq') == 'undefined' || appStorage.get('quoteApiReq') == null) ? '{}' : appStorage.get('quoteApiReq'))
        quoteData.health = Number(quoteData.health);
        quoteData.tobacco = (quoteData.tobacco === true || quoteData.tobacco === "true") ? (true) : (false);
        quoteData.quit_tabacco = (quoteData.tobacco === true || quoteData.tobacco === "true") ? Number(quoteData.quit_tabacco) : null;
        quoteData.tenure = Number(quoteData.tenure)
        $scope.personal_info = {}
        $scope.term_lengths = [10, 15, 20, 25, 30]
        if (!quoteData.step0_visited) {
            $location.path("/");
            return;
        }
        $scope.$on('tfn', function(events, toll_free_number){
          console.log("TFN received! ", toll_free_number);
           $scope.toll_free_number = toll_free_number
         })
        setStepMovement.setStepMovement(22);
        /* preparing for slider*/
        var x = quoteData.amount.split('$');
        x = x[1].split(',').join('');
        $scope.coverage_amount = Number(x) / 1000;
        var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
        $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
        var req_data = {
            'stateCode': quoteData.state_name,
            'dateOfBirth': quoteData.dob.replace(/ /g, '').replace(/-/g, '/'),
            'isTobaccoUser': (quoteData.tobacco),
        }
        $http.post('/api/v1/dynamic_term_length', req_data)
            .then(function (data) {
                $loadingOverlay.hide();
                $scope.term_lengths = data.data.data.termLengths
            }, function (err) {
                $loadingOverlay.hide();
                //console.log(err.statusText);
            })
        $scope.point_1 = respData.comparisonPremiumsByFace[0].faceAmount;
        $scope.point_2 = respData.comparisonPremiumsByFace[Math.round(respData.comparisonPremiumsByFace.length * 0.25)].faceAmount;
        $scope.point_3 = respData.comparisonPremiumsByFace[Math.round(respData.comparisonPremiumsByFace.length * 0.75)].faceAmount;
        $scope.point_4 = respData.comparisonPremiumsByFace[respData.comparisonPremiumsByFace.length - 1].faceAmount;

        appStorage.set("quote_data_attributes", JSON.stringify($scope.ui_attributes))
        $scope.amount = quoteData.amount;
        $scope.premium = respData.modalPremium;
        $scope.premium = decimalPlace($scope.premium)
        document.getElementById('premiumLbl').innerHTML = $scope.premium;
        $scope.amountList = respData.comparisonPremiumsByFace
        $scope.dob = quoteData.dob;
        $scope.user_height = quoteData.height;
        $scope.user_weight = quoteData.weight;
        $scope.state_name = quoteData.state_name;
        $scope.tobacco_user = quoteData.tobacco;
        $scope.overall_health = quoteData.health;
        $scope.coverage_through_age = getAge(quoteData.dob) + quoteData.tenure;
        $scope.tenure = quoteData.tenure.toString();
        $scope.coverage_amount = '';
        $scope.monthly_coverage = '';//207.77;
        $scope.term_duration = '';

        $scope.sliderVal = parseInt(quoteData.amount.split("$")[1].replace(/,/g, ""));
        var tmp = document.getElementById('ex1')
        if ($scope.sliderVal <= 1000000) {
            //Case 1
            $scope.sliderMin = 100000;
            $scope.sliderMax = 1000000;
            $scope.sliderRange = 50000;
        }
        else if ($scope.sliderVal > 1000000 && $scope.sliderVal <= 2500000) {
            //Case 2
            $scope.sliderMin = 100000;
            $scope.sliderMax = 2500000;
            $scope.sliderRange = 100000;
        }
        else if ($scope.sliderVal > 2500000 && $scope.sliderVal < 5000000) {
            //Case 3
            $scope.sliderMin = 2500000;
            $scope.sliderMax = 5000000;
            $scope.sliderRange = 250000;
        }
        else {
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

        $scope.tenureModified = function () {
            var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
            $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
            quoteData.tenure = parseInt($scope.tenure);
            quoteData.faceAmount = document.getElementById('hiddenFaceamount').value;
            quoteDataInfo.setQuoteDataInfo(quoteData);
            quoteApiReq.termDuration = $scope.tenure;
            quoteApiReq.faceAmount = document.getElementById('hiddenFaceamount').value;
            $scope.amount = "$" + document.getElementById('hiddenFaceamount').value;
            var url = "/api/v1/quote_data";
            $http.post(url, quoteApiReq)
                .then(function (data) {
                    try {
                        let returnData = data.data.data
                        quoteRespList.setQuoteResp(returnData);
                        $scope.premium = decimalPlace(returnData.modalPremium);
                        document.getElementById('premiumLbl').innerHTML = $scope.premium;
                        $scope.coverage_through_age = getAge(quoteData.dob) + quoteData.tenure;
                        $scope.amountList = returnData.comparisonPremiumsByFace;
                        quoteData.lga_response_code = (returnData.status.statusCode == null || returnData.status.statusCode === "") ? 0 : returnData.status.statusCode;
                        $loadingOverlay.hide();
                        if (returnData.isEligible == false && returnData.status.errors.length > 0) {
                            $loadingOverlay.hide();
                            toastr.error(returnData.status.errors[0], 'Attention!');
                        } else if (returnData.isEligible != true) {
                        }
                    } catch (e) {
                        //console.log(e);
                    }
                }, function (err) {
                })
        }


        $scope.coverage_change = function (cov) {
            var com_amt = cov.split("$");
            var amt = com_amt[1].replace(/,/g, "");
            amt = Number(amt);
            var list = $scope.amountList;
            var found = false;
            angular.forEach(list, function (value, key) {
                if (!found)
                    if (value.faceAmount == amt) {
                        $scope.premium = value.modalPremium;
                        $scope.premium = decimalPlace($scope.premium)
                        document.getElementById('premiumLbl').innerHTML = $scope.premium;
                        found = true;
                    }
            });
        }
        $scope.amount_range = [
            "$100,000", "$150,000", "$200,000", "$250,000", "$300,000", "$350,000", "$400,000",
            "$450,000", "$500,000", "$550,000", "$600,000", "$650,000", "$700,000", "$750,000",
            "$800,000", "$850,000", "$900,000", "$950,000", "$1,000,000", "$2,000,000", "$3,000,000",
            "$4,000,000", "$5,000,000", "$6,000,000", "$7,000,000", "$8,000,000", "$9,000,000",
            "$10,000,000"
        ]

        function numberWithCommas(x) {
            if (x !== null && x !== undefined) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        }

        $scope.bind_slider = function () {
            //set time range slider value
            var coverage_amount = quoteData.amount.split('$');
            coverage_amount = coverage_amount[1].split(',').join('');

            coverage_amount = Number(coverage_amount) / 1000;
            var tooltipElement = $('<div id="monthly_coverage_lbl" class="ui-slider-tooltip" aria-hidden="true" ></div>');
            var tooltip;
            var values = respData.comparisonPremiumsByFace;

            function findNearest(includeLeft, includeRight, value) {
                var nearest = null;
                var diff = null;
                for (var i = 0; i < values.length; i++) {
                    if ((includeLeft && values[i].faceAmount <= value) || (includeRight && values[i].faceAmount >= value)) {
                        var newDiff = Math.abs(value - values[i].faceAmount);
                        if (diff == null || newDiff < diff) {
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
            $rootScope.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/legalStuffQuote.html',
                scope: $scope
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

        $scope.goHome = function () {
            window.location.href = ('endpoint' in $rootScope) ? $rootScope.endpoint : "/";
            return;
        }

        $window.scrollTo(0, 0);


    })
    .filter('health', function () {
        return function (value) {
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
            if (value == false) {
                return "No";
            } else {
                return "Yes";
            }
        }
    })
    .directive('convertToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
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
                value = value.toString().split(/(?=(?:\d{3})+$)/).join(",");
                var new_value = '$' + value;
                return new_value
            }
        }
    })
    .filter('tenure', function () {
        return function (value) {
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
