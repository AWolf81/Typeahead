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
					handler: function() { pdTypeAheadSelectService.moveDown(); }
				}, {
					keys: ['left', 'up'],
					handler: function() { pdTypeAheadSelectService.moveUp(); }
				}, {
					keys: 'enter',
					handler: function() {
						$rootScope.$broadcast('pd.typeahead:enter');
						pdTypeAheadSelectService.applySelection();
					}
				}, {
					keys: 'backspace', 
					handler: function() {
						$rootScope.$broadcast('pd.typeahead:backspace');
						pdTypeAheadSelectService.applySelection();
					}
				}, {
					keys: 'escape', 
					handler: function() { $rootScope.$broadcast('pd.typeahead:close'); }
				}
			];
		}
	}

})();