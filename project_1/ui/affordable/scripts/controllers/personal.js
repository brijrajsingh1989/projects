var stateList = "";
'use strict';

/**
 * @ngdoc function
 * @name legalGeneralApp.controller:QuotationCtrl
 * @description
 * # QuotationCtrl
 * Controller of the legalGeneralApp
 */
angular.module('legalGeneralApp')

.controller('PersonalCtrl', function ($loadingOverlay, $http, $filter, $timeout, ziptastic, $scope, $location, $window, $uibModal, $rootScope, userPersonalInfo, $cookies
        , $sce, quoteDataInfo, quoteRespList, appStorage) {
          $scope.$on('tfn', function(events, toll_free_number){
            console.log("TFN received! ", toll_free_number);
             $scope.toll_free_number = toll_free_number
           })
        var refer_uri = parseUri(document.referrer);
        //console.log(document.referrer)
        if (refer_uri && /^\/selfie\-quote\/?/.test(refer_uri.path))
        {
            //console.log(refer_uri.path)
            $rootScope.endpoint = "/selfie-quote/";
        }
        else if (refer_uri && /^\/free\-quote\/?/.test(refer_uri.path))
        {
            //console.log(refer_uri.path)
            $rootScope.endpoint = "/free-quote/";
        }
        else if (refer_uri && /^\/quote\/?/.test(refer_uri.path))
        {
            //console.log(refer_uri.path)
            $rootScope.endpoint = "/quote/";
        }

        var classId = "";
        var isOpenoedFromEmail = false;
        $scope.personalInfo = {
              "firstName": ""
            , "lastName": ""
            , "mobileNumber": ""
            , "emailAddress": ""
        , };
        var evolveId = "";
        var location_url = window.location.href
        $scope.legal_stuff_confirrmation = true;
        $scope.kba_questions = {};
        $scope.stateFromZip = appStorage.get('statefromzip');
        // console.log($scope.stateFromZip);
        var zipflag = 1;
        document.getElementById("firstNameID1").focus();
        // console.log(JSON.parse(appStorage.get('stateList')));
        $scope.stateList = stateList = JSON.parse(appStorage.get('stateList'));
        if (quoteRespList.getQuoteResp() === null || quoteRespList.getQuoteResp() === undefined || quoteRespList.getQuoteResp() === '') {

        } else {
            $scope.quoteResp = JSON.parse(quoteRespList.getQuoteResp());
            if ($scope.quoteResp) {
                classId = $scope.quoteResp.underwritingClass.id;
            }
        }
        var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
            /*----------------------*/

        if (appStorage.get('quoteDataInfo') !== undefined && appStorage.get('quoteDataInfo') !== null) {
            var quoteData = JSON.parse(appStorage.get('quoteDataInfo'));
            if (!quoteData.step1_visited && !isOpenoedFromEmail && !quoteData.isSnowFlake) {
                $location.path("/quote_data");
                return;
            }
        } else {
            if (!isOpenoedFromEmail) {
                $location.path("/quote_data");
                return;
            }
        }
        try {
            if ((userPersonalInfo.getPersonalInfo() != undefined) && (userPersonalInfo.getPersonalInfo() != null) && (userPersonalInfo.getPersonalInfo() != '')) {
                //console.log('userPersonalInfo.getPersonalInfo()',userPersonalInfo.getPersonalInfo());
                $scope.personalInfo = JSON.parse((userPersonalInfo.getPersonalInfo()));
            }
        } catch (e) {

        }
        $scope.checkMobile = function (mobile, ignore_message) {
            if (mobile !== undefined && mobile !== null && mobile !== "") { //Data exists
                if (mobile !== null && mobile != undefined) {
                    mobile = mobile.replace(/-/g, '');
                    //console.log("mobile is "+ mobile)
                    if (mobile.length !== 10) {
                        // if(mobile.match(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/) === null){
                        if (ignore_message !== 1) {
                            toastr.error('Enter valid contact number.', 'Attention')
                        }
                        return -1;
                    }
                }
            } else { //No mobile data
                return -1;
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

        $scope.$on('IdleTimeout', function () {
            // console.log("session timedout");
            var quoteData = JSON.parse(appStorage.get('quoteDataInfo'));
            if (quoteData.isSnowFlake) {
                alert("Session timed out!!");
                window.location.href = getSnoflakeRedirectionURL();
            } else {
                alert("Session timed out!!");
                window.location.href = ("/");
            }
        });
        $scope.mobileNumberInput = function (event) {
            if (event.keyCode != 8 && $scope.personalInfo.mobileNumber != undefined && event.keyCode != 229) {
                if (($scope.personalInfo.mobileNumber.length === 3 || $scope.personalInfo.mobileNumber.length === 7))
                    $scope.personalInfo.mobileNumber += '-';
            }
        }

        var insertPersonalInfo = function () {
            var req_data = {
                "first_name": $scope.personalInfo.firstName
                , "last_name": $scope.personalInfo.lastName
                , "email_address": $scope.personalInfo.emailAddress
                , "mobile_number": $scope.personalInfo.mobileNumber
            }
            $http.post("/api/v1/personal_info", req_data)
                .then(function (data) {
                        //console.log("Success", data);
                    }
                    , function (err) {
                        //console.log("err", err);
                    })
        }

        $scope.personal_submit = function () {
            if ($scope.personalInfo.firstName === "" || $scope.personalInfo.firstName === undefined || $scope.personalInfo.firstName === null) {
                toastr.error('Enter First Name.', 'Attention')
                return
            }
            if ($scope.personalInfo.lastName === "" || $scope.personalInfo.lastName === undefined || $scope.personalInfo.lastName === null) {
                toastr.error('Enter Last Name.', 'Attention')
                return
            }
            if ($scope.checkMobile($scope.personalInfo.mobileNumber, 1) === -1) {
                toastr.error('Please Enter a valid Phone Number.', 'Attention')
                return
            }
            if ($scope.checkEmail($scope.personalInfo.emailAddress, 1) === -1) {
                toastr.error('Please Enter a valid Email ID.', 'Attention')
                return
            }
            insertPersonalInfo();
            $scope.ga_lead();
            $location.path('call_to_apply'); //TEMP

        }

        $scope.selectedBenefID = function (a) {
            // console.log("benefID",a);
            $scope.personalInfo.beneficiaryTypeId = $filter('searchBenefId')(a);
        }

        $scope.height_chart = {};
        for (var j = 4; j < 7; j++) {
            var k;
            for (((j === 4) ? k = 10 : k = 0); k < 12; k++) {
                $scope.height_chart[j + " " + k] = j + "' " + k + "\"";
            }
        }

        $scope.back = function (page) {
            //console.log(page);
            $location.path("/" + page);
            return;
        }
        $scope.check_dob = function (data, ignore) {
            if (data === "" || data === null || data === undefined) {
                //console.log("dob is not present")
                $scope.valid_params.dob.status = false;
                return -1;
            }
            if (check_date(data, ignore) === -1) { //Date is invalid. Exit.
                $scope.valid_params.dob.status = false;
                return -1;
            } else { //Date is valid. Checking Age.
                //console.log("Date is valid. Checking Age.");
                var userAge = getAge(data);
                //console.log(userAge);
                if (!(getAge(data) >= $scope.ageLowerLimit && getAge(data) <= $scope.ageUpperLimit)) {
                    //console.log("age is incorrect");
                    if (ignore !== 1)
                        var errormsg = 'Age should be between ' + $scope.ageLowerLimit + ' and ' + $scope.ageUpperLimit + '.'
                    toastr.error(errormsg, 'Attention!')
                    $scope.valid_params.dob.status = false;
                    return -1;
                }
            }
            //Date is all fine.
            //console.log("DOB ALL FINE");
            $scope.valid_params.dob.status = true;
            return 1;
        }

        //window.addEventListener('popstate', function () {
        // if(quoteData.isSnowFlake){
        //  console.log("Is Snowflake");
        // window.history.back()
        // }
        //});

        $scope.personal_info_back = function () {
            if (quoteData.isSnowFlake) {
                window.history.back()
            } else {
                window.history.back()
            }
        }

        $scope.ga_lead = function () {
            try {
                $window.dataLayer.push({
                    event: "GAEvent"
                    , eventCategory: "selfie"
                    , eventAction: "personal_info"
                    , eventLabel: ""
                    , eventValue: ""
                });
            } catch (e) {}
        }

        $scope.ga_next_step = function () {
            try {
                if (!quoteData.isSnowFlake) {
                    $window.dataLayer.push({
                        event: "GAEvent"
                        , eventCategory: "quoting"
                        , eventAction: "personal_info"
                        , eventLabel: appStorage.get('case_id')
                        , eventValue: ""
                    });
                }

                if (quoteData.isSnowFlake) {
                    $window.dataLayer.push({
                        event: "GAEvent"
                        , eventCategory: "selfie"
                        , eventAction: "personal_info"
                        , eventLabel: ""
                        , eventValue: ""
                    });
                }
            } catch (e) {}
        }

        $scope.ga_apply_online = function () {
            try {
                $window.dataLayer.push({
                    event: "GAEvent"
                    , eventCategory: "conversion"
                    , eventAction: "lead"
                    , eventLabel: "apply_online"
                    , eventValue: ""
                });
            } catch (e) {}
        }

        $scope.ga_receives_kba = function () {
            // console.log("GA KBA");
            try {
                // console.log("Inside event");
                $window.dataLayer.push({
                    event: "GAEvent"
                    , eventCategory: "application"
                    , eventAction: "kba_attempted"
                    , eventLabel: appStorage.get('case_id')
                    , eventValue: ""
                });
            } catch (e) {}
        }

        $scope.ga_passed_kba = function () {
            try {
                $window.dataLayer.push({
                    event: "GAEvent"
                    , eventCategory: "application"
                    , eventAction: "kba_passed"
                    , eventLabel: appStorage.get('case_id')
                    , eventValue: ""
                });
            } catch (e) {}
        }

        $scope.ga_ol_to_c2a = function () {
            try {
                $window.dataLayer.push({
                    gaEvent: "GAEvent"
                    , eventCategory: "application"
                    , eventAction: "call_to_apply"
                    , eventLabel: appStorage.get('case_id')
                    , eventValue: ""
                });
            } catch (e) {}
        }

        $window.scrollTo(0, 0);
    })
    .filter('searchBenefId', function () {
        return function (input) {
            for (var i = 0; i < relationList.length; i++) {
                if (relationList[i].description === input) {
                    //console.log("ID found",relationList[i].id);
                    return relationList[i].id;
                }
            }
            //return input.toString();
        }
    })
    .filter('stateFilter', function () {
        return function (input) {
            //console.log("stateList in filter",stateList);
            for (var i = 0; i < stateList.length; i++) {
                if (stateList[i].stateName === input) {
                    //console.log("eligibility found",stateList[i].eligible);
                    return stateList[i].eligible;
                }
            }
            //return input.toString();
        }
    })
    .filter('shortState', function () {
        return function (input) {
            //console.log("input in short state",input);
            for (var i = 0; i < stateList.length; i++) {
                if (stateList[i].stateName === input) {
                    //console.log("eligibility found",stateList[i].eligible);
                    return stateList[i].description;
                }
            }
            //return input.toString();
        }
    })
    .filter('stateId', function () {
        return function (input) {
            //console.log("input in short state",input);
            for (var i = 0; i < stateList.length; i++) {
                if (stateList[i].stateName === input) {
                    //console.log("eligibility found",stateList[i].eligible);
                    return stateList[i].id;
                }
            }
            //return input.toString();
        }
    })
