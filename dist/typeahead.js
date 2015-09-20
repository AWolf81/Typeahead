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
// utils.js

angular.module('utils', [])
.factory('utility', UtilityFactory);

function UtilityFactory() {

    return {
        callerFunction: callerFunction
    };
}

/* callerFuncion is useful for debugging
   it shows the caller of the function
   e.g. 
   function main() {
     hello();
   }
   function hello() {
     console.log(utility.callerFunction());  //logs function main()
   }

   Use it if you're not sure who called your function.
*/
function callerFunction() {
    return callerFunction.caller.caller;
}
// typeahead.module.js
(function() {
    'use strict';
    
    angular.module('pdTypeahead', [
        'pdMousetrapModule',
        'utils', //utility methods
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
    //'use strict';

    angular.module('pdTypeahead')
        .directive('typeAhead', TypeaheadDirective);

    /* @ngInject */
    function TypeaheadDirective($parse, $compile, $interpolate, $filter, utility, TYPEAHEAD_OPTIONS) {
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
        function TypeaheadController($scope, $attrs, pdTypeaheadSelectService, utility) {
            var vm = this;
            console.log('autofocus', $attrs.doAutofocus || TYPEAHEAD_OPTIONS.autofocus);
            angular.extend(this, {
                checkAutofocus: checkAutofocus,
                close: closeTypeAhead,
                doAutofocus: $attrs.doAutofocus || TYPEAHEAD_OPTIONS.autofocus,
                filterData: filterData,
                ngOptions: {}, // defined in link function //$attrs.typeAhead,
                ngModel: $attrs.ngModel,
                selectedNameIndex: 0,
                sterm: '',
                setVisible: setVisible,
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
                vm.visible = $attrs.visible || false; // @todo: add false to defaultOptions later
            }

            function checkAutofocus() {
                return vm.doAutofocus ? 'focus-if=""': '';
            }

            function hide() {
                vm.setVisible(false);
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

                        document.getElementsByClassName('dropdown-menu')[0].scrollTop = 
                            document.getElementsByClassName('active')[0].offsetTop - 248;
                    } 
                });
            }

            function setVisible(visible) {
                vm.visible = visible;
                console.log('setVisible caller = ', utility.callerFunction());
                console.log('updated visible', vm.visible, visible);
            }

            function updateSearchTerm(selName) {
                vm.sterm = selName.value;
                //vm.typeAheadVisible(false);
            }

            function closeTypeAhead() {
                hide();
            }

            function filterData(sterm) {
                vm.results = $filter('filter')(vm.cinfo, sterm);//cinfo| filter:sterm track by $index
                vm.results = $filter('limitTo')(vm.results || [], 100); // limit to 100 to keep it responsive.
                vm.nothing = ( sterm.length > 0 && vm.results.length === 0);
                
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
                        vm.setVisible(true);
                        vm.results[0].selected = true;
                        if ( !vm.selectModel ) {
                            vm.selectModel = vm.results[0];
                        }
                        console.log('autoselect first', vm.selectModel);
                    }
            });
            
            function show() {
                vm.setVisible(true);
            }

            // events bound to $scope.$on(name, handler) in activate
            function getScopeEvents() {
                return [
                    {
                        name: 'pd.typeahead:enter',
                        handler: function (event, selected) {
                            vm.setVisible(false);
                        }
                    },
                    {
                        name: 'pd.typeahead:backspace',
                        handler: function (event, selected) {

                            show();
                        }
                    },
                    {
                        name: 'pd.typeahead:updatedIndex',
                        handler: function(event, selected) {
                            vm.updateSelection(selected);
                            show();

                            $scope.$apply();
                        }
                    }, 
                    {
                        name: 'pd.typeahead:close',
                        handler: function() {
                            hide();
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
                     '<div ng-show="typeAheadCtrl.nothing">Nothing found!</div>'+
                     '<div class="nav dropdown" ng-hide="typeAheadCtrl.nothing">'+
                     // '<select ng-model="selectModel" class="dropdown-menu limitHeight"'+
                     //    'ng-options="' + scope.ngOptions + '"></select>'+
                     // '<select ng-model="testSelectModel2" '+
                     //    'ng-options="item as item.value for item in dataToPopulate"></select>'+
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
            
            scope.ngOptions = attrs.typeAhead;
            console.log(scope.ngOptions, scope.dataToPopulate);
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

            // scope.$on('pd.typeahead:checkOverflow', function(event, selected) {
            //  console.log('check if we need to modify scroll pos.', event, selected);
            //  //console.log(utility.isOverflownY($('.active')));
            //  //broadcast not needed --> remove
            //  // console.log('ui fix', document.getElementsByClassName('active'));
            //  // if(document.getElementsByClassName('active').length) {
            //  //  // 229 is the height of the container.
            //  //  document.getElementsByClassName('dropdown')[0].scrollTop = 
            //  //      document.getElementsByClassName('active')[0].offsetTop - 248;
            //  // }
            // });
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
            //  console.log(attrs.typeAhead,scope.data,element);
            //  typeaheadCtrl.ngOptions = attrs.typeAhead;
            //  $timeout(function () {  // we need a timeout to compile after the dust has settled
            //      $compile(element.contents())(scope); //recompile the HTML, make the updated content work.
            //  },0);
   //           });
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
