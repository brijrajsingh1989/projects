(function() {
	'use strict';

	/**
	 * @ngdoc function
	 * @name app.service:newdiService
	 * @description
	 * # newdiService
	 * Service of the app
	 */

  	angular
		.module('legalGeneralApp')

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
		.factory('setStepMovement', function($q,$http){
			return {
				setStepMovement: function(step_id){
					var response = $q.defer();
					$http.post('/api/v1/step_movement',{'step_id':step_id})
					.then(function(data){
						response.resolve({status:"success"});
					},
				function(err){
					response.resolve({status:"failed"});
				});
				return response.promise;
				}
			}
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
		.factory('stateList', function ($cookies) {
				return {
					verify: function(state_short){
						try {
							var present = false
							var state_list = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
							for (var i = 0; i < state_list.length; i++) {
								if (state_list[i] == state_short){
									present = true
								}
							}
							return present
						} catch (e) {
							console.log("Error. Return true", e);
							return true
						}
					}
				};
		})
})();
