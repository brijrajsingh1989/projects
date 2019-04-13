/****
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
        .controller('HomeController1', function ($scope, $location, $http, $loadingOverlay, appStorage, insert_step_movement, $sce, $window, Idle, $rootScope, $cookies, $route) {
            //Clear all local data
            $scope.routetoJournyA = function()
            {
              $window.location.href = '/';
            }

            if (appStorage.get('home3_visited') === 'true') {
                appStorage.set('home3_visited', 'false')
                window.location.reload()
                //$route.reload();
            }
            $scope.lapetus_id_flag = 0;
            for (var prop in $rootScope) {
                if (prop.substring(0, 1) !== '$') {
                    delete $rootScope[prop];
                }

            }
            //console.log("Clear Root Scope");
            //Clear session
            localStorage.clear();
            //clear localstorage
            sessionStorage.clear();

            //----------------------declare page veriable inside this block---------------------
            window.addEventListener('popstate', function () {
                if (document.URL.endsWith('selfie-quote/#!/') || document.URL.indexOf('selfie_max_limit') > -1 || document.URL.endsWith('errorinfo') || document.URL.endsWith('errorage') || document.URL.endsWith('err')) {

                    //console.log("Inside Push State");
                    history.pushState(null, null, document.URL);
                } else {
                    //console.log("Browser default");
                }
            });

            $scope.oriented_image_blob = '';
            $scope.image_blob = '';
            $scope.loading_template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'>\
            <div style='margin-bottom:5%; font-size:20px' ><strong>Loading, please wait...</strong></div>\
               <div><div style='margin-bottom: 2%; font-size: 17px'><img id='b1' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Uploading Selfie</div>\
                    <div style='margin-bottom: 2%; font-size: 17px'><img id='b2' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Processing Selfie</div>\
                    <div style='margin-bottom: 2%; font-size: 17px'><img id='b3' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Calculating Age</div>\
                    <div style='margin-bottom: 2%; font-size: 17px'><img id='b4' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Calculating Gender</div>\
                    <div style='margin-bottom: 2%; font-size: 17px'><img id='b5' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Calculating BMI</div>\
              </div></div>";

            $scope.landingPageCtrl =
                {
                    'lapetusUserId': '',
                    'userGender': false,
                    'userAge': false,
                    'userImageDetails': '',
                    // 'userImageBinary':'',
                    // 'userImageBinaryRotated':'',
                    'termDuration': ''
                }
            //Default Page attributes
            $scope.attributeDefault = function () {
                $scope.ui_attributes =
                    {
                        "selfie_corner1": "Submit a Selfie,",
                        "selfie_corner2": "Get a Quote!",
                        "selfie_header": "Take a <b>selfie</b> and get your life insurance <b>QUOTE</b>.",
                        "selfie_header_m": "Take a <b>selfie</b> and get your <br>life insurance <b>QUOTE</b>.",
                        "selfie_submit_button": "SUBMIT A SELFIE",
                        "selfie_text": "Ensure your face is well lit, remove glasses, and push hair away from face."
                    }
            }
            //
            $scope.attributeDefault();
            //1. Check eligibility first
            let options = {excludeJsFonts: true, excludeFlashFonts: true}
            new Fingerprint2().get(function (result, options) {
                //Set the cookie here
                $cookies.put('session_num', btoa(result), {'path':'/'});
                $http.get("/api/v1/sf_eligible").then(
                    function (data) {
                        $http.get("/api/v1/generate_case_id")
                            .then(function (data) {
                                    //Register with Lapetus
                                    $scope.lapetusUserCreation();
                                    try {
                                        $window.dataLayer.push({
                                            evolve_id: data.data.data,
                                            origin: "selfie"
                                        });
                                    } catch (e) {
                                    }
                                },
                                function (err) {
                                    //console.log(err.statusCode);
                                })
                    }, function (err) {
                        insert_step_movement.insertStepMovement(27)
                        if (err.status === 401) {
                            $location.path("/selfie_max_limit")
                        }
                    }
                )
            });

            $scope.lapetusUserCreation = function () {
                var payload = {"appid": '', "age": 28, "loc": "", "doa": "20170101", "gender": ""};
                $http.post("/api/v1/sf_register", payload)
                    .then(function (data) {
                            $scope.lapetus_id_flag = 1;
                        },
                        function (err) {
                            //console.log(err.statusText);
                        })
            }
            //Convert Binary image to array...
            $scope.convertToArray = function base64ToArrayBuffer(base64) {
                base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
                var binaryString = atob(base64);
                var len = binaryString.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes.buffer;
            }

            //Reset Image orientation..
            function resetOrientation(srcBase64, srcOrientation, callback) {
                var img = new Image();

                img.onload = function () {
                    var width = img.width,
                        height = img.height,
                        canvas = document.createElement('canvas'),
                        ctx = canvas.getContext("2d");
                    // set proper canvas dimensions before transform & export
                    if ([5, 6, 7, 8].indexOf(srcOrientation) > -1) {
                        canvas.width = height;
                        canvas.height = width;
                    } else {
                        canvas.width = width;
                        canvas.height = height;
                    }
                    // transform context before drawing image
                    switch (srcOrientation) {
                        case 2:
                            ctx.transform(-1, 0, 0, 1, width, 0);
                            break;
                        case 3:
                            ctx.transform(-1, 0, 0, -1, width, height);
                            break;
                        case 4:
                            ctx.transform(1, 0, 0, -1, 0, height);
                            break;
                        case 5:
                            ctx.transform(0, 1, 1, 0, 0, 0);
                            break;
                        case 6:
                            ctx.transform(0, 1, -1, 0, height, 0);
                            break;
                        case 7:
                            ctx.transform(0, -1, -1, 0, height, width);
                            break;
                        case 8:
                            ctx.transform(0, -1, 1, 0, 0, width);
                            break;
                        default:
                            ctx.transform(1, 0, 0, 1, 0, 0);
                    }

                    // draw image
                    ctx.drawImage(img, 0, 0);
                    // export base64
                    var content = canvas.toDataURL("image/jpeg", 0.2);
                    delete canvas;
                    callback(content);
                };

                img.src = srcBase64;
            }

            //----------------------------------On Image Upload------------------------------------------------
            $scope.fileNameChanged = function (changeEvent) {
                $scope.fileinput = changeEvent[0];
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    //console.log("Image loaded into the blob");
                    if (loadEvent.target.result) {
                        setTimeout(function () {
                            var ornt = 1;
                            try {
                                ornt = EXIF.readFromBinaryFile($scope.convertToArray(loadEvent.target.result)).Orientation;
                            } catch (e) {
                                //console.log("Inside catch");
                                //console.log(e);
                                ornt = 1;
                            }
                            resetOrientation(loadEvent.target.result, (ornt) ? ornt : 1, function (resetBase64Image) {

                                $rootScope.oriented_image_blob = resetBase64Image;
                                // setTimeout(function(){
                                //try {document.body.addEventListener('touchmove', Defaultevent,false );} catch (e) {}
                                $loadingOverlay.show($scope.loading_template, 'rgba(0, 0, 0, 0.7)', '#fff');
                                $scope.checkForLapetusId();
                                setTimeout(function () {
                                    $scope.updateTransparentMark()
                                    $scope.updateLoadingMark('b1')
                                }, 5)
                                //setTimeout(function(){$scope.updateLoadingMark('b2')},50);
                                // },300)
                            });
                        }, 500)
                    }
                }
                reader.readAsDataURL($scope.fileinput);
            }

            $scope.checkForLapetusId = function () {
                setTimeout(function () {
                    $scope.updateCheckMark('b1')
                    $scope.updateLoadingMark('b2')
                }, 500)
                if ($scope.lapetus_id_flag === 0)
                {
                    $scope.lapetusUserCreation()
                }
                $scope.registerUploadedImage()
            }

            $scope.registerUploadedImage = function () {

                if ($scope.lapetus_id_flag == 0) {
                    alert("Failed to register");
                    return;
                }
                //console.log("Post LapetusImageUpload API now");
                $http.post("/api/v1/sf_image_upload", {
                    'userImageBinary': $rootScope.oriented_image_blob
                })
                    .then(function (data) {
                            let returnData = data.data.data
                            $scope.updateCheckMark('b2')
                            $scope.updateLoadingMark('b3')
                            $scope.updateLoadingMark('b4')
                            $scope.updateLoadingMark('b5')
                            if ("code" in returnData) {
                                if (returnData.code >= 400) {
                                    localStorage.setItem('errorMessage', JSON.stringify(returnData))
                                    $location.path('/error');
                                    try {
                                        document.body.removeEventListener('touchmove', Defaultevent, false);
                                    } catch (e) {
                                    }
                                }
                                try {
                                    $scope.failure_selfie_event(returnData.code);
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            else {
                                $scope.GetUserImageEstimatedResponse();
                            }
                        },
                        function (err) {
                            //console.log(err.statusText);
                            try {
                                document.body.removeEventListener('touchmove', Defaultevent, false);
                                $loadingOverlay.hide();
                            } catch (e) {
                            }
                            if (err.status === 400) {
                                alert("Image error please retry");
                                return;
                            }
                            else if (err.status === 401) {
                                $location.path("/selfie_max_limit")
                            }
                        })
            }

            $scope.LapetusAPICallCounter = 0;
            $scope.GetUserImageEstimatedResponse = function () {
                $scope.LapetusAPICallCounter += 1;
                $scope.IsGenderCalculated = false;
                $scope.IsAgeCalculated = false;
                $scope.IsBMICalculated = false;
                var userInfo = {'userId': ''};
                $http.post("/api/v1/sf_estimate", userInfo)
                    .then(function (data) {
                            let returnData = data.data.data
                            if (returnData.gender.status == 'In Progress') {
                                $scope.IsGenderCalculated = false;
                            }
                            else {
                                $scope.IsGenderCalculated = true;
                                $scope.updateCheckMark('b4')
                                var gender = (returnData == null || returnData == undefined) ? '' : (returnData.gender.details.gender);
                                $scope.userGender = gender;
                            }

                            if (returnData.chronage.status == 'In Progress') {
                                $scope.IsAgeCalculated = false;
                            }
                            else {
                                $scope.IsAgeCalculated = true;
                                $scope.updateCheckMark('b3')
                                var age = (returnData == null || returnData == undefined) ? '' : (returnData.chronage.details.chronage);
                                $scope.userAge = age;
                            }

                            if (returnData.bmi.status == 'In Progress') {
                                $scope.IsBMICalculated = false;
                            }
                            else {
                                $scope.IsBMICalculated = true;
                                var bmi = (returnData == null || returnData == undefined) ? '' : (returnData.bmi.details.bmi);
                                $scope.userBMI = bmi;
                            }

                            if ($scope.IsGenderCalculated * $scope.IsAgeCalculated * $scope.IsBMICalculated) {
                                $scope.calculatePremium();
                                $scope.updateCheckMark('b5')
                                try {
                                    var results = {
                                        'ageInfo': returnData.chronage,
                                        'bmiInfo': returnData.bmi,
                                        'genderInfo': returnData.gender
                                    }
                                    $http.post("/api/v1/sf_save_result", results)
                                        .then(function (data) {
                                                //console.log('data',data);
                                            },
                                            function (err) {
                                                //console.log(err.statusText);
                                            })
                                } catch (e) {
                                }
                            }
                            else {
                                if ($scope.LapetusAPICallCounter > 33) {
                                    $location.path("/err");
                                    try {
                                        document.body.removeEventListener('touchmove', Defaultevent, false);
                                        $loadingOverlay.hide();
                                    } catch (e) {
                                    }
                                }
                                else {
                                    setTimeout(function () {$scope.GetUserImageEstimatedResponse();}, 2000);
                                }
                            }
                        },
                        function (err) {
                            try {
                                document.body.removeEventListener('touchmove', Defaultevent, false);
                                $loadingOverlay.hide();
                            } catch (e) {
                            }
                        })
            }

            $scope.calculatePremium = function () {
                var ip_data =
                    {
                        "id": '',
                        "age": Math.round($scope.userAge),
                        "gender": ($scope.userGender.toUpperCase() == 'FEMALE') ? 1 : 0,
                        "state": "MD",
                        "faceAmount": 100000,
                        "product": "EasyPass",
                        "termDuration": (Math.round($scope.userAge) >= 20 && Math.round($scope.userAge) <= 64) ? 20 : 10,
                        "overallHealth": 1,
                        "underwritingClassId": 1
                    };
                $scope.termDuration = ip_data.termDuration
                $http.post("/api/v1/sf_quote_data", ip_data)
                    .then(function (data) {

                            try {
                                $scope.successful_selfie_event()
                            } catch (e) {
                            }
                            try {
                                try {
                                    document.body.removeEventListener('touchmove', Defaultevent, false);
                                } catch (e) {
                                }
                                var local_data = {
                                    userBMI: $scope.userBMI,
                                    userAge: $scope.userAge,
                                    userGender: $scope.userGender
                                };
                                if ((data.data.data.issueAge > 75 || data.data.data.issueAge < 20) && (data.data.data.modalPremium == null || data.data.data.modalPremium == undefined)) {
                                    appStorage.set('selfieQuoteUploadedImageDetails', JSON.stringify(local_data));
                                    $location.path("/home3");
                                }
                                else if ((data.data.data.issueAge <= 75 || data.data.data.issueAge >= 20) && (data.data.data.modalPremium != null || data.data.data.modalPremium != undefined)) {
                                    local_data.calculatedPremiumDetails = data;
                                    appStorage.set('selfieQuoteUploadedImageDetails', JSON.stringify(local_data));
                                    $location.path("/home3");
                                }
                                else {
                                    $location.path("/errorinfo");
                                    return;
                                }
                            } catch (e) {
                            }
                        },
                        function (err) {
                            try {
                                document.body.removeEventListener('touchmove', Defaultevent, false);
                                $loadingOverlay.hide();
                            } catch (e) {
                            }
                            $location.path("/err");
                        })
            }

            $scope.updateCheckMark = function (id_input) {
                var t = document.getElementById(id_input)
                t.src = '/static/images/done-tick.png'
            }

            $scope.updateLoadingMark = function (id_input) {
                document.getElementById(id_input).src = '/static/images/loading.gif'
            }
            $scope.updateTransparentMark = function () {
                document.getElementById('b1').src = '/static/images/transparent.png'
                document.getElementById('b2').src = '/static/images/transparent.png'
                document.getElementById('b3').src = '/static/images/transparent.png'
                document.getElementById('b4').src = '/static/images/transparent.png'
                document.getElementById('b5').src = '/static/images/transparent.png'
            }
            $scope.detectBrowser = function () {
                var ua = window.navigator.userAgent
                var msie = ua.indexOf("MSIE")
                var edge = ua.indexOf("Edge")
                if (msie > 0 || edge > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                    $scope.IsIE = true
                }
                else {
                    $scope.IsIE = false
                    //console.log("not explorer");
                }
            }

            $scope.failure_selfie_event = function (errorCode) {
                try {
                    $window.dataLayer.push({
                        event: "GAEvent",
                        eventCategory: "selfie",
                        eventAction: "selfie_invalid",
                        eventLabel: errorCode,
                        eventValue: ''
                    });
                } catch (e) {
                }
            }

            $scope.successful_selfie_event = function () {
                try {
                    $window.dataLayer.push({
                        event: "GAEvent",
                        eventCategory: "selfie",
                        eventAction: "selfie_valid",
                        eventLabel: '',
                        eventValue: ''
                    });
                } catch (e) {
                }
            }

            // $scope.$on('IdleTimeout', function() {
            //     alert("Session timed out!!");
            //     $window.location.href = getSnowFlakeURL();
            // });

            //$scope.onLoad();//this method will get called when user will be load this page.
            //$window.scrollTo(0,0);
            // $loadingOverlay.show($scope.landingPageCtrl.template, 'rgba(0, 0, 0, 0.7)', '#fff');
            var Defaultevent = function (e) {
                e.preventDefault();
                document.body.style.overflowY = "none";
            };

            $(document).ready(function () {
                $loadingOverlay.hide()
                $scope.detectBrowser()
            })
        })
        .controller('headerCtrl', function ($rootScope, $scope, $uibModal, appStorage, $location, $sce) {
            var modalInstance = "";
            $scope.loadingPageUrl = $location.$$url;
            $scope.attributeDefault = function () {
                $scope.ui_attributes = {
                    "rightcorner1": "Need help?",
                    "rightcorner2": "Call 1-888-984-3393"
                }
            }
            $scope.attributeDefault();
            $scope.openLegalStuff = function () {
                //console.log("opeing legal stuff");
                $rootScope.modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'views/legalStuffQuote.html',
                    scope: $scope
                });
            }
            $scope.closestuff = function () {
                //console.log("closing")
                $scope.modalInstance.close();
            }

        })
})();
