/****
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 *
 */
;


(function () {
    angular.module('selfieapp').controller('HomeController4', function ($scope, $http, $location, appStorage, $sce, $rootScope, $uibModal, $loadingOverlay,
                                                                          $window, Idle) {
        //console.log("Inside HomeController4");
        //-----------page variables----------------------
        $scope.quotePageInputDetails = {};
        $scope.selectedFaceAmount = '100000';
        $scope.termLength = [];
        $scope.uploadedUserImage = '';
        $scope.modifiedQuoteInput =
            {
                'calculatePremium': '',
                'userAge': '',
                'userGender': '',
                'userHeight': '',
                'userWeight': '',
                'policyTenure': '',
                //'imagepreview':'',
                'imageUpload': '',
                'quotePageInputDetails': '',
                'userDateOfBirth': '',
                'userIsSmoker': 'No',
                'faceAmount': '',
                'template': "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
            }
        var quote_data_response = JSON.parse(appStorage.get('quote_data_response'))
        if (quote_data_response !== undefined && quote_data_response !== null && quote_data_response.data.modalPremium !== '0.00') {
            var t = document.getElementById('calculated_premium')
            t.innerHTML = quote_data_response.data.modalPremium
        }
        var Defaultevent = function (e) {
            e.preventDefault()
        };

        if (typeof $scope.imagepreview === 'object') {
            $scope.imagepreview = '/static/images/profile_pick_uplod.png';
        }

        $scope.attributeDefault = function () {
            $scope.ui_attributes =
                {
                    "selfie_refined_age": "Age",
                    "selfie_refined_button": "SOUNDS GOOD!",
                    "selfie_refined_coverage": "Modify your coverage amount:",
                    "selfie_refined_gender": "Gender",
                    "selfie_refined_header": "Thanks! Now personalize your life insurance quote even more:",
                    "selfie_refined_height": "Height",
                    "selfie_refined_smoker": "Do you currently smoke?&nbsp;",
                    "selfie_refined_term": "Or modify your years of coverage!",
                    "selfie_refined_weight": "Weight"
                }
        }

        function parseDate(dateStr) {
            var dateParts = dateStr.split("-");
            //return new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
            return new Date(dateParts[2], (dateParts[0] - 1), dateParts[1]);
        }

        function calcAge(dateString) {
            var today = new Date();
            var birthDate = parseDate(String(dateString));//new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }

        $scope.detectBrowser = function () {
            var ua = window.navigator.userAgent
            var msie = ua.indexOf("MSIE")
            var edge = ua.indexOf("Edge")
            if (msie > 0 || edge > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                //console.log("explorer or edge");
                $scope.IsIE = true
            }
            else {
                $scope.IsIE = false
                //console.log("not explorer");
            }
        }

        $scope.onPageLoad = function () {

            if ($rootScope.oriented_image_blob == null || $rootScope.oriented_image_blob == undefined) {
                $http.get("/api/v1/sf_get_image")
                    .then(function (data) {
                            try {
                                $scope.imagepreview = data.data.image;
                                $scope.detectBrowser();
                                var t = document.getElementById('imagepreview1');
                                var img = $scope.imagepreview;
                                t.style.backgroundImage = 'url(' + img + ')';
                                $("html, body").animate({scrollTop: 108}, 1);
                            } catch (e) {
                            }
                        },
                        function (err) {
                            //console.log('err',err);
                            $loadingOverlay.hide();
                        })
            }
            else {
                try {
                    $scope.detectBrowser();
                    $scope.imagepreview = $rootScope.oriented_image_blob;
                    var t = document.getElementById('imagepreview1');
                    //var img = $rootScope.oriented_image_blob;
                    t.style.backgroundImage = 'url(' + $rootScope.oriented_image_blob + ')';
                    $("html, body").animate({scrollTop: 108}, 1);
                } catch (e) {
                }
            }

            //check for data in previous page.
            if (appStorage.get('quotePageInput') == null || appStorage.get('quotePageInput') == undefined) {
                $location.path('/home3');
            }
            else {
                $scope.quotePageInputDetails = JSON.parse(appStorage.get('quotePageInput'));
                //console.log('$scope.quotePageInputDetails',$scope.quotePageInputDetails);
                var tmp = document.getElementById('ex1')
                tmp.setAttribute('data-slider-value', $scope.quotePageInputDetails.faceAmount.replace(/,/g, ""));
                //console.log('$scope.quotePageInputDetails',$scope.quotePageInputDetails);
                var age = calcAge($scope.quotePageInputDetails.userDob);

                if (age < 20 || age > 75) {
                    $location.path('/errorage');
                    return;
                }

                //console.log('$scope.quotePageInputDetails',$scope.quotePageInputDetails);
                //$scope.modifiedQuoteInput.imagepreview = $scope.uploadedUserImage;//$scope.quotePageInputDetails.imagepreview;
                $scope.modifiedQuoteInput.calculatePremium = $scope.quotePageInputDetails.calculatedPremium;
                $scope.setCalculatedPremium($scope.modifiedQuoteInput.calculatePremium)
                $scope.modifiedQuoteInput.imageUpload = $scope.quotePageInputDetails.imageUpload;

                $scope.modifiedQuoteInput.policyTenure = (calcAge($scope.quotePageInputDetails.userDob) >= 20 && calcAge($scope.quotePageInputDetails.userDob) <= 64) ? 20 : 10
                $scope.modifiedQuoteInput.userWeight = $scope.quotePageInputDetails.userWeight;
                $scope.modifiedQuoteInput.userHeight = $scope.quotePageInputDetails.selectedUserHeight;
                $scope.modifiedQuoteInput.userGender = $scope.quotePageInputDetails.userGender;
                $scope.modifiedQuoteInput.userAge = calcAge($scope.quotePageInputDetails.userDob);
                $scope.modifiedQuoteInput.quotePageInput = $scope.quotePageInputDetails;
                $scope.modifiedQuoteInput.userDateOfBirth = $scope.quotePageInputDetails.userDob;
                $scope.modifiedQuoteInput.faceAmount = $scope.quotePageInputDetails.faceAmount;
            }

            /*if(appStorage.get('sf_modifiedQuoteInput') == null || appStorage.get('sf_modifiedQuoteInput') == undefined)
            {
              //loading first time
            }
            else
            {
              $scope.modifiedQuoteInput = JSON.parse(appStorage.get('sf_modifiedQuoteInput'));
              //console.log('$scope.modifiedQuoteInput',$scope.modifiedQuoteInput);
            }*/
            $scope.getQuotePriceList();


            $scope.attributeDefault();
        }
        $scope.setCalculatedPremium = function (data) {
            if (data !== null && data !== undefined && data !== '0.00') {
                var t = document.getElementById('calculated_premium')
                t.innerHTML = '$' + (numberWithCommas(data)) + '*'
            }
        }
        $scope.getQuotePriceList = function () {
            try {
                document.body.addEventListener('touchmove', Defaultevent, false);
            } catch (e) {
            }
            $loadingOverlay.show($scope.modifiedQuoteInput.template, 'rgba(0, 0, 0, 0.7)', '#fff');
            var url = "/api/v1/quote_data";
            var reqData =
                {
                    "id": '',// case id
                    "dateOfBirth": $scope.modifiedQuoteInput.userDateOfBirth,
                    "gender": ($scope.modifiedQuoteInput.userGender.toUpperCase() == 'FEMALE') ? 1 : 0,
                    "height": Number($scope.modifiedQuoteInput.userHeight.split("'")[0] * 12) + Number($scope.modifiedQuoteInput.userHeight.split("'")[1]),
                    "weight": $scope.modifiedQuoteInput.userWeight,
                    "state": 'AL',
                    "state_fullname": "Alabama",
                    "city_fullname": "Huntsville",
                    "isTobaccoUser": ($scope.modifiedQuoteInput.userIsSmoker == 'No') ? false : true,
                    "faceAmount": String($scope.modifiedQuoteInput.faceAmount).replace(/\D/g, ''),
                    "product": "EasyPass",
                    "termDuration": $scope.modifiedQuoteInput.policyTenure,
                    "overallHealth": 1,
                    "whenQuitTobacco": ($scope.modifiedQuoteInput.userIsSmoker == 'No') ? null : 1,
                    "generatePremiumComparisonsByFace": true,
                    "zip_code": 35807
                }

            //console.log('reqData',reqData);
            $http.post(url, reqData)
                .then(function (data) {
                    try {
                        try {
                            let returnData = data.data.data
                            if (returnData.modalPremium == null || returnData.modalPremium == undefined) {
                                $location.path("/errorinfo");
                                document.body.removeEventListener('touchmove', Defaultevent, false);
                                $loadingOverlay.hide();
                                return;
                            }
                            else {
                                $scope.quotePriceList = returnData.comparisonPremiumsByFace;
                                $scope.changePricingQuote();
                            }
                        } catch (e) {
                        }
                        try {
                            document.body.removeEventListener('touchmove', Defaultevent, false);
                            $loadingOverlay.hide();
                        } catch (e) {
                        }

                        var finalQuoteData =
                            {
                                'tenure': $scope.modifiedQuoteInput.policyTenure,
                                'amount': String($scope.modifiedQuoteInput.faceAmount).replace(/\D/g, ''),
                                'lga_response_code': 0,
                                'premium': returnData.modalPremium,
                                'state_name': 'AL',
                                'quit_tabacco': 4,
                                'dob': $scope.modifiedQuoteInput.userDateOfBirth
                            };

                        $http.post('/api/v1/quote_data_info', finalQuoteData)
                            .then(function (data) {
                                //console.log('data',data);
                            }, function (err) {
                                //console.log('Unable to get master records');
                            })
                    }
                    catch (e) {
                        //console.log(e);
                    }
                }, function (error) {
                    try {
                        document.body.removeEventListener('touchmove', Defaultevent, false);
                        $loadingOverlay.hide();
                    } catch (e) {
                    }
                    $location.path('call_to_apply');
                })


            var reqTermLengthData = {
                'dateOfBirth': $scope.modifiedQuoteInput.userDateOfBirth,
                'isTobaccoUser': ($scope.modifiedQuoteInput.userIsSmoker == 'No') ? false : true,
                'stateCode': 'AL'
            };

            $http.post("/api/v1/dynamic_term_length", reqTermLengthData)
                .then(function (data) {
                        $scope.termLength = data.data.data.termLengths;
                    },
                    function (err) {
                        $scope.termLength = [10, 15, 20, 25, 30];
                    })
        }

        $scope.onPageLoad();
        // $loadingOverlay.hide()
        $scope.changeIsSmoker = function () {
            $scope.getQuotePriceList();
        }

        $scope.changeTenure = function () {
            $scope.getQuotePriceList();
        }

        $scope.moveToPersonalInfo = function () {
            $loadingOverlay.show($scope.modifiedQuoteInput.template, 'rgba(0, 0, 0, 0.7)', '#fff');
            appStorage.set('sf_modifiedQuoteInput', JSON.stringify($scope.modifiedQuoteInput));
            //console.log('modifiedQuoteInput',JSON.parse(appStorage.get('sf_modifiedQuoteInput')));

            var modifiedQuoteInput = JSON.parse(appStorage.get('sf_modifiedQuoteInput'));
            //console.log('modifiedQuoteInput',modifiedQuoteInput);
            appStorage.set('statefromzip', 'ALABAMA');
            var quoteData =
                {
                    'height': modifiedQuoteInput.userHeight,
                    'weight': modifiedQuoteInput.userWeight,
                    'dob': modifiedQuoteInput.userDateOfBirth,
                    'gender': (modifiedQuoteInput.userGender == 'Male' ? 0 : 1),
                    'state_name': 'AL',
                    'state_name_long': 'ALABAMA',
                    'city_name': 'Huntsville',
                    'zip_code': '',
                    'isSnowFlake': true,
                    'amount': '$' + numberWithCommas(modifiedQuoteInput.faceAmount),
                    'quit_tabacco': (modifiedQuoteInput.userIsSmoker == 'No') ? null : 1,
                    'tenure': modifiedQuoteInput.policyTenure,
                    'health': 1,
                    'tobacco': (modifiedQuoteInput.userIsSmoker == 'No') ? false : true

                };
            $scope.quotePageInputDetails.faceAmount = $scope.modifiedQuoteInput.faceAmount.toString();
            $scope.quotePageInputDetails.policyTenure = $scope.modifiedQuoteInput.policyTenure
            appStorage.set('quoteDataInfo', JSON.stringify(quoteData));
            appStorage.set('quotePageInput', JSON.stringify($scope.quotePageInputDetails))
            // $loadingOverlay.hide()
            $window.location.href = getLGAUrl();
            try {
                $scope.refnedQuoteEvent();
            } catch (e) {
            }
        }

        function numberWithCommas(x) {
            if (x !== null && x !== undefined) {
                var t = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                if (t.split('.')[1] !== undefined && t.split('.')[1] !== null && t.split('.')[1].length == 1) {
                    t = t + '0'
                }
                return t
            }
        }

        $scope.amount_range = [
            "$100,000", "$150,000", "$200,000", "$250,000", "$300,000", "$350,000", "$400,000",
            "$450,000", "$500,000", "$550,000", "$600,000", "$650,000", "$700,000", "$750,000",
            "$800,000", "$850,000", "$900,000", "$950,000", "$1,000,000", "$2,000,000", "$3,000,000",
            "$4,000,000", "$5,000,000", "$6,000,000", "$7,000,000", "$8,000,000", "$9,000,000",
            "$10,000,000"
        ]


        $(document).ready(function () {
            //$scope.detectBrowser()
            // $loadingOverlay.hide()
            // var t = document.getElementById('imagepreview1')
            // var img = $scope.modifiedQuoteInput.imagepreview
            // t.style.backgroundImage = 'url(' + img + ')';
            // $('html, body').animate({
            //   scrollTop: $('#gradientLine').offset().top
            // }, 108);
            var slider = new Slider('#ex1', {
                formatter: function (value) {
                    document.getElementById('faceAmountLbl').innerHTML = "$" + numberWithCommas(value)
                    $scope.modifiedQuoteInput.faceAmount = $scope.selectedFaceAmount = value
                    $scope.modifiedQuoteInput.calculatePremium = calcPremium(value)
                    $scope.setCalculatedPremium($scope.modifiedQuoteInput.calculatePremium)
                    return '$' + numberWithCommas(value);
                }

            });

            function calcPremium(data) {
                if ($scope.quotePriceList !== null && $scope.quotePriceList !== undefined) {
                    for (var i = 0; i < $scope.quotePriceList.length; i++) {
                        if (data === $scope.quotePriceList[i].faceAmount) {
                            return ($scope.quotePriceList[i].modalPremium)
                        }
                    }
                }
            }

            $(".range-example-5").asRange({
                step: 50000,
                range: false,
                scale: true,
                min: 100000,
                max: 500000,
                value: [100000, 150000, 200000, 250000, 300000, 350000, 400000,
                    450000, 500000],
                limit: true,
                tip:
                    {
                        active: 'onMove'
                    },
                format: function format(value) {
                    document.getElementById('faceAmountLbl').innerHTML = "$" + numberWithCommas(value)
                    return "$" + numberWithCommas(value);
                },
                onClick: function (instance) {
                    $scope.modifiedQuoteInput.faceAmount = $scope.selectedFaceAmount = instance;
                    for (var i = 0; i < $scope.quotePriceList.length; i++) {
                        if (instance == $scope.quotePriceList[i].faceAmount) {
                            $scope.modifiedQuoteInput.calculatePremium = $scope.quotePriceList[i].modalPremium;
                            $scope.setCalculatedPremium($scope.modifiedQuoteInput.calculatePremium)
                            $scope.$apply();
                        }
                    }
                },
                onChange: function (instance) {
                    $scope.modifiedQuoteInput.faceAmount = $scope.selectedFaceAmount = instance;
                    for (var i = 0; i < $scope.quotePriceList.length; i++) {
                        if (instance == $scope.quotePriceList[i].faceAmount) {
                            $scope.modifiedQuoteInput.calculatePremium = $scope.quotePriceList[i].modalPremium;
                            $scope.setCalculatedPremium($scope.modifiedQuoteInput.calculatePremium)
                            $scope.$apply();
                        }
                    }
                }
            });
        });

        $scope.changePricingQuote = function () {
            //console.log('selected face amount',$scope.selectedFaceAmount);
            for (var i = 0; i < $scope.quotePriceList.length; i++) {
                if ($scope.selectedFaceAmount == $scope.quotePriceList[i].faceAmount) {
                    $scope.modifiedQuoteInput.calculatePremium = $scope.quotePriceList[i].modalPremium;
                    $scope.setCalculatedPremium($scope.modifiedQuoteInput.calculatePremium)
                }
            }
            $loadingOverlay.hide()
        }

        $scope.openProductInfo = function () {
            // console.log("opeing legal stuff");
            $rootScope.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/sf_productinfo.html',
                scope: $scope
            });
        }
        $scope.closestuff = function () {
            // console.log("closing")
            $scope.modalInstance.close();
        }

        $scope.refnedQuoteEvent = function () {
            $window.dataLayer.push({
                event: "GAEvent",
                eventCategory: "selfie",
                eventAction: "personalize_quote",
                eventLabel: '',
                eventValue: ''
            });
        }

        $scope.$on('IdleTimeout', function () {
            alert("Session timed out!!");
            $window.location.href = getSnowFlakeURL();
        });

        $window.scrollTo(0, 0);
    })

        .filter('incomeSplitter', function () {
            return function (value) {
                //console.log("income received",value);
                if (value !== null && value !== undefined) {
                    value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    //var new_value = '$'+value;
                    //console.log(new_value);
                    return value
                }
            }
        })
})();
