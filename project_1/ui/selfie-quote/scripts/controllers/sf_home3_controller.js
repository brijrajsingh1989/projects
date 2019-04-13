/**
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 *
 */
;


(function () {
    angular
        .module('selfieapp')
        .controller('HomeController3', function ($scope, $http, $location, appStorage, insert_step_movement, $loadingOverlay, $sce, $filter, $rootScope, $uibModal,
                                                 $window, Idle) {
            appStorage.set('home3_visited', 'true')
            $window.scrollTo(0, 0);
            $scope.uploadedUserImage = '';
            //$loadingOverlay.hide();
            //-------page variables--------------
            // function gcd (a, b) {
            //         return (b == 0) ? a : gcd (b, a%b);
            //     }
            //   var w = screen.width;
            //   var h = screen.height;
            //   var r = gcd (w, h);
            // $scope.width_image = String(130*((w/h)))+'px';
            //document.getElementById('imagepreview1').style.backgroundImage = "url('https://www.redbulletin.com/sites/default/files/styles/cropped-landscape-website-web_ls_min_scale_960/public/images/joker_1_0.jpg?itok=gqNPfxF9')";
            $scope.selfieQuoteUploadedImageDetails = {};
            $scope.quotePageInput =
                {
                    'calculatedPremium': '0.00',
                    'faceAmount': '0.00',
                    'policyTenure': 0,
                    'userAge': 0,
                    'userBMI': 0,
                    'userGender': '',
                    'userDob': '',
                    'selectedUserHeight': 'Select',
                    'userWeight': '',
                    //'imagepreview':'',
                    'imageUpload': '',
                    'selfieQuoteUploadedImageDetails': ''
                };
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
                };
            $scope.valid_params =
                {
                    dob: {status: false, message: 'Please enter proper date of birth'},
                    height: {status: false, message: 'Please select your height'},
                    weight: {status: false, message: 'Please enter your weight'}
                };
            $scope.ageLowerLimit = 20;
            $scope.ageUpperLimit = 75;
            //-------------------------------------

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

            $scope.page4 = function () {
                var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"

                if ($scope.quotePageInput.userDob == '') {
                    $scope.valid_params.dob.status = false;
                }
                else {
                    $scope.valid_params.dob.status = true;
                }
                if ($scope.quotePageInput.selectedUserHeight == 'Select') {
                    $scope.valid_params.height.status = false;
                }
                else {
                    $scope.valid_params.height.status = true;
                }

                if ($scope.quotePageInput.userWeight == '' || $scope.quotePageInput.userWeight == null) {
                    $scope.valid_params.weight.status = false;
                }
                else {
                    $scope.valid_params.weight.status = true;
                }

                if ($scope.check_dob($scope.quotePageInput.userDob, 1) == -1) {
                    toastr.error($scope.valid_params.dob.message, 'Attention!');
                    return;
                }

                if ($scope.valid_params.height.status == false) {
                    toastr.error($scope.valid_params.height.message, 'Attention!');
                    return;
                }

                if ($scope.valid_params.weight.status == false) {
                    toastr.error($scope.valid_params.weight.message, 'Attention!');
                    return;
                }
                $scope.quotePageInput.userDob = $scope.quotePageInput.userDob.replace(/ /g, '');
                $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
                if ("imagepreview" in $scope.quotePageInput) {
                    $scope.quotePageInput.imagepreview = '';
                }

                appStorage.set('quotePageInput', JSON.stringify($scope.quotePageInput));
                $scope.quotePageInputDetails = $scope.quotePageInput
                var age = calcAge($scope.quotePageInputDetails.userDob);
                if (age < 20 || age > 75) {
                    $location.path('/errorage');
                    return;
                }
                //$scope.modifiedQuoteInput.imagepreview = $scope.quotePageInputDetails.imagepreview;
                $scope.modifiedQuoteInput.calculatePremium = $scope.quotePageInputDetails.calculatedPremium;
                $scope.modifiedQuoteInput.imageUpload = $scope.quotePageInputDetails.imageUpload;
                $scope.modifiedQuoteInput.policyTenure = $scope.quotePageInputDetails.policyTenure;
                $scope.modifiedQuoteInput.userWeight = $scope.quotePageInputDetails.userWeight;
                $scope.modifiedQuoteInput.userHeight = $scope.quotePageInputDetails.selectedUserHeight;
                $scope.modifiedQuoteInput.userGender = $scope.quotePageInputDetails.userGender;
                $scope.modifiedQuoteInput.userAge = calcAge($scope.quotePageInputDetails.userDob);
                $scope.modifiedQuoteInput.quotePageInput = $scope.quotePageInputDetails;
                $scope.modifiedQuoteInput.userDateOfBirth = $scope.quotePageInputDetails.userDob;
                $scope.modifiedQuoteInput.faceAmount = $scope.quotePageInputDetails.faceAmount;
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
                        "termDuration": (calcAge($scope.quotePageInputDetails.userDob) >= 20 && calcAge($scope.quotePageInputDetails.userDob) <= 64) ? 20 : 10,
                        "overallHealth": 1,
                        "whenQuitTobacco": ($scope.modifiedQuoteInput.userIsSmoker == 'No') ? null : 1,
                        "generatePremiumComparisonsByFace": true,
                        "zip_code": 35807
                    }
                $scope.quotePageInput.policyTenure = reqData.termDuration;
                //console.log(calcAge($scope.quotePageInputDetails.userDob));
                //console.log('reqData', reqData);
                $http.post(url, reqData)
                    .then(function (data) {
                        try {
                            let returnData = data.data.data
                            appStorage.set('quote_data_response', JSON.stringify(data))
                            if (returnData.modalPremium == null || returnData.modalPremium == undefined) {
                                $location.path("/errorinfo");
                            }
                            else {
                                $location.path('/home4');
                                try {
                                    $scope.CountinueSelfieQuoteEvent();
                                } catch (e) {
                                }
                            }
                        } catch (e) {
                        }
                    }, function (error) {
                        $location.path('call_to_apply');
                    })
            }

            $scope.check_dob = function (data, ignore) {
                if (data == "" || data == null || data == undefined) {
                    //console.log("dob is not present")
                    $scope.valid_params.dob.status = false;
                    return -1;
                }
                if (check_date(data, ignore) == -1) {
                    $scope.valid_params.dob.status = false;
                    return -1;
                }
                $scope.valid_params.dob.status = true;
                return 1;
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

            function parseDate(dateStr) {
                var dateParts = dateStr.split("-");
                //return new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
                return new Date(dateParts[2], (dateParts[0] - 1), dateParts[1]);
            }

            $scope.attributeDefault = function () {
                $scope.ui_attributes =
                    {
                        "selfie_estimate_age": "Age",
                        "selfie_estimate_bmi": "BMI",
                        "selfie_estimate_dob_confirm": "Enter your birth date:",
                        "selfie_estimate_gender": "Gender",
                        "selfie_estimate_gender_confirm": "Confirm your gender:",
                        "selfie_estimate_header": "Based on your selfie, term life insurance may only cost you:",
                        "selfie_estimate_hw_confirm": "And tell us about your height and weight:",
                        "selfie_estimate_next_button": "NEXT",
                        "selfie_estimate_question": "How did we do?"//"How was this done?"
                    }
            }

            $scope.date_format = function (event) {
                // console.log("Keycode is " + event.charCode);
                // console.log("Data of Dob is "+ $scope.quoteData.dob);
                if ($scope.quotePageInput.userDob !== undefined && $scope.quotePageInput.userDob !== null
                    && $scope.quotePageInput.userDob !== ""
                    && ($scope.quotePageInput.userDob.charAt($scope.quotePageInput.userDob.length - 1) !== '-')
                    && ($scope.quotePageInput.userDob.charAt($scope.quotePageInput.userDob.length - 1) !== '/')
                    && ($scope.quotePageInput.userDob.split('/').length <= 2)
                    && ($scope.quotePageInput.userDob.split('-').length <= 2)) {
                    if (event.keyCode != 8 && event.keyCode != 191 && event.keyCode != 111
                        && event.keyCode != 189 && event.keyCode != 229 && event.keyCode != 46) {
                        if (($scope.quotePageInput.userDob.length == 2 || $scope.quotePageInput.userDob.length == 5))
                            $scope.quotePageInput.userDob += '-';
                    }
                }
            }

            $scope.onPageLoad = function () {
                if ($rootScope.oriented_image_blob == null || $rootScope.oriented_image_blob == undefined) {
                    $http.get("/api/v1/sf_get_image")
                        .then(function (data) {
                                try {
                                    $rootScope.oriented_image_blob = data.data.image;
                                    $scope.detectBrowser();
                                    var t = document.getElementById('imagepreview1');
                                    var img = $rootScope.oriented_image_blob
                                    var t2 = document.getElementById('imagepreview2');
                                    t2.style.backgroundImage = 'url(' + img + ')';
                                    t.style.backgroundImage = 'url(' + img + ')';
                                    $("html, body").animate({scrollTop: 108}, 1);
                                    $loadingOverlay.hide();
                                } catch (e) {
                                }
                            },
                            function (err) {
                                // console.log('err', err);
                                $loadingOverlay.hide();
                            })
                }
                else {
                    $scope.detectBrowser();
                    var t = document.getElementById('imagepreview1');
                    var img = $rootScope.oriented_image_blob;
                    var t2 = document.getElementById('imagepreview2');
                    t2.style.backgroundImage = 'url(' + img + ')';
                    t.style.backgroundImage = 'url(' + img + ')';
                    $("html, body").animate({scrollTop: 108}, 1);
                    $loadingOverlay.hide();
                }


                if (appStorage.get('selfieQuoteUploadedImageDetails') == null || appStorage.get('selfieQuoteUploadedImageDetails') == undefined) {
                    window.location.href = (getSnowFlakeURL())
                }
                else {
                    //$scope.quotePageInput.selfieQuoteUploadedImageDetails = JSON.parse(appStorage.get('selfieQuoteUploadedImageDetails'));
                    $scope.selfieQuoteUploadedImageDetails = JSON.parse(appStorage.get('selfieQuoteUploadedImageDetails'));
                    $scope.imageUpload = $scope.selfieQuoteUploadedImageDetails.userImageDetails;
                    $scope.termDuration = (Math.round($scope.selfieQuoteUploadedImageDetails.userAge) >= 20 && Math.round($scope.selfieQuoteUploadedImageDetails.userAge) <= 64) ? 20 : 10,

                    //--------------------------------------------------------------
                    // var im = new Image();
                    // im.src = $scope.selfieQuoteUploadedImageDetails.userImageBinary;
                    // im.onload = function() {
                    //     var width  = this.width;
                    //     var height = this.height;
                    //     console.log('height',height);
                    //     console.log('width',width);
                    //     // if(height > width)
                    //     // {
                    //     //   if(document.getElementById('imagepreview1').classList.contains("rot"))
                    //     //   {
                    //     //     $("#imagepreview1").removeClass("rot");
                    //     //   }
                    //     // }
                    //     // else if(width > height)
                    //     // {
                    //     //   if(!document.getElementById('imagepreview1').classList.contains("rot"))
                    //     //   {
                    //     //     $("#imagepreview1").addClass("rot");
                    //     //   }
                    //     // }
                    //     // else
                    //     // {
                    //     //   if(document.getElementById('imagepreview1').classList.contains("rot"))
                    //     //   {
                    //     //     $("#imagepreview1").removeClass("rot");
                    //     //   }
                    //     // }
                    //     //document.getElementById('imagepreview1').style.backgroundImage = "url('" + $scope.selfieQuoteUploadedImageDetails.userImageBinary + "')";//url($scope.selfieQuoteUploadedImageDetails.userImageBinary);
                    //}
                    //--------------------------------------------------------------
                    $scope.showQuoteFlag = false;
                    if (Math.round($scope.selfieQuoteUploadedImageDetails.userAge) >= 20 && Math.round($scope.selfieQuoteUploadedImageDetails.userAge) <= 75) {
                        $scope.quotePageInput.calculatedPremium = $scope.selfieQuoteUploadedImageDetails.calculatedPremiumDetails.data.data.modalPremium.toFixed(2);
                        $scope.showQuoteFlag = true;
                    }
                    $scope.quotePageInput.faceAmount = '100,000';
                    $scope.quotePageInput.policyTenure = $scope.termDuration;
                    $scope.quotePageInput.userAge = Math.round($scope.selfieQuoteUploadedImageDetails.userAge);
                    $scope.quotePageInput.userBMI = $scope.selfieQuoteUploadedImageDetails.userBMI.toFixed(1);
                    $scope.quotePageInput.userGender = ($scope.selfieQuoteUploadedImageDetails.userGender.toUpperCase() == 'FEMALE') ? 'Female' : 'Male';
                    $scope.quotePageInput.userDob = '';
                    $scope.quotePageInput.userWeight = '';
                    //$scope.quotePageInput.imagepreview = $scope.uploadedUserImage;
                    $scope.quotePageInput.imageUpload = $scope.selfieQuoteUploadedImageDetails.userImageDetails;
                    $scope.quotePageInput.selfieQuoteUploadedImageDetails = $scope.selfieQuoteUploadedImageDetails;
                    // console.log($scope.showQuoteFlag);
                }

                if (appStorage.get('quotePageInput') == null || appStorage.get('quotePageInput') == undefined) {
                    //page is loading very first time.
                }
                else {
                    $scope.quotePageInput = JSON.parse(appStorage.get('quotePageInput'));
                }

                $scope.attributeDefault();
            }
            if (performance.navigation.type == 1) {
                var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
                //$loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
            }
            $scope.onPageLoad();
            $(document).ready(function () {
                insert_step_movement.insertStepMovement(22)
                /*$('html, body').animate({
                  scrollTop: $('#gradientLine').offset().top
                }, 500);*/

                $(".martial-select a").click(function () {
                    $(this).parent(".martial-select").children("a").removeClass("gender-male").addClass("gender-female");
                    $(this).removeClass("gender-female").addClass("gender-male");
                });

                // $('.form_date').datetimepicker({
                //     language: 'fr',
                //     weekStart: 1,
                //     todayBtn: 1,
                //     autoclose: 1,
                //     todayHighlight: 1,
                //     startView: 2,
                //     minView: 2,
                //     forceParse: 0
                // });
            });

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

            $scope.CountinueSelfieQuoteEvent = function () {
                $window.dataLayer.push({
                    event: "GAEvent",
                    eventCategory: "selfie",
                    eventAction: "continue_quote",
                    eventLabel: '',
                    eventValue: ''
                });
            }

            $scope.$on('IdleTimeout', function () {
                alert("Session timed out!!");
                $window.location.href = getSnowFlakeURL();
            });
        });
})();
