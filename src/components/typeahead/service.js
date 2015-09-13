// service.js
// todo! single purpose per file --> move SelectService to separate file
(function() {
	'use strict';

	angular.module('pdTypeAhead')
	.factory('pdTypeAheadService', TypeaheadService)
	.factory('pdTypeAheadSelectService', SelectService);

	/* @ngInject */
	function TypeaheadService($http, $q, DATA_SERVICE) {
		var factory = {
				getData: getData
		};
		
		return factory;

		function getData() {
			var def = $q.defer();
			$http.get(DATA_SERVICE)
				.success(function(res){
					var out = res.map(function(value, index){
						// console.log(value, index);
						return {
							selected: false,
							value: value
						};
					});
					def.resolve(out);
				})
				.error(function(err){
					def.reject(err);
				});
			return def.promise;
		}
	}
	
	/* @ngInject */
	function SelectService($rootScope) {
		var selectedIndex = 0,
			maxIndex = 0,
			factory = {
				setSelected: function(index) {
					selectedIndex = index;
				},
				setMax: function(max) {
					maxIndex = max;
				},
				getSelected: function() {
					return selectedIndex;
				},
				moveUp: function() {
					if ( selectedIndex > 0 ) {
						selectedIndex--; 
					}
					$rootScope.$broadcast('pd.typeahead:updatedIndex', selectedIndex);
				},
				moveDown: function() {
					if ( selectedIndex < maxIndex -1 ){
						selectedIndex++;
					}
					$rootScope.$broadcast('pd.typeahead:updatedIndex', selectedIndex);

				},
				applySelection: function() {
					$rootScope.$broadcast('pd.typeahead:applySelection', selectedIndex);
				}
			};

		return factory;
	}

})();