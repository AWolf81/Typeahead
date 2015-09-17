(function() {
	'use strict';

	angular.module('pdTypeahead')
	.factory('pdTypeaheadDataService', TypeaheadService);

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

})();