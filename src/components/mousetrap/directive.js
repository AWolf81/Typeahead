// directive.js
// keybinding with mousetrap js
(function() {

	'use strict';

	angular.module('pdMousetrap', [])
		.directive('pdMousetrap', MousetrapDirective);

	/* @ngInject */
	function MousetrapDirective($rootScope, pdTypeAheadSelectService) {
		var directive = {
			restrict: 'A',
			link: MousetrapBinding
		};
		return directive;

		//////////////////////

		function MousetrapBinding(scope, iElement, iAttrs) {

			Mousetrap
				.bind(['right', 'down'], function() {
					pdTypeAheadSelectService.moveDown();
				})
				.bind(['left', 'up'], function() {
					pdTypeAheadSelectService.moveUp();
				})
				.bind('enter', function() {
					$rootScope.$broadcast('pd.typeahead:enter');
					pdTypeAheadSelectService.applySelection();
				})
				.bind('backspace', function() {
					$rootScope.$broadcast('pd.typeahead:backspace');
					pdTypeAheadSelectService.applySelection();
				})
				.bind('escape', function() {
					$rootScope.$broadcast('pd.typeahead:close');
				})
				.stopCallback = function () {
     				return false; // required to trigger mousetrap even with focused input elements
			};
		}
	}

})();