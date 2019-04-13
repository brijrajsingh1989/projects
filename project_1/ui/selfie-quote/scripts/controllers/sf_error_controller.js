/**
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 *
 */
;


(function () {
    angular.module('selfieapp').controller('errorController', function ($scope, $location, $rootScope, insert_step_movement, $http, $loadingOverlay, appStorage, $sce,  $window, Idle) {
        $scope.attributeDefault = function () {
            $scope.ui_attributes =
                {
                    "selfie_error_try_another_photo_button": $sce.trustAsHtml("TRY ANOTHER PHOTO"),
                    "selfie_error_title": $sce.trustAsHtml("Thanks! Now personalize your life insurance quote even more:"),
                    "selfie_error_paragraph_title": $sce.trustAsHtml("Uh oh. Looks like your photo didn’t work."),
                    "selfie_error_instruction_1": $sce.trustAsHtml("Ensure your face is well-lit"),
                    "selfie_error_instruction_2": $sce.trustAsHtml("Remove glasses"),
                    "selfie_error_instruction_3": $sce.trustAsHtml("Push hair away from your face"),
                    "selfie_error_instruction_4": $sce.trustAsHtml("Look straight at the camera"),
                    "selfie_error_instruction_5": $sce.trustAsHtml("Keep camera/phone at least at arm’s length"),
                }
        }
        $scope.attributeDefault();
        /*window.addEventListener('popstate', function () {
            history.pushState(null, null, document.URL);
        });*/
        $scope.oriented_image_blob = '';
        $scope.image_blob = '';

        $scope.errorMessages = {};
        $scope.headerText = true;
        $scope.selfieQuoteUploadedImageDetails = {};
        $scope.errorMessages.closedeyes = "One or both of your eyes may be closed, For best results:";
        $scope.errorMessages.focus = "The image may be too blurry to process. Please try the auto focus feature of your camera.";
        $scope.errorMessages.mouteOpen_Smiling = "You might be smiling or your mouth may be open. Please try again with a neutral expression.";
        $scope.errorMessages.lowImageResolution = "The image may be too small to process. Please try again.";
        $scope.errorMessages.noFace = "We were unable to find your face in the image. Please try again.";
        $scope.errorMessages.multipleFace = "More than one face was found in the image. Please take a picture where you are the only subject!";
        $scope.errorMessages.notLookinIntoCamera = "You may not be looking directly at the camera. Please try again facing directly into the camera.";
        $scope.errorMessages.subjectNotFacingCamera = "The image may be too dark or too bright to process. Please try again in an area with better lighting.";
        $scope.loading_template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'>\
  <div style='margin-bottom:5%; font-size:20px' ><strong>Loading, please wait...</strong></div>\
     <div><div style='margin-bottom: 2%; font-size: 17px'><img id='b1' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Uploading Selfie</div>\
          <div style='margin-bottom: 2%; font-size: 17px'><img id='b2' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Processing Selfie</div>\
          <div style='margin-bottom: 2%; font-size: 17px'><img id='b3' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Calculating Age</div>\
          <div style='margin-bottom: 2%; font-size: 17px'><img id='b4' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Calculating Gender</div>\
          <div style='margin-bottom: 2%; font-size: 17px'><img id='b5' width='24px' src='/static/images/transparent.png' style='margin-right: 12px'/>Calculating BMI</div>\
    </div></div>";
        $scope.errorResponse = {};
        var Defaultevent = function (e) {
            e.preventDefault();
            document.body.style.overflowY = "none";
        };

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
        $scope.insertStepMovement = function (step_id) {
            insert_step_movement.insertStepMovement(step_id)
        }
        $scope.printErrorMsg = function () {
            $scope.insertStepMovement(24)
            try {
                $loadingOverlay.hide();
            } catch (e) {
            }
            $scope.errorResponse = JSON.parse(localStorage.getItem('errorMessage'))
            //console.log($scope.errorResponse);
            var errorCount = 0;
            var firstErrorMessage = [];
            try {
                if ('details' in $scope.errorResponse) {
                    if ('face' in $scope.errorResponse.details) {
                        if ('closedeyes' in $scope.errorResponse.details.face) {
                            if (($scope.errorResponse.details.face.left != null && $scope.errorResponse.details.face.right != null) && ($scope.errorResponse.details.face.left || $scope.errorResponse.details.face.right)) {
                                //$scope.ErrorMessage  = $scope.errorMessages.subjectNotFacingCamera;
                                firstErrorMessage.push($scope.errorMessages.subjectNotFacingCamera);
                                $scope.headerText = false;

                                errorCount += 1;
                            }
                        }

                        if ('contrast' in $scope.errorResponse.details.face) {
                            if (($scope.errorResponse.details.face.contrast != null) && (!$scope.errorResponse.details.face.contrast)) {
                                //$scope.ErrorMessage  = $scope.errorMessages.notLookinIntoCamera;
                                firstErrorMessage.push($scope.errorMessages.notLookinIntoCamera);
                                $scope.headerText = false;
                                errorCount += 1;
                            }
                        }

                        if ('focus' in $scope.errorResponse.details.face) {
                            if (($scope.errorResponse.details.face.focus != null) && (!$scope.errorResponse.details.face.focus)) {
                                //$scope.ErrorMessage  = $scope.errorMessages.focus;
                                firstErrorMessage.push($scope.errorMessages.focus);
                                $scope.headerText = false;
                                errorCount += 1;
                            }
                        }

                        if ('openmouth' in $scope.errorResponse.details.face) {
                            if (($scope.errorResponse.details.face.openmouth != null) && ($scope.errorResponse.details.face.openmouth)) {
                                //$scope.ErrorMessage  = $scope.errorMessages.mouteOpen_Smiling;
                                firstErrorMessage.push($scope.errorMessages.mouteOpen_Smiling);
                                $scope.headerText = false;
                                errorCount += 1;
                            }
                        }


                        if ('resolution' in $scope.errorResponse.details.face) {
                            if (($scope.errorResponse.details.face.resolution != null) && (!$scope.errorResponse.details.face.resolution)) {
                                //$scope.ErrorMessage  = $scope.errorMessages.lowImageResolution;
                                firstErrorMessage.push($scope.errorMessages.lowImageResolution);
                                $scope.headerText = false;
                                errorCount += 1;
                            }
                        }

                        if ('pose' in $scope.errorResponse.details.face) {
                            if (($scope.errorResponse.details.face.pose.yaw != null) && ($scope.errorResponse.details.face.pose.yaw > 45 || $scope.errorResponse.details.face.pose.yaw < -45)) {
                                //$scope.ErrorMessage  = $scope.errorMessages.notLookinIntoCamera;
                                firstErrorMessage.push($scope.errorMessages.notLookinIntoCamera);
                                $scope.headerText = false;
                                errorCount += 1;
                            }
                        }
                    }

                    if ('faces' in $scope.errorResponse.details) {
                        if (($scope.errorResponse.details.faces != null) && ($scope.errorResponse.details.faces == 0)) {
                            //$scope.ErrorMessage  = $scope.errorMessages.noFace;
                            firstErrorMessage.push($scope.errorMessages.noFace);
                            $scope.headerText = false;
                            errorCount += 1;
                        }
                        else if (($scope.errorResponse.details.faces != null) && ($scope.errorResponse.details.faces > 1)) {
                            //$scope.ErrorMessage  = $scope.errorMessages.multipleFace;
                            firstErrorMessage.push($scope.errorMessages.multipleFace);
                            $scope.headerText = false;
                            errorCount += 1;
                        }
                    }

                    if ('pass' in $scope.errorResponse.details) {
                        if ($scope.errorResponse.details.pass != null && !$scope.errorResponse.details.pass && errorCount == 1) {
                            $scope.ErrorMessage = firstErrorMessage[0];
                            $scope.headerText = false;
                        }
                        else {
                            $scope.headerText = true;
                        }
                    }
                }
                return;
            }
            catch (e) {
                //console.log('e',e);
            }
            //console.log('$scope.errorResponse',$scope.errorResponse);
        }


        //----------------------------------On Image Upload------------------------------------------------
        $scope.fileNameChanged = function (changeEvent) {
            $loadingOverlay.show($scope.loading_template, 'rgba(0, 0, 0, 0.7)', '#fff');
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

        $scope.checkForLapetusId = function () {
            setTimeout(function () {
                $scope.updateCheckMark('b1')
                $scope.updateLoadingMark('b2')
            }, 500)
            $scope.registerUploadedImage()
        }


        $scope.registerUploadedImage = function () {
            $http.get("/api/v1/sf_eligible").then(
                function (data) {
                    $http.post("/api/v1/sf_image_upload", {
                        'userImageBinary': $rootScope.oriented_image_blob
                    }).then(function (data) {
                            //console.log('data',data);
                            let returnData = data.data.data

                            $scope.updateCheckMark('b2')
                            $scope.updateLoadingMark('b3')
                            $scope.updateLoadingMark('b4')
                            $scope.updateLoadingMark('b5')
                            if ("code" in returnData) {
                                if (returnData.code >= 400) {
                                    localStorage.setItem('errorMessage', JSON.stringify(returnData));
                                    $scope.printErrorMsg()
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
                            //console.log('err',err);
                            try {
                                document.body.removeEventListener('touchmove', Defaultevent, false);
                                $loadingOverlay.hide();
                            } catch (e) {
                            }
                            if (err.status === 401) {
                                $location.path("/selfie_max_limit")
                            }
                        })


                }, function (err) {
                    $loadingOverlay.hide();
                    if (err.status === 401) {
                        $location.path("/selfie_max_limit")
                    }
                    //console.log(err);
                }
            )
        }

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

                            $scope.updateCheckMark('b5')
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
                                setTimeout(function () {
                                    $scope.GetUserImageEstimatedResponse();}, 2000);
                            }
                        }
                    },
                    function (err) {
                        //console.log('err',err);
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
        $scope.printErrorMsg();
        $window.scrollTo(0, 0);
    })
})();
