// directive.js
// keybinding with mousetrap js
(function() {

	'use strict';

	angular.module('pdMousetrapModule', [])
		.directive('pdMousetrap', MousetrapDirective);

	/* @ngInject */
	function MousetrapDirective($rootScope, pdTypeaheadSelectService) {
		var directive = {
			restrict: 'A',
		};

		activate();

		return directive;

		//////////////////////

		function activate() {
			var keyBindings = getMousetrapBindings();
			angular.forEach(keyBindings, function(binding) {
				Mousetrap.bind(binding.keys, binding.handler);
			});
			Mousetrap.stopCallback = stopCallback;
		}
		
		function stopCallback() {
			return false; // required to trigger mousetrap even with focused input elements
		}

		function getMousetrapBindings() {
			return [
				{
					keys: ['right', 'down'],
					handler: function() { pdTypeaheadSelectService.moveDown(); }
				}, {
					keys: ['left', 'up'],
					handler: function() { pdTypeaheadSelectService.moveUp(); }
				}, {
					keys: 'enter',
					handler: function() {
						$rootScope.$broadcast('pd.typeahead:enter');
						pdTypeaheadSelectService.applySelection();
					}
				}, {
					keys: 'backspace', 
					handler: function() {
						$rootScope.$broadcast('pd.typeahead:backspace');
					}
				}, {
					keys: 'escape', 
					handler: function() { $rootScope.$broadcast('pd.typeahead:close'); }
				}
			];
		}
	}

})();