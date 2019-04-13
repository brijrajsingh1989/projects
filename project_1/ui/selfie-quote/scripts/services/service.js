(function() {
	'use strict';

	/**
	 * @ngdoc function
	 * @name app.service:newdiService
	 * @description
	 * # newdiService
	 * Service of the app
	 */


	 /*

	 localStorageService.set('localStorageKey','Add this!');
	 // Read that value back
	 var value = localStorageService.get('localStorageKey');
	 // To remove a local storage
	 localStorageService.remove('localStorageKey');
	 // Removes all local storage
	 localStorageService.clearAll();

	 */


  	angular
		.module('selfieapp')

		.factory('dataCache',function($cacheFactory){
			return $cacheFactory('dataCache');
		})
		.factory('quoteDataInfo',function(localStorageService, $crypto, $cookies){
				return {
				  getQuoteDataInfo: function () {
							if(localStorageService.get('quoteDataInfo')){
								return $crypto.decrypt(localStorageService.get('quoteDataInfo'),$cookies.get("user_session"));
							}
							try{
								return $crypto.decrypt(sessionStorage.getItem('quoteDataInfo'),$cookies.get("user_session"));
							}catch(e){
							}
				  },
				  setQuoteDataInfo: function (quoteDataInfo)
					{
						try{
							localStorageService.set('quoteDataInfo', $crypto.encrypt(JSON.stringify(quoteDataInfo),$cookies.get("user_session")));
						}catch(e){

						}
						try{
							sessionStorage.setItem('quoteDataInfo',$crypto.encrypt(JSON.stringify(quoteDataInfo),$cookies.get("user_session")));
						}catch(e){
						}

				  }
				};
		})
		.factory('docuSignService', function($rootScope){
			return{
				getDocusignURL: function () {
						return $rootScope.ds_url;
				},
				setDocusignURL: function (url)
				{
						$rootScope.ds_url = url;
				}
			}
		})
		.factory('insert_step_movement', function($http, $q){
			return{
				insertStepMovement: function (step_id) {
					var response = $q.defer();
					$http.post("/api/v1/step_movement",{'step_id':step_id})
					 .then(function(data){
						 response.resolve({status:"success"});
					 },function(err){
						 response.resolve({status:"Failed"});
					 });
					 return response.promise;
				}
			}
		})
		.factory('userPersonalInfo',function($cookies,$window, configuration, localStorageService, $crypto){
				return {
				  getPersonalInfo: function () {
						if(localStorageService.get('personalInfo')){
							return $crypto.decrypt(localStorageService.get('personalInfo'),$cookies.get("user_session"));
						}
						try{
							return $crypto.decrypt(sessionStorage.getItem('personalInfo'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}
				  },
				  setPersonalInfo: function (personalInfo)
					{
						try{
							localStorageService.set('personalInfo', $crypto.encrypt(JSON.stringify(personalInfo),$cookies.get("user_session")));
						}catch(e){

						}
						try{
							sessionStorage.setItem('personalInfo',$crypto.encrypt(JSON.stringify(personalInfo),$cookies.get("user_session")));
						}catch(e){
						}
				  },
					getCurrentUserId:function()
					{
						if(localStorageService.get('userId')){
							return $crypto.decrypt(localStorageService.get('userId'),$cookies.get("user_session"));
						}
						try{
							return $crypto.decrypt(sessionStorage.getItem('userId'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}
					 	//return (sessionStorage.getItem('userId')) ? sessionStorage.getItem('userId') : 0 ;
					},
					setCurrentUserId:function(userId)
					{
						try{
							localStorageService.set('userId', $crypto.encrypt(JSON.stringify(userId),$cookies.get("user_session")));
						}catch(e){

						}
						try{
							sessionStorage.setItem('userId',$crypto.encrypt(JSON.stringify(userId),$cookies.get("user_session")));
						}
						catch(e){
						}
					}
				};
		})
		.factory('quoteRespList',function($cookies, localStorageService, $crypto){
				return {
				  getQuoteResp: function () {

						if(localStorageService.get('quoteRespList')){
							return $crypto.decrypt(localStorageService.get('quoteRespList'),$cookies.get("user_session"));
						}
						try{
							return $crypto.decrypt(sessionStorage.getItem('quoteRespList'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}
			      //return sessionStorage.getItem('quoteRespList');
				  },
				  setQuoteResp: function (quoteRespList)
					{
						try{
							localStorageService.set('quoteRespList', $crypto.encrypt(JSON.stringify(quoteRespList),$cookies.get("user_session")));
						}
						catch(e){
						}
						try{
							sessionStorage.setItem('quoteRespList',$crypto.encrypt(JSON.stringify(quoteRespList),$cookies.get("user_session")));
						}
						catch(e){
						}
				  }
				};
		})
		.factory('quoteApiReq',function($cookies, localStorageService, $crypto){
				return {
				  getQuoteReq: function () {
						if(localStorageService.get('quoteApiReq')){
							return $crypto.decrypt(localStorageService.get('quoteApiReq'),$cookies.get("user_session"));
						}
						try{
							return $crypto.decrypt(sessionStorage.getItem('quoteApiReq'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}

				  },
				  setQuoteReq: function (quoteApiReq)
					{
						try{
							localStorageService.set('quoteApiReq',$crypto.encrypt(JSON.stringify(quoteApiReq),$cookies.get("user_session")));
						}
						catch(e){
						}
						try{
							sessionStorage.setItem('quoteApiReq',$crypto.encrypt(JSON.stringify(quoteApiReq),$cookies.get("user_session")));
						}
						catch(e){
						}

				  }
				};
		})
		.factory('useTermsInfo',function($cookies, localStorageService, $crypto){
				return {
				  getUseTermsInfo: function () {
						if(localStorageService.get('useTermsInfo')){
							return $crypto.decrypt(localStorageService.get('useTermsInfo'),$cookies.get("user_session"));
						}
						try{
							return $crypto.decrypt(sessionStorage.getItem('useTermsInfo'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}
				  },
				  setUseTermsInfo: function (useTermsInfo)
					{
						try{
							localStorageService.set('useTermsInfo',$crypto.encrypt(JSON.stringify(useTermsInfo),$cookies.get("user_session")));
						}
						catch(e){
						}

						try{
							sessionStorage.setItem('useTermsInfo',$crypto.encrypt(JSON.stringify(useTermsInfo),$cookies.get("user_session")));
						}
						catch(e){
						}
				  }
				};
		})

		.factory('moreUserInfoService',function($cookies,configuration, localStorageService, $crypto){
				return {
				  getMoreUserInfo: function () {
						if(localStorageService.get('moreUserInfo')){
							return $crypto.decrypt(localStorageService.get('moreUserInfo'),$cookies.get("user_session"));
						}
						try{
							return $crypto.decrypt(sessionStorage.getItem('moreUserInfo'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}
				  },
				  setMoreUserInfo: function (moreUserInfo)
					{
							var dtToday = new Date();
							try{
								localStorageService.set('moreUserInfo',$crypto.encrypt(JSON.stringify(moreUserInfo),$cookies.get("user_session")));
							}
							catch(e){
							}

							try{
								sessionStorage.setItem('moreUserInfo',$crypto.encrypt(JSON.stringify(moreUserInfo),$cookies.get("user_session")));
							}
							catch(e){
							}
				  }
				};
		})

		.factory('beneficiaryInfo',function($cookies,configuration, localStorageService, $crypto){
				return {
				  getBeneficiaryInfo: function () {
						if(localStorageService.get('beneficiaryInfo')){
							return $crypto.decrypt(localStorageService.get('beneficiaryInfo'),$cookies.get("user_session"));
						}
						try{
							return $crypto.decrypt(sessionStorage.getItem('beneficiaryInfo'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}
				  },
				  setBeneficiaryInfo: function (beneficiaryInfo)
					{
						try{
							localStorageService.set('beneficiaryInfo',$crypto.encrypt(JSON.stringify(beneficiaryInfo),$cookies.get("user_session")));
						}
						catch(e){
						}

						try{
							sessionStorage.setItem('beneficiaryInfo',$crypto.encrypt(JSON.stringify(beneficiaryInfo),$cookies.get("user_session")));
						}
						catch(e){
						}
				  }
				};
		})
		.factory('youeHealthInfo',function($cookies, $http, configuration, localStorageService, $crypto){
				return {
				  getyoueHealthInfo: function () {
						if(localStorageService.get('youeHealthInfo')){
							return $crypto.decrypt(localStorageService.get('youeHealthInfo'),$cookies.get("user_session"));
						}
						try{
							return $crypto.decrypt(sessionStorage.getItem('youeHealthInfo'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}
				  },
				  setyoueHealthInfo: function (youeHealthInfo)
					{
						try{
							localStorageService.set('youeHealthInfo',$crypto.encrypt(JSON.stringify(youeHealthInfo),$cookies.get("user_session")));
						}
						catch(e){
						}

						try{
							sessionStorage.setItem('youeHealthInfo',$crypto.encrypt(JSON.stringify(youeHealthInfo),$cookies.get("user_session")));
						}
						catch(e){
						}
				  }
				};
		})
		.factory('kba_questions_visit',function(configuration, localStorageService, $cookies, $crypto){
				return {
				  getKBAQuestionVisitVar: function () {
						if(localStorageService.get('kba_questions_visit')){
							return $crypto.decrypt(localStorageService.get('kba_questions_visit'),$cookies.get("user_session"));
						}
						try{
							return  $crypto.decrypt(sessionStorage.getItem('kba_questions_visit'),$cookies.get("user_session"));
						}catch(e){
							return "";
						}
				  },
				  setKBAQuestionVisitVar: function (kba_questions_visit)
					{
						try{
							localStorageService.set('kba_questions_visit',$crypto.encrypt(JSON.stringify(kba_questions_visit),$cookies.get("user_session")));
						}catch(e){

						}
						try{
							sessionStorage.setItem('kba_questions_visit',$crypto.encrypt(JSON.stringify(kba_questions_visit),$cookies.get("user_session")));
						}
						catch(e){
						}
				  }
				};
		})
		.factory('appStorage', function(localStorageService, $rootScope, $cookies, $crypto){
			return{
				set: function (key, value) {
					try{
						localStorageService.set(key,$crypto.encrypt(value,($cookies.get("user_session"))));
					}catch(e){
					}
					try{
						sessionStorage.setItem(key,$crypto.encrypt(value,($cookies.get("user_session"))));
					}catch(e1){
					}
				},
				get: function(key){

					try {
						if(localStorageService.get(key)){
							return $crypto.decrypt(localStorageService.get(key),($cookies.get("user_session")));
						}
					} catch (e) {
					}
					try{
						if(sessionStorage.getItem(key)){
							return $crypto.decrypt(sessionStorage.getItem(key),($cookies.get("user_session")));
						}
						else{
							return null;
						}
					}catch(e){
						return null;
					}
				},
				clear: function(){
					$rootScope = {};
				}
			}
		})
		.factory('stateJson',function($cookies){
					return {
						  "ALABAMA": {
						    "rule": "^[0-9]{1,7}$",
						    "description": [
						      "1-7 Numeric"
						    ]
						  },
						  "ALASKA": {
						    "rule": "^[0-9]{1,7}$",
						    "description": [
						      "1-7 Numbers"
						    ]
						  },
						  "ARIZONA": {
						    "rule": "(^[A-Z]{1}[0-9]{1,8}$)|(^[A-Z]{2}[0-9]{2,5}$)|(^[0-9]{9}$)",
						    "description": [
						      "1 Alpha + 1-8 Numeric",
						      "2 Alpha + 2-5 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "ARKANSAS": {
						    "rule": "^[0-9]{4,9}$",
						    "description": [
						      "4-9 Numeric"
						    ]
						  },
						  "CALIFORNIA": {
						    "rule": "^[A-Z]{1}[0-9]{7}$",
						    "description": [
						      "1 Alpha + 7 Numeric"
						    ]
						  },
						  "COLORADO": {
						    "rule": "(^[0-9]{9}$)|(^[A-Z]{1}[0-9]{3,6}$)|(^[A-Z]{2}[0-9]{2,5}$)",
						    "description": [
						      "9 Numeric",
						      "1 Alpha + 3-6 Numeric",
						      "2 Alpha + 2-5 Numeric"
						    ]
						  },
						  "CONNECTICUT": {
						    "rule": "^[0-9]{9}$",
						    "description": [
						      "9 Numeric"
						    ]
						  },
						  "DELAWARE": {
						    "rule": "^[0-9]{1,7}$",
						    "description": [
						      "1-7 Numeric"
						    ]
						  },
						  "DC WASHINGTON": {
						    "rule": "(^[0-9]{7}$)|(^[0-9]{9}$)",
						    "description": [
						      "7 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "FLORIDA": {
						    "rule": "^[A-Z]{1}[0-9]{12}$",
						    "description": [
						      "1 Alpha + 12 Numeric"
						    ]
						  },
						  "GEORGIA": {
						    "rule": "^[0-9]{7,9}$",
						    "description": [
						      "7-9 Numeric"
						    ]
						  },
						  "GU" : {
						    "rule": "^[A-Z]{1}[0-9]{14}$",
						    "description": [
						      "1 Alpha + 14 Numeric"
						    ]
						  },
						  "HAWAII": {
						    "rule": "(^[A-Z]{1}[0-9]{8}$)|(^[0-9]{9}$)",
						    "description": [
						      "1 Alpha + 8 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "IDAHO": {
						    "rule": "(^[A-Z]{2}[0-9]{6}[A-Z]{1}$)|(^[0-9]{9}$)",
						    "description": [
						      "2 Alpha + 6 Numeric + 1 Alpha",
						      "9 Numeric"
						    ]
						  },
						  "ILLINOIS": {
						    "rule": "^[A-Z]{1}[0-9]{11,12}$",
						    "description": [
						      "1 Alpha + 11-12 Numeric"
						    ]
						  },
						  "INDIANA": {
						    "rule": "(^[A-Z]{1}[0-9]{9}$)|(^[0-9]{9,10}$)",
						    "description": [
						      "1 Alpha + 9 Numeric",
						      "9-10 Numeric"
						    ]
						  },
						  "IOWA": {
						    "rule": "^([0-9]{9}|([0-9]{3}[A-Z]{2}[0-9]{4}))$",
						    "description": [
						      "9 Numeric",
						      "3 Numeric + 2 Alpha + 4 Numeric"
						    ]
						  },
						  "KANSAS": {
						    "rule": "(^([A-Z]{1}[0-9]{1}){2}[A-Z]{1}$)|(^[A-Z]{1}[0-9]{8}$)|(^[0-9]{9}$)",
						    "description": [
						      "1 Alpha + 1 Numeric + 1 Alpha + 1 Numeric + 1 Alpha",
						      "1 Alpha + 8 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "KENTUCKY": {
						    "rule": "(^[A_Z]{1}[0-9]{8,9}$)|(^[0-9]{9}$)",
						    "description": [
						      "1 Alpha + 8-9 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "LOUISIANA": {
						    "rule": "^[0-9]{1,9}$",
						    "description": [
						      "1-9 Numeric"
						    ]
						  },
						  "MAINE": {
						    "rule": "(^[0-9]{7,8}$)|(^[0-9]{7}[A-Z]{1}$)",
						    "description": [
						      "7-8 Numeric",
						      "7 Numeric + 1 Alpha"
						    ]
						  },
						  "MARYLAND": {
						    "rule": "^[A-Z]{1}[0-9]{12}$",
						    "description": [
						      "1Alpha+12Numeric"
						    ]
						  },
						  "MASSACHUSETTS": {
						    "rule": "(^[A-Z]{1}[0-9]{8}$)|(^[0-9]{9}$)",
						    "description": [
						      "1 Alpha + 8 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "MICHIGAN": {
						    "rule": "(^[A-Z]{1}[0-9]{10}$)|(^[A-Z]{1}[0-9]{12}$)",
						    "description": [
						      "1 Alpha + 10 Numeric",
						      "1 Alpha + 12 Numeric"
						    ]
						  },
						  "MINNESOTA": {
						    "rule": "^[A-Z]{1}[0-9]{12}$",
						    "description": [
						      "1 Alpha + 12 Numeric"
						    ]
						  },
						  "MISSISSIPPI": {
						    "rule": "^[0-9]{9}$",
						    "description": [
						      "9 Numeric"
						    ]
						  },
						  "MISSOURI": {
						    "rule": "(^[A-Z]{1}[0-9]{5,9}$)|(^[A-Z]{1}[0-9]{6}[R]{1}$)|(^[0-9]{8}[A-Z]{2}$)|(^[0-9]{9}[A-Z]{1}$)|(^[0-9]{9}$)",
						    "description": [
						      "1 Alpha + 5-9 Numeric",
						      "1 Alpha + 6 Numeric + 'R'",
						      "8 Numeric + 2 Alpha",
						      "9 Numeric + 1 Alpha",
						      "9 Numeric"
						    ]
						  },
						  "MONTANA": {
						    "rule": "(^[A-Z]{1}[0-9]{8}$)|(^[0-9]{13}$)|(^[0-9]{9}$)|(^[0-9]{14}$)",
						    "description": [
						      "1 Alpha + 8 Numeric",
						      "13 Numeric",
						      "9 Numeric",
						      "14 Numeric"
						    ]
						  },
						  "NEBRASKA": {
						    "rule": "^[0-9]{1,7}$",
						    "description": [
						      "1-7 Numeric"
						    ]
						  },
						  "NEVADA": {
						    "rule": "(^[0-9]{9,10}$)|(^[0-9]{12}$)|(^[X]{1}[0-9]{8}$)",
						    "description": [
						      "9 Numeric",
						      "10 Numeric",
						      "12 Numeric",
						      "'X' + 8 Numeric"
						    ]
						  },
						  "NEW HAMPSHIRE": {
						    "rule": "^[0-9]{2}[A-Z]{3}[0-9]{5}$",
						    "description": [
						      "2 Numeric + 3 Alpha + 5 Numeric"
						    ]
						  },
						  "NEW JERSEY": {
						    "rule": "^[A-Z]{1}[0-9]{14}$",
						    "description": [
						      "1 Alpha + 14 Numeric"
						    ]
						  },
						  "NEW MEXICO": {
						    "rule": "^[0-9]{8,9}$",
						    "description": [
						      "8 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "NEW YORK": {
						    "rule": "(^[A-Z]{1}[0-9]{7}$)|(^[A-Z]{1}[0-9]{18}$)|(^[0-9]{8}$)|(^[0-9]{9}$)|(^[0-9]{16}$)|(^[A-Z]{8}$)",
						    "description": [
						      "1 Alpha + 7 Numeric",
						      "1 Alpha + 18 Numeric",
						      "8 Numeric",
						      "9 Numeric",
						      "16 Numeric",
						      "8 Alpha"
						    ]
						  },
						  "NORTH CAROLINA": {
						    "rule": "^[0-9]{1,12}$",
						    "description": [
						      "1-12 Numeric"
						    ]
						  },
						  "NORTH DAKOTA": {
						    "rule": "(^[A-Z]{3}[0-9]{6}$)|(^[0-9]{9}$)",
						    "description": [
						      "3 Alpha + 6 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "OHIO": {
						    "rule": "(^[A-Z]{1}[0-9]{4,8}$)|(^[A-Z]{2}[0-9]{3,7}$)|(^[0-9]{8}$)",
						    "description": [
						      "1 Alpha + 4-8 Numeric",
						      "2 Alpha + 3-7 Numeric",
						      "8 Numeric"
						    ]
						  },
						  "OKLAHOMA": {
						    "rule": "(^[A-Z]{1}[0-9]{9}$)|(^[0-9]{9}$)",
						    "description": [
						      "1 Alpha + 9 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "OREGON": {
						    "rule": "^[0-9]{1,9}$",
						    "description": [
						      "1-9 Numeric"
						    ]
						  },
						  "PENNSYLVANIA": {
						    "rule": "^[0-9]{8}$",
						    "description": [
						      "8 Numeric"
						    ]
						  },
						  "RHODE ISLAND": {
						    "rule": "^([0-9]{7}$)|(^[A-Z]{1}[0-9]{6}$)",
						    "description": [
						      "7 Numeric",
						      "1 Alpha + 6 Numeric"
						    ]
						  },
						  "SOUTH CAROLINA": {
						    "rule": "^[0-9]{5,11}$",
						    "description": [
						      "5-11 Numeric"
						    ]
						  },
						  "SOUTH DAKOTA": {
						    "rule": "(^[0-9]{6,10}$)|(^[0-9]{12}$)",
						    "description": [
						      "6-10 Numeric",
						      "12 Numeric"
						    ]
						  },
						  "TENNESSEE": {
						    "rule": "^[0-9]{7,9}$",
						    "description": [
						      "7-9 Numeric"
						    ]
						  },
						  "TEXAS": {
						    "rule": "^[0-9]{7,8}$",
						    "description": [
						      "7-8 Numeric"
						    ]
						  },
						  "UTAH": {
						    "rule": "^[0-9]{4,10}$",
						    "description": [
						      "4-10 Numeric"
						    ]
						  },
						  "VERMONT": {
						    "rule": "(^[0-9]{8}$)|(^[0-9]{7}[A]$)",
						    "description": [
						      "8 Numeric",
						      "7 Numeric + 'A'"
						    ]
						  },
						  "VIRGINIA": {
						    "rule": "(^[A-Z]{1}[0-9]{8,11}$)|(^[0-9]{9}$)",
						    "description": [
						      "1 Alpha + 8 Numeric",
						      "1 Alpha + 9 Numeric",
						      "1 Alpha + 10 Numeric",
						      "1 Alpha + 11 Numeric",
						      "9 Numeric"
						    ]
						  },
						  "WASHINGTON": {
						    "rule": "^(?=.{12}$)[A-Z]{1,7}[A-Z0-9\\*]{4,11}$",
						    "description": [
						      "1-7 Alpha + any combination of Alpha, Numeric, and * for a total of 12 characters"
						    ]
						  },
						  "WEST VIRGINIA": {
						    "rule": "(^[0-9]{7}$)|(^[A-Z]{1,2}[0-9]{5,6}$)",
						    "description": [
						      "7 Numeric",
						      "1-2 Alpha + 5-6 Numeric"
						    ]
						  },
						  "WISCONSIN": {
						    "rule": "^[A-Z]{1}[0-9]{13}$",
						    "description": [
						      "1 Alpha + 13 Numeric"
						    ]
						  },
						  "WYOMING": {
						    "rule": "^[0-9]{9,10}$",
						    "description": [
						      "9-10 Numeric"
						    ]
						  }

				};
		})
})();
