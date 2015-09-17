// focus-if.js
/*
The MIT License (MIT)

Copyright (c) 2015 Jonathan Hieb
// AWolf: modified line 21 & 24 --> lint error focus already defined
 */
 // source from https://github.com/hiebj/ng-focus-if/blob/master/focusIf.js
(function() {
    'use strict';
    angular
        .module('utils.focus-if', [])
        .directive('focusIf', focusIf);

    function focusIf($timeout) {
        function link($scope, $element, $attrs) {
            var dom = $element[0];
            if ($attrs.focusIf) {
                $scope.$watch($attrs.focusIf, focus);
            } else {
                myfocus(true);
            }

            function myfocus(condition) {
                if (condition) {
                    $timeout(function() {
                        dom.focus();
                    }, $scope.$eval($attrs.focusDelay) || 0);
                }
            }
        }
        return {
            restrict: 'A',
            link: link
        };
    }
})();
// typeahead.module.js
(function() {
    'use strict';
    
    angular.module('pdTypeahead', [
        'pdMousetrapModule',
        'utils.focus-if',

        'pdTypeahead.defaultOptions', 
        'typeahead.tpls']);

})();
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
// defaultOptions.js
angular.module('pdTypeahead.defaultOptions', [])
    .constant('TYPEAHEAD_OPTIONS', {
        autofocus: true, //doAutofocus to input by default

});
// directive.js
/* @ngInject */

