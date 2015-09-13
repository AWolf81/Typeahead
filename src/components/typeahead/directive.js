// directive.js
/* @ngInject */

(function() {
	'use strict';

	angular.module('pdTypeAhead', ['pdMousetrap']) //, 'typeahead.tpls'])
		.directive('typeAhead', TypeaheadDirective);

	/* @ngInject */
	function TypeaheadDirective($document, $compile, $filter) {
		var directive = {
			restrict: 'A',
			scope : {
				cinfo:'=datalist',
			},
			replace: false,
			controllerAs: 'typeAheadCtrl',
			controller: TypeaheadController,
			bindToController: true,
			link: TypeaheadLink,
			templateUrl:'src/components/typeahead/typeahead.tmpl'
		};

		return directive;

		/* @ngInject */
		function TypeaheadController($scope, $attrs, pdTypeAheadSelectService) {
			var vm = this;

			angular.extend(this, {
				close: closeTypeAhead,
				filterData: filterData,
				hide: hide,
				selectedNameIndex: 0,
				sterm: '',
				typeAheadVisible: typeAheadVisible,
				updateSearchTerm: updateSearchTerm,
				updateSelection: updateSelection,
				visible: true
			});

			activate(); //initialize typeahead ctrl.

			// helper functions getIndex & getMax
			function getIndex(name) {
				return vm.results ? vm.results.indexOf(name): 0;
			}
		
			function getMax() {
				return vm.results.length;
			}

			function addEvents(events) {
				angular.forEach(events, function(event) {
					$scope.$on(event.name, event.handler);
				});
			}


			function activate() {
				var events = getScopeEvents();
				vm.filterData('');
				addEvents(events);
			}

			function hide() {
				vm.typeAheadVisible(false);
			}

			function updateSelection(selected) {
				var activeName;
				vm.selectedNameIndex = selected;
				angular.forEach(vm.results, function(name, index) {
					name.selected = false;
					if (index === selected) {
						name.selected = true;

						// UI Fix
						if(document.getElementsByClassName('active').length) {
							// 229 is the height of the container.
							document.getElementsByClassName('dropdown')[0].scrollTop = 
								document.getElementsByClassName('active')[0].offsetTop - 248;
						}
					} 
				});
			}

			function typeAheadVisible(visible) {
				vm.visible = vm.sterm.length > 0 && visible;
			}

			function updateSearchTerm(selName) {
				vm.sterm = selName.value;
				vm.typeAheadVisible(false);
			}

			function closeTypeAhead() {
				vm.hide();
			}

			function filterData(sterm) {
				vm.results = $filter('filter')(vm.cinfo, sterm);//cinfo| filter:sterm track by $index
				vm.results = $filter('limitTo')(vm.results || [], 100); // limit to 100 to keep it responsive.
				pdTypeAheadSelectService.setSelected(getIndex(sterm));
				pdTypeAheadSelectService.setMax(getMax());
				vm.selectedNameIndex = pdTypeAheadSelectService.getSelected();
			}

			$scope.$watch(function() {
					return vm.results;
				}, function(results) {
					var resLength = results.length;
					if ( !resLength ) {
						return; // not resolved yet
					}
					pdTypeAheadSelectService.setMax(resLength);
					vm.updateSelection(pdTypeAheadSelectService.getSelected());
					if ( resLength > 1 ) {
					 	vm.typeAheadVisible(true);
					}
			});

			// events bound to $scope.$on(name, handler) in activate
			function getScopeEvents() {
				return [
					{
						name: 'pd.typeahead:enter',
						handler: function (event, selected) {
							vm.typeAheadVisible(false);
						}
					},
					{
						name: 'pd.typeahead:backspace',
						handler: function (event, selected) {
				  			if(vm.sterm.length > 1) {
								vm.typeAheadVisible(true);
							} else {
								vm.typeAheadVisible(false);
							}
						}
					},
					{
						name: 'pd.typeahead:updatedIndex',
						handler: function(event, selected) {
							vm.updateSelection(selected);

							$scope.$apply();
						}
					}, 
					{
						name: 'pd.typeahead:close',
						handler: function() {
							vm.hide();
							$scope.$apply();
						}
					},
					{
						name: 'pd.typeahead:applySelection',
						handler: function(event, selected) {
							if ( !vm.results[selected] ) {
								return; //nothing selected show type ahead
							}

							vm.updateSearchTerm(vm.results[selected]);

							$scope.$apply();
						} 
					}
				];
			}
		}

		function TypeaheadLink(scope, element, attr) {
			element[0].focus();
			element.attr('pd-mousetrap','');
			element.removeAttr('type-ahead'); //remove the attribute to avoid indefinite loop
			element.removeAttr('data-type-ahead'); // also remove the same attribute with data-prefix 
												   // in case users specify data-common-things in the html
			$document[0].getElementById('idSearch').focus(); // auto-focus to input field
			$compile(element)(scope); // update because of newly added directive
		}
	}

})();