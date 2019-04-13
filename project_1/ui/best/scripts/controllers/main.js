
var history_api = typeof history.pushState !== 'undefined';
// history.pushState must be called out side of AngularJS Code
if (history_api) history.pushState(null, '');
'use strict';

// Generate finger print
(function() {
    let options = {excludeJsFonts:true, excludeFlashFonts:true}
    new Fingerprint2().get(function (result, options) {
        let date = new Date();
        date.setTime(date.getTime() + (60*24*60*60*1000));
        document.cookie = "session_fp="+btoa(result)+"; expires=" + date.toUTCString() + "; path=/";
    });
})();

/**
 * @ngdoc function
 * @name legalGeneralApp.controller:MainCtrl
 * @description
 * Controller of the legalGeneralApp
 */

angular.module('legalGeneralApp')
    .controller('MainCtrl', function ($anchorScroll, $loadingOverlay, quoteApiReq, $filter, $timeout, $interval, $rootScope
        , $scope, ziptastic, $http, $state, $location, dataCache, quoteDataInfo, quoteRespList, $cookies
        , appStorage, $sce, $window, setStepMovement,stateList,$document) {

        $scope.gotoAnchor = function(anchor) {
            var id = $location.hash();
            $location.hash(anchor);
            $anchorScroll();
            $location.hash(id);
        };
        $scope.$on('tfn', function(events, toll_free_number){
          console.log("TFN received! ", toll_free_number);
           $scope.toll_free_number = toll_free_number
         })
        $scope.stage_id = 0;
        $scope.ageLowerLimit = 20
        $scope.ageUpperLimit = 75
        $scope.term_lengths = [10, 15, 20, 25, 30, 35, 40]
        $scope.reload_dob_flag = false;
        $scope.reload_zipcode_flag = false;
        $scope.reload_tobacco_flag = false;
        var cookies = $cookies.getAll();
        $scope.app_url = "/best/views/loading.html";
        for (var prop in $rootScope) {
            if (prop.substring(0, 1) !== '$') {
                delete $rootScope[prop];
            }
        }
        try {
            angular.forEach(sessionStorage, function (item, key) {
                sessionStorage.removeItem(key);
            });
        } catch (e) {
        }
        $rootScope.endpoint = window.location.pathname;

        // var cookies = document.cookie.split(";");
        // for (var i = 0; i < cookies.length; i++) {
        //     var cookie = cookies[i];
        //     var eqPos = cookie.indexOf("=");
        //     var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        //     if (name !== 'session_fp')
        //         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // }
        // var date = new Date();
        // date.setTime(date.getTime() + (21 * 24 * 60 * 60 * 1000));
        // var expires = "; expires=" + date.toUTCString();
        // document.cookie = "session_fp=" + "5614651" + expires + "; path=/";
        $http.get("/api/v1/generate_case_id")
            .then(function (data) {
                $rootScope.case_id = data.data.data;
                appStorage.set('case_id', data.data.data);
                $scope.app_url = 'best/views/main.html'
                paidSearchTracking();
                parseEverQuoteParams();
                setStepMovement.setStepMovement(1);
            }, function (err) {
                // console.log(err)
            })
        var ip = $rootScope.ip;
        $scope.valid_params = {
            gender: {id: 0, status: false, message: 'Please select Gender'}
            , dob: {id: 1, status: false, message: 'Please enter Date Of Birth'}
            , height: {id: 2, status: false, message: 'Please select Height'}
            , weight: {id: 3, status: false, message: 'Please enter Weight'}
            , tobacco: {id: 4, status: false, message: 'Please select Tobacco Status'}
            , quit_tabacco: {id: 5, status: false, message: 'Please select Information about Tobacco-Quit'}
            , zip: {id: 6, status: false, message: 'Please enter valid Zip Code'}
            , overallHealth: {id: 7, status: false, message: 'Please select Health Rating'}
            , amount: {id: 8, status: false, message: 'Please select Coverage Amount'}
            , tenure: {id: 9, status: false, message: 'Please select the Tenure'}
        };

        $scope.current_Date = new Date().toString();
        $scope.feet = "";
        $scope.inches = "";
        /*Overlay message*/
        var template = "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'><div class='loader'>Loading...</div> <span>Please wait...<span></div>"
        /*----------------------*/
        $scope.quoteData = {
            "amount": ""
            , "dob": ""
            , "gender": ""
            , "health": ""
            , "height": ""
            , "state_name": ""
            , "state_name_long": ""
            , "city_name": ""
            , "tenure": ""
            , "weight": ""
            , "zip_code": ""
            , "quit_tabacco": ""
            , "tobacco": ""
            , "step0_visited": false
        };
        $scope.zip_key_up = function (ignore, call_dynamic) {
            $scope.state_name = '';
            $scope.status = "";
            $scope.address = "";
            if ($scope.quoteData.zip_code !== '' && $scope.quoteData.zip_code !== undefined && $scope.quoteData.zip_code !== null) {
                if ($scope.quoteData.zip_code.length >= 5) {
                    ziptastic.lookup($scope.quoteData.zip_code)
                        .then(function (data) {
                            $scope.status = 200;
                            $scope.valid_params.zip.status = true;
                            //console.log('data',data);
                            $scope.address = data.city + ", " + data.state_short;
                            $scope.quoteData.state_name = data.state_short;
                            $scope.quoteData.city_name = data.city;
                            $scope.quoteData.state_name_long = data.state.toUpperCase();
                            if ($scope.quoteData.state_name_long === "DISTRICT OF COLUMBIA") {
                                $scope.quoteData.state_name_long = "DC WASHINGTON";
                            }
                            if (data.city === "O Fallon") {
                                data.city = "O'Fallon"
                            }
                            appStorage.set('statefromzip', $scope.quoteData.state_name_long)
                            if (call_dynamic === 1) {
                                $scope.dynamicTermLength('reload_zipcode_flag');
                            }
                            if (stateList.verify($scope.quoteData.state_name) == false){
                              // Do not allow the other states apart from the 51. As per discussion with Bea.
                              throw {"status":404}
                            }
                        })
                        .catch(function (err) {
                            // console.error('Error in lookup', err);
                            if (err.status === 404) {
                                $scope.status = 404;
                                $scope.quoteData.state_name = "";
                                if (ignore !== 1)
                                    toastr.error('Sorry, we couldn\'t match your zip code with any locations. Please ensure your 5-digit zip code is correctly entered.', 'Attention!');
                                $scope.valid_params.zip.status = false;
                                document.getElementById("zipcode").value = "";
                                return -1;
                            }
                        });
                } else { //Length is less than 5
                    {
                        $scope.valid_params.zip.status = false;
                        return -1;
                    }
                }
            } else {
                {
                    $scope.valid_params.zip.status = false;
                    return -1;
                }
            }
        }
        //$scope.liveDate;
        $scope.$watch('quoteData.dob', function (newvalue, oldvalue) {
            try {
                $scope.liveDate = new Date(newvalue);
                //console.log("new live date",$scope.liveDate);
            } catch (e) {
            }

            if (!$scope.liveDate) {
                $scope.error = "This is not a valid date";
            } else {
                $scope.error = false;
            }
        }, true);
        $scope.height_chart = {};
        for (var j = 4; j < 7; j++) {
            var k;
            for (((j === 4) ? k = 10 : k = 0); k < 12; k++) {
                $scope.height_chart[j + " " + k] = j + "' " + k + "\"";
            }
        }
        $scope.gender_change = function (gender) {
            $scope.quoteData.gender = gender;
        }
        $scope.zip_code = "";
        $scope.height = "";
        $scope.weight = "";
        $scope.feet_start = "";
        $scope.tenure_class = {'10': '', '15': '', '20': '', '25': '', '30': ''};
        $scope.tobacco_class = {"yes": '', "no": 'toggle_btn_selected'}
        $scope.height_inches_range = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        $scope.amount_range = [
            "$100,000", "$150,000", "$200,000", "$250,000", "$300,000", "$350,000", "$400,000"
            , "$450,000", "$500,000", "$550,000", "$600,000", "$650,000", "$700,000", "$750,000"
            , "$800,000", "$850,000", "$900,000", "$950,000", "$1,000,000", "$2,000,000", "$3,000,000"
            , "$4,000,000", "$5,000,000", "$6,000,000", "$7,000,000", "$8,000,000", "$9,000,000"
            , "$10,000,000"
        ]
        $scope.tenure_class['10'] = "selected";
        $scope.tenure = 20;


        $scope.date_format = function (event) {
            if ($scope.quoteData.dob !== undefined && $scope.quoteData.dob !== null &&
                $scope.quoteData.dob !== "" &&
                ($scope.quoteData.dob.charAt($scope.quoteData.dob.length - 1) !== '-') &&
                ($scope.quoteData.dob.charAt($scope.quoteData.dob.length - 1) !== '/') &&
                ($scope.quoteData.dob.split('/')
                    .length <= 2) &&
                ($scope.quoteData.dob.split('-')
                    .length <= 2)) {
                if (event.keyCode != 8 && event.keyCode != 191 && event.keyCode != 111 &&
                    event.keyCode != 189 && event.keyCode != 229 && event.keyCode != 46) {
                    if (($scope.quoteData.dob.length === 2 || $scope.quoteData.dob.length === 5))
                        $scope.quoteData.dob += '-';
                }
            }
        }

        $scope.check_dob = function (data, ignore, call_dynamic) {
            if ($scope.quoteData.dob === "" || $scope.quoteData.dob === null || $scope.quoteData.dob === undefined) {
                $scope.valid_params.dob.status = false;
                return -1;
            }
            if (check_date(data, ignore) === -1) { //Date is invalid. Exit.
                $scope.valid_params.dob.status = false;
                return -1;
            } else { //Date is valid. Checking Age.
                var userAge = getAge(data);
                if (!(getAge(data) >= $scope.ageLowerLimit && getAge(data) <= $scope.ageUpperLimit)) {
                    if (ignore !== 1)
                        var errormsg = 'Age should be between ' + $scope.ageLowerLimit + ' and ' + $scope.ageUpperLimit + '.'
                    toastr.error(errormsg, 'Attention!')
                    $scope.valid_params.dob.status = false;
                    return -1;
                }
            }
            $scope.valid_params.dob.status = true;
            if (call_dynamic === 1) {
                $scope.dynamicTermLength('reload_dob_flag');
            }
            return 1;
        }
        $scope.address = "";
        $scope.checkWeight = function (weight, ignore) {
            if (weight !== null && weight != undefined) {
                if (String(weight).match(/^-?\d+\.?\d*$/) === null) {
                    if (ignore != 1) {
                        toastr.error('Enter valid weight.', 'Attention!')
                    }
                    $scope.valid_params.weight.status = false;
                    return -1;
                }
                $scope.valid_params.weight.status = true;
            }
        }
        $scope.putamount = function () {
            $scope.valid_params.amount.status = true;
        }
        $scope.selectTenure = function () {
            $scope.valid_params.tenure.status = true;
        }

        $scope.setTobacco = function (stat) {
            $scope.quoteData.tobacco = stat;
            $scope.valid_params.tobacco.status = true;
        }
        var isValid = function (data) {
            if (data !== undefined && data !== null && data !== '') {
                return true
            }
            return false
        }

        $scope.dynamicTermLength = function (reload_flag) {
          $timeout(function () {
                if (isValid($scope.quoteData.dob) && (isValid($scope.quoteData.state_name)) && (isValid($scope.quoteData.tobacco))) {
                    var req_data = {
                        'stateCode': $scope.quoteData.state_name
                        ,
                        'dateOfBirth': $scope.quoteData.dob.replace(/ /g, '')
                            .replace(/-/g, '/')
                        ,
                        'isTobaccoUser': ($scope.quoteData.tobacco === true || $scope.quoteData.tobacco === "true") ? true : false
                        ,
                    };
                    $scope[reload_flag] = true;
                    //console.log("req data is ", req_data);
                    $http.post('/api/v1/dynamic_term_length', req_data)
                        .then(function (data) {
                            $scope[reload_flag] = false;
                            $scope.term_lengths = data.data.data.termLengths
                        }, function (err) {
                            $scope[reload_flag] = false;
                            console.log("error", err);
                        })
                }
            }, 100);
        }
        $scope.dob_on_change = function (data) {
            if (isValid(data)) {
                if ((data.length === 14) && isValid($scope.quoteData.dob) && (isValid($scope.quoteData.state_name)) && (isValid($scope.quoteData.tobacco))) {
                    //console.log("Blur out");
                    document.getElementById('input_dob').blur();
                }
            }
        }
        $scope.on_show_my_quote_click = function (isValid, feet, inches) {
            var selected_height = "";
            $scope.user_height = "";
            if ($scope.quoteData.gender !== "" && $scope.quoteData.gender !== undefined && $scope.quoteData.gender !== null) {
                $scope.valid_params.gender.status = true;
            } else {
                $scope.valid_params.gender.status = false;
            }
            $scope.check_dob($scope.quoteData.dob, 1, 0);
            $scope.zip_key_up(1, 0);


            if ($scope.quoteData.height) {
                $scope.valid_params.height.status = true;
            } else {
                $scope.valid_params.height.status = false;
            }

            if ($scope.checkWeight($scope.quoteData.weight, 1) === -1) {
                $scope.valid_params.weight.status = false;
            } else {
                $scope.valid_params.weight.status = true;
            }

            if ($scope.quoteData.tobacco !== "" && $scope.quoteData.tobacco !== null && $scope.quoteData.tobacco !== undefined) {
                //Tobacco Data is Entered
                $scope.valid_params.tobacco.status = true;
            }

            if ($scope.quoteData.health) {
                $scope.valid_params.overallHealth.status = true;
            }
            if ($scope.quoteData.amount) {
                $scope.valid_params.amount.status = true;
            }
            if ($scope.quoteData.tenure && $scope.quoteData.tenure > 0) {
                $scope.valid_params.tenure.status = true;
            }

            //********************************************************************************//

            if ($scope.valid_params.gender.status === false) {
                toastr.error($scope.valid_params.gender.message, 'Attention!');
            } else if ($scope.valid_params.dob.status === false) {
                toastr.error($scope.valid_params.dob.message, 'Attention!');
                return;
            } else if ($scope.valid_params.height.status === false) {
                toastr.error($scope.valid_params.height.message, 'Attention!');
                return;
            } else if ($scope.valid_params.weight.status === false) {
                toastr.error($scope.valid_params.weight.message, 'Attention!');
                return;
            } else if ($scope.valid_params.tobacco.status === false) {
                toastr.error($scope.valid_params.tobacco.message, 'Attention!');
                return;
            } else if ($scope.valid_params.zip.status === false) {
                toastr.error($scope.valid_params.zip.message, 'Attention!');
                return;
            } else if ($scope.valid_params.overallHealth.status === false) {
                toastr.error($scope.valid_params.overallHealth.message, 'Attention!');
                return;
            } else if ($scope.valid_params.amount.status === false) {
                toastr.error($scope.valid_params.amount.message, 'Attention!');
                return;
            } else if ($scope.valid_params.tenure.status === false) {
                toastr.error($scope.valid_params.tenure.message, 'Attention!');
                return;
            } else {
                $scope.quoteData.dob = $scope.quoteData.dob.replace(/ /g, '');
                $scope.quoteData.dob = $scope.quoteData.dob.replace(/\//g, '-');
                $loadingOverlay.show(template, 'rgba(0, 0, 0, 0.7)', '#fff');
                var url = "/api/v1/quote_data";
                var quote_data_amount_selected = $scope.quoteData.amount;
                var amount = $scope.quoteData.amount.split("$");
                amount = amount[1].replace(/,/g, "");
                amount = amount.split(",")
                    .join('');
                if ($scope.app_url === 'best/views/main.html') {
                    var selected_height = $scope.quoteData.height;
                    var h = $scope.quoteData.height.replace(" ", "")
                        .replace("'", " ")
                        .split(" ");
                    var height = parseInt(h[0]) * 12 + parseInt(h[1]);
                    $scope.user_height = Number(height);

                }
                if ($scope.quoteData.tobacco === "false" || $scope.quoteData.tobacco === false) {
                    $scope.quoteData.quit_tabacco = null;
                } else if ($scope.quoteData.tobacco === "true" || $scope.quoteData.tobacco === true) {
                    $scope.quoteData.quit_tabacco = 1;
                }
                $scope.quoteData.weight = Number($scope.quoteData.weight);

                var reqData = {
                    "id": appStorage.get('case_id'), // case id
                    "dateOfBirth": $scope.quoteData.dob
                    ,
                    "gender": Number($scope.quoteData.gender)
                    ,
                    "height": $scope.user_height
                    ,
                    "weight": $scope.quoteData.weight
                    ,
                    "state": $scope.quoteData.state_name
                    ,
                    "isTobaccoUser": ($scope.quoteData.tobacco === "true" || $scope.quoteData.tobacco === true) ? true : false
                    ,
                    "faceAmount": Number(amount)
                    ,
                    "product": "EasyPass"
                    ,
                    "termDuration": $filter('stringToNum')($scope.quoteData.tenure)
                    ,
                    "overallHealth": Number($scope.quoteData.health)
                    ,
                    "whenQuitTobacco": ($scope.quoteData.tobacco === 1 || $scope.quoteData.tobacco === true || $scope.quoteData.tobacco === "true") ? (Number($scope.quoteData.quit_tabacco)) : (null)
                    ,
                    "generatePremiumComparisonsByFace": true
                    ,
                    "zip_code": $scope.quoteData.zip_code
                    ,
                    "city_fullname": $scope.quoteData.city_name
                    ,
                    "state_fullname": $scope.quoteData.state_name_long
                    ,
                    "journey": "best"
                    ,
                    "journeyId": "best"
                    ,
                    "qp": $scope.query_params
                }
                quoteApiReq.setQuoteReq(reqData);
                if (reqData.isTobaccoUser === 1) {
                    reqData.isTobaccoUser = true;
                } else if (reqData.isTobaccoUser === 0) {
                    reqData.isTobaccoUser = false;
                }
                var insuranceType = '';
                $http.post(url, reqData)
                    .then(function (data) {
                        try {
                            var returnData = data.data.data;
                            quoteRespList.setQuoteResp(returnData);
                            if (returnData.status.success === true && (returnData.modalPremium === null || returnData.modalPremium === undefined) && (returnData.underwritingClass === null || returnData.underwritingClass === undefined)) {
                                $loadingOverlay.hide();
                                $scope.quoteData.step0_visited = true;
                                $location.path('quote_data_no_premium');
                            } else if (returnData.status.success === true && (returnData.isEligible === false)) {
                                $loadingOverlay.hide();
                                $scope.quoteData.step0_visited = true;
                                $location.path('quote_data_no_premium');
                            } else if (returnData.status.success === false) {
                                $loadingOverlay.hide();
                                $location.path('call_to_apply');
                            } else if (returnData.underwritingClass === null || returnData.underwritingClass === undefined) {
                                $loadingOverlay.hide();
                                $location.path('call_to_apply');
                            } else if (returnData.isEligible === true) {
                                $loadingOverlay.hide();
                                $scope.quoteData.step0_visited = true;
                                $location.path('quote_data');
                            } else if (returnData.isEligible === false && returnData.status.errors.length > 0) {
                                $loadingOverlay.hide();
                                toastr.error(returnData.status.errors[0], 'Attention!');
                            }

                            $scope.quoteData.underwritingClass = returnData["underwritingClass"];
                            $scope.quoteData.amount = quote_data_amount_selected;
                            $scope.quoteData.height = selected_height;
                            $scope.quoteData.isSnowFlake = false;
                            quoteDataInfo.setQuoteDataInfo($scope.quoteData);

                            if ("underwritingClass" in returnData) {
                                if ((returnData["underwritingClass"] != null || returnData["underwritingClass"] != undefined)) {
                                    if (("name" in returnData["underwritingClass"])) {
                                        reqData.planinsurance = returnData["underwritingClass"].name;
                                    }
                                }
                            }

                            if($scope.quoteData.isEverQuote && (($cookies.get("gtm_last_visit"))?$cookies.get("gtm_last_visit").toLowerCase().includes("e001"):(($cookies.get("gtm_first_visit"))?$cookies.get("gtm_first_visit").toLowerCase().includes("e001"):false)))
                            {
                              //ever-quote pixel on quote start
                              //var myEl = angular.element( document.querySelector('#pixels'));
                              var myEl = $document.find('body').eq(0);
                              myEl.append('<div id="p.adh8.com:pixel"><img style="display:none" width="0" height="0" src="https://p.everquote.com/f?mode=pixel&event=5TB51ERR50VHPES&adhid='+$scope.quoteData.adhid+'&psrc=7"/></div>');
                            }
                        } catch (e) {
                            //console.log(e);
                            $loadingOverlay.hide();
                            $location.path('call_to_apply');
                        }

                    }, function (error) {
                        $loadingOverlay.hide();
                        $location.path('call_to_apply');
                        //console.log("error",error);
                    })

            }

            try {
                $window.dataLayer.push({
                    event: "GAEvent"
                    , eventCategory: "quoting"
                    , eventAction: "landing"
                    , eventLabel: appStorage.get('case_id')
                    , eventValue: 0
                },
                {
                    event: "GAEvent"
                    , eventCategory: "quoting"
                    , eventAction: "saw_quote"
                });
            } catch (e) {
                //console.log(e);
            }
        }

        function parseQuery(str)
        {
            if(typeof str != "string" || str.length == 0) return {};
            var s = str.split("&");
            var s_length = s.length;
            var bit, query = {}, first, second;
            for(var i = 0; i < s_length; i++)
                {
                bit = s[i].split("=");
                first = decodeURIComponent(bit[0]);
                if(first.length == 0) continue;
                second = decodeURIComponent(bit[1]);
                if(typeof query[first] == "undefined") query[first] = second;
                else if(query[first] instanceof Array) query[first].push(second);
                else query[first] = [query[first], second];
                }

            return query;
        }
        var paidSearchTracking = function () {
            //var qs = $window.location.search;
            //Chnages made by partha on 30-05-2018 as hotfix
            var qs = $window.location.search.replace('?','');
            console.log("QS is ", qs);
            if(typeof qs != "string" || qs.length == 0)
            {
                qs = '';
                $scope.query_params = {};
            }
            else
            $scope.query_params = parseQuery(qs)
            $window.dataLayer = $window.dataLayer || [];
            $window.dataLayer.push({
                "evolveID": appStorage.get('case_id')
                , "event": "dbsave"
                , "eventCallback": function (containerId) {
                    if (containerId === gtmcontainerid) {
					    $http.get("/api/v1/paid_search_tracking?" + qs)
                            .then(function (response) {
                                // console.log(response.data, "cookie gtm_first_visit : ", $cookies.get("gtm_first_visit"), " gtm_last_visit : ", $cookies.get("gtm_last_visit"));
                            }, function (error) {
                                // console.log("Error", error, "cookie gtm_first_visit : ", $cookies.get("gtm_first_visit"), " gtm_last_visit : ", $cookies.get("gtm_last_visit"));
                            })
                    }
                }
            });
        }
        var everQuoteCheckMark = function(check_box_id){
          setTimeout(function () {
            var t = document.getElementById(check_box_id)
            console.log("Check mark ", t);
            if (!isValid(t)){
              return
            }
            t.click()
          }, 500);
        }
        var everQuoteParseDob = function(dob){
          if (!isValid(dob)){
            return
          }
          var dob_arr = dob.split("-");
          console.log(dob_arr[1] + "-" + dob_arr[2] + "-" + dob_arr[0]);
          return dob_arr[1] + "-" + dob_arr[2] + "-" + dob_arr[0]
        }
        function numberWithCommas(x) {
            if(isValid(x)){
              console.log(x);
              console.log(x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
              return '$' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              }
        }
        var everQuoteParseGender = function(gender){
          console.log("Parse gender ", gender);
          if (!isValid(gender)){
            return
          }
          if (gender.toLowerCase() == "male" || gender.toLowerCase() == "m" ){
            var gender_id = "genderMaleLg"
          }
          else {
            var gender_id = "genderFemaleLg"
          }
          everQuoteCheckMark(gender_id);
        }
        var everQuoteParseTobacco = function(tobacco){
          console.log("Parse tobacco ", tobacco);
          if (!isValid(tobacco)){
            return
          }
          if (tobacco.toLowerCase() == "yes" || tobacco.toLowerCase() == "true"){
            var tobacco_id = "tobbacoYes"
          }
          else {
            var tobacco_id = "tobbacoNo"
          }
          everQuoteCheckMark(tobacco_id);
        }
        var everQuoteParseHeight = function(height){
          if (!isValid(height) || isNaN(height) || (height<58 || height>83)){
            console.log("Invalid height");
            return
          }
          console.log( parseInt(height/12)+ "\' " + (height%12) + "\"" );
          return parseInt(height/12)+ "\' " + (height%12) + "\""
        }
        var everQuoteParseAmount = function(amount){
          if (!isValid(amount))
            return
          var amount_with_commas = numberWithCommas(amount);
          if ($scope.amount_range.indexOf(amount_with_commas)>-1)
            return amount_with_commas
          else
            return ''
        }

        var parseEverQuoteParams = function(){
          console.log("Parse the query params (if any) for EverQuote customers");
          var qp = $window.location.search.replace('?','');
          if(typeof qp != "string" || qp.length == 0)
          {
              qp = '';
              $scope.eq_params = {};
          }
          else {
            $scope.eq_params = parseQuery(qp)
            console.log("Query params parsed: ", $scope.eq_params);
            $scope.quoteData.weight = parseInt($scope.eq_params.weight);
            $scope.quoteData.tenure = $scope.term_lengths.indexOf(parseInt($scope.eq_params.term_length))>-1?$scope.eq_params.term_length:'';
            $scope.quoteData.zip_code = $scope.eq_params.zip_code;
            $scope.zip_key_up(1, 0);
            $scope.quoteData.dob = everQuoteParseDob($scope.eq_params.birth_date);
            $scope.quoteData.height = everQuoteParseHeight($scope.eq_params.height);
            everQuoteParseGender($scope.eq_params.gender);
            everQuoteParseTobacco($scope.eq_params.tobacco_user);
            $scope.quoteData.amount = everQuoteParseAmount($scope.eq_params.coverage_amount);
            $scope.quoteData.first_name = $scope.eq_params.first_name
            $scope.quoteData.last_name = $scope.eq_params.last_name
            $scope.quoteData.mobile_number = isValid($scope.eq_params.phone)?$scope.eq_params.phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"):''
            $scope.quoteData.email_address = $scope.eq_params.email;
            $scope.quoteData.adhid = ($scope.eq_params.click_token)?$scope.eq_params.click_token:0;
            $scope.quoteData.isEverQuote = true;
          }

          if($scope.quoteData.isEverQuote && (($cookies.get("gtm_last_visit"))?$cookies.get("gtm_last_visit").toLowerCase().includes("e001"):(($cookies.get("gtm_first_visit"))?$cookies.get("gtm_first_visit").toLowerCase().includes("e001"):false)))
          {
            //ever-quote pixel
            var myEl = $document.find('body').eq(0); //angular.element( document.querySelector('#pixels'));
            myEl.append('<div id="p.adh8.com:pixel"><img style="display:none" width="0" height="0" src="https://p.everquote.com/f?mode=pixel&event=CFF33M9GMNWBQ11&adhid='+$scope.quoteData.adhid+'&psrc=7"/></div>');
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
    .filter('boolToString', function () {
        return function (input) {
            //console.log("input",input);
            if (input) {
                return 'true'
            } else {
                return 'false'
            }
        }
    })
    .filter('stringToBool', function () {
        return function (input) {
            //console.log("input2",input);
            if (input === 'true') {
                return true;
            } else if (input === 'false') {
                return false;
            }
        }
    })
    .filter('numToString', function () {
        return function (input) {
            //console.log("numToString",input);
            //console.log("converting to number",input.toString());
            return input.toString();
        }
    })
    .filter('stringToNum', function () {
        return function (input) {
            //console.log("input",input);
            return Number(input);
        }
    })

    .controller('callToApplyCtrl', function ($rootScope, $cookies, $scope, $http, $location, appStorage, setStepMovement) {
        // console.log("inside call to apply controller");
        $scope.goHome = function () {
            //window.location.href = '/'
            window.location.href = ('endpoint' in $rootScope) ? $rootScope.endpoint : "/";
        }
        var delete_cookies = function () {
            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k);
            });
            try {
                sessionStorage.clear();
            } catch (e) {
            }
            try {
                appStorage.clear();
            } catch (e) {
            }
        }
        setStepMovement.setStepMovement(3)
            .then(function (data) {
                delete_cookies();
            }, function (err) {
                delete_cookies();
            })
        $scope.$on('$locationChangeStart', function (event, next, current) {
            // Here you can take the control and call your own functions:
            // Prevent the browser default action (Going back):
            event.preventDefault();
        });
    })

    .controller('headerCtrl', function ($rootScope, $scope, $uibModal, appStorage, $location, $cookies,$window) {
        var modalInstance = "";
        var cookies = $cookies.getAll();
        function parseQuery(str)
        {
            if(typeof str != "string" || str.length == 0) return {};
            var s = str.split("&");
            var s_length = s.length;
            var bit, query = {}, first, second;
            for(var i = 0; i < s_length; i++)
                {
                bit = s[i].split("=");
                first = decodeURIComponent(bit[0]);
                if(first.length == 0) continue;
                second = decodeURIComponent(bit[1]);
                if(typeof query[first] == "undefined") query[first] = second;
                else if(query[first] instanceof Array) query[first].push(second);
                else query[first] = [query[first], second];
                }

            return query;
        }
        function select_tfn(utm_campaign){
          if (utm_campaign == 'term_affiliate_ma'){
            return '1-844-606-2759';
          }
          else if (utm_campaign == 'term_affiliate_ni'){
            return '1-844-606-2761'
          }
        return '1-888-984-3393';
        }
        var parse_tfn = function(){
          $window.dataLayer.push({
                "event": "cookies_loading"
              , "eventCallback": function () {
                  var gtm_first_visit = $cookies.get('gtm_first_visit');
                  var qs = $window.location.search.replace('?','')
                  query_params = parseQuery(qs)
                  if (gtm_first_visit !== undefined && gtm_first_visit !== null){
                    console.log("Parse TFN using cookies");
                    var gtm_cookies = {}
                    let gtm_arr = gtm_first_visit.split('&')
                    for (var i = 0; i < gtm_arr.length; i++) {
                      gtm_cookies[gtm_arr[i].split('=')[0]] = gtm_arr[i].split('=')[1]
                    }
                    var utm_campaign = gtm_cookies['campaign']
                    $scope.toll_free_number = select_tfn(utm_campaign)
                  }
                  else if (query_params['utm_campaign'] !== undefined){
                    console.log("Parse TFN using Query Param since cookie is not available");
                    var utm_campaign = query_params['utm_campaign']
                    $scope.toll_free_number = select_tfn(utm_campaign)
                  }
                  else {
                    console.log("Cookie or QP, both not available. Use default number");
                    $scope.toll_free_number = '1-888-984-3393';
                  }
                  $rootScope.$broadcast('tfn', $scope.toll_free_number)
                  appStorage.set('tfn', $scope.toll_free_number)
              }
          });
        }
        parse_tfn();
        $scope.openLegalStuff = function () {
            // console.log("opeing legal stuff");
            $rootScope.modalInstance = $uibModal.open({
                animation: true
                , templateUrl: 'smart-term/views/legalStuffQuote.html'
                , scope: $scope
            });
        }
        $scope.closestuff = function () {
            // console.log("closing")
            $scope.modalInstance.close();
        }

        // console.log("Received to authenticate");
        var case_id = "";
        var email = "";
        try {
            case_id = appStorage.get("case_id");
        } catch (e) {
            // console.log(e);
            // console.log("No required data found..");
            $location.path("/");
        }
    })