(function() {
	'use strict';

	angular.module('pdTypeahead')
		.directive('typeAhead', TypeaheadDirective);

	/* @ngInject */
	function TypeaheadDirective($document, $timeout, $compile, $interpolate, $filter, TYPEAHEAD_OPTIONS) {
		var directive = {
			restrict: 'A',
			scope : {
			},
			replace: false,
			controllerAs: 'typeAheadCtrl',
			controller: TypeaheadController,
			bindToController: {
				cinfo:'=datalist',
				selectModel: '=',
				visible: '=',
				doAutofocus: '@'
			},
			link: TypeaheadLink,
			//template: typeaheadTemplate // function so we can include ng-options --> tmpl. added in link fn.
			//templateUrl: 'typeahead.tmpl'
		};

		return directive;

		/* @ngInject */
		function TypeaheadController($scope, $attrs, pdTypeaheadSelectService) {
			var vm = this;
			console.log('autofocus', $attrs.doAutofocus || TYPEAHEAD_OPTIONS.autofocus);
			angular.extend(this, {
				checkAutofocus: checkAutofocus,
				close: closeTypeAhead,
				doAutofocus: $attrs.doAutofocus || TYPEAHEAD_OPTIONS.autofocus,
				filterData: filterData,
				hide: hide,
				ngOptions: {}, // defined in link function //$attrs.typeAhead,
				ngModel: $attrs.ngModel,
				selectedNameIndex: 0,
				sterm: '',
				typeAheadVisible: typeAheadVisible,
				updateSearchTerm: updateSearchTerm,
				updateSelection: updateSelection,
				visible: $attrs.visible || false,
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
				$scope.visible = $attrs.visible || vm.visible;
			}

			function checkAutofocus() {
				return vm.doAutofocus ? 'focus-if=""': '';
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
						vm.selectModel = name;
						
						//console.log('updated select', name);

						// UI Fix
						if(document.getElementsByClassName('active').length) {
							// 229 is the height of the container.
							console.log('ui fix', document.getElementsByClassName('active').length);
							document.getElementsByClassName('dropdown')[0].scrollTop = 
								document.getElementsByClassName('active')[0].offsetTop - 248;
						}
					} 
				});
			}

			function typeAheadVisible(visible) {
				vm.visible = vm.sterm.length > 0 && visible;
				console.log('updated visible', vm.visible);
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
				pdTypeaheadSelectService.setSelected(getIndex(sterm));
				pdTypeaheadSelectService.setMax(getMax());
				vm.selectedNameIndex = pdTypeaheadSelectService.getSelected();
			}

			// check if watch is really needed --> could be also done in in ng-change="filterData"
			$scope.$watch(function() {
					return vm.results;
				}, function(results) {
					var resLength = results.length;
					if ( !resLength ) {
						return; // not resolved yet
					}
					pdTypeaheadSelectService.setMax(resLength);
					vm.updateSelection(pdTypeaheadSelectService.getSelected());
					if ( resLength > 1 ) {
					 	vm.typeAheadVisible(true);
					 	if ( angular.isUndefined(vm.selectModel) || !vm.selectModel.selected ) {
					 		//console.log('test');
					 		vm.results[0].selected = true;
					 		// vm.selectModel = ;
					 	}
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

		function typeaheadTemplate(scope) { //element, attrs) {
            /*if (!angular.isDefined(attrs.defaultLabel)) {
                attrs.defaultLabel = '';
            }*/ // not used yet

            // template in js needed for interpolation of optional autofocus with focus-if
            // and later we'll probably need it for ng-options
            return '<div class="form-group col-sm-10" pd-mousetrap = "">'+
  				     '<input class="form-control" type="search" id="idSearch"'+ 
        			   'ng-model="typeAheadCtrl.sterm"'+
        			    $interpolate('{{typeAheadCtrl.checkAutofocus()}}')(scope) +
        			   'ng-change="typeAheadCtrl.filterData(typeAheadCtrl.sterm)"" placeholder="Enter Search Term"/>'+
      				 '<div class="nav dropdown">'+
      				 '<ul ng-show="typeAheadCtrl.visible"'+
      				   'class="dropdown-menu limitHeight">'+
					   '<li ng-repeat="data in typeAheadCtrl.results track by $index">'+
					   	 '<a href="#" ng-model="selectModel" ng-class="{active: data.selected}"'+
             		       'ng-click="typeAheadCtrl.updateSearchTerm(data)">'+
           				   '{{data.value}}'+
          	     	     '</a>'+
          	     	    '</li>'+
      				  '</ul>'+
      				  '</div>'+
    				'</div>';

/*return '<div class="selectBox selector">'+
'<span>{{ ngModel.name || "' + attrs.defaultLabel + '"}}</span>'+
'<select name="' + attrs.name + '" ng-model="' + attrs.ngModel + 
'" ng-options="' + attrs.optexp + '"' + ((attrs.required) ? ' required' : '') + 
'></select>'+
'</div>';*/
        }

		function TypeaheadLink(scope, element, attrs, typeaheadCtrl) {
			
			var tmpl = typeaheadTemplate(scope);

			element.replaceWith($compile(tmpl)(scope));

			scope.$watch(function() {
				return typeaheadCtrl.visible;
			}, function(value) {
				console.log(value);
				if ( value ) {
					//console.log('open dropdown');
					$('.dropdown').addClass('open');
				}
				else {
					$(element).find('.dropdown.open').removeClass('open');
				}
			});
			/*
			// refactor --> autofocus with directive added to template
			// refactor --> add pd-mousetrap to template (done)

			element[0].focus();
			element.attr('pd-mousetrap','');
			element.removeAttr('type-ahead'); //remove the attribute to avoid indefinite loop
			element.removeAttr('data-type-ahead'); // also remove the same attribute with data-prefix 
												   // in case users specify data-common-things in the html
			$document[0].getElementById('idSearch').focus(); // auto-focus to input field
			$compile(element)(scope); // update because of newly added directive
			*/
			// console.log('test', attrs.typeAhead);
			// attrs.$observe('typeAhead', function () {
			// 	console.log(attrs.typeAhead,scope.data,element);
			// 	typeaheadCtrl.ngOptions = attrs.typeAhead;
			// 	$timeout(function () {  // we need a timeout to compile after the dust has settled
			// 		$compile(element.contents())(scope); //recompile the HTML, make the updated content work.
			// 	},0);
   //        	});
		}
	}

})();
// selectService.js
(function() {
    'use strict';

    angular.module('pdTypeahead')
    .factory('pdTypeaheadSelectService', SelectService);

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
						pdTypeaheadSelectService.applySelection();
					}
				}, {
					keys: 'escape', 
					handler: function() { $rootScope.$broadcast('pd.typeahead:close'); }
				}
			];
		}
	}

})();
'use strict';

angular.module('typeahead.tpls', []).
run(['$templateCache', function($templateCache) {
}]);
