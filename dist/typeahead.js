// controller.js
// directive.js
/* @ngInject */
angular.module('pdTypeAhead', ['pdMousetrap'])
.directive('typeAhead',['$document', '$compile', '$filter', function($document, $compile, $filter) {
	return {
		restrict: 'A',
		scope : {
			cinfo:'=datalist',
		},
		replace: false,
		controllerAs: 'typeAheadCtrl',
		controller: ['$scope', '$attrs', 'pdTypeAheadSelectService', function($scope, $attrs, pdTypeAheadSelectService) {
			var vm = this,
				getIndex = function(name) {
					return vm.results ? vm.results.indexOf(name): 0;
				},
				getMax = function() {
					return vm.results.length;
				};

			this.hide = function() {
				$scope.typeAheadVisible(false);
			};

			this.updateSelection = function(selected) {
				var activeName;
				$scope.selectedNameIndex = selected;
				angular.forEach(vm.results, function(name, index) {
					name.selected = false;
					if (index == selected) {
						name.selected = true;

						// UI Fix
						if(document.getElementsByClassName('active').length) {
							// 229 is the height of the container.
							document.getElementsByClassName('dropdown')[0].scrollTop =  document.getElementsByClassName('active')[0].offsetTop -248;
						}
					} 
				});
			};
			$scope.sterm = '';
			$scope.visible = true;
			$scope.typeAheadVisible = function(visible) {
				$scope.visible = $scope.sterm.length > 0 && visible;
			};

			$scope.$watch(function() {return vm.results}, function(results) {
				var resLength = results.length;
				if ( !resLength ) return; // not resolved yet
				pdTypeAheadSelectService.setMax(resLength);
				vm.updateSelection(pdTypeAheadSelectService.getSelected());
				if ( resLength > 1 ) {
				 	$scope.typeAheadVisible(true);
				}
			});

			$scope.$on('pd.typeahead:enter',function (event, selected) {
				$scope.typeAheadVisible(false);
			});

			$scope.$on('pd.typeahead:backspace',function (event, selected) {
			  if($scope.sterm.length > 1)
					$scope.typeAheadVisible(true);
				else
					$scope.typeAheadVisible(false);
			});	

			$scope.$on('pd.typeahead:updatedIndex', function(event, selected) {
				vm.updateSelection(selected);

				$scope.$apply();
			});

			$scope.$on('pd.typeahead:close', function() {
				vm.hide();
				$scope.$apply();
			});

			$scope.$on('pd.typeahead:applySelection', function(event, selected) {
				if ( !vm.results[selected] ) return; //nothing selected show type ahead
				
				$scope.updateSearchTerm(vm.results[selected]);

				$scope.$apply();
			});


			$scope.updateSearchTerm = function(selName) {
				$scope.sterm = selName.value;
				$scope.typeAheadVisible(false);
			};

			$scope.close = function() {
				vm.hide();
			};

			$scope.filterData = function(sterm) {
				vm.results = $filter('filter')($scope.cinfo, sterm);//cinfo| filter:sterm track by $index
				vm.results = $filter('limitTo')(vm.results || [], 100); // limit to 100 to keep it responsive.
				pdTypeAheadSelectService.setSelected(getIndex(sterm));
				pdTypeAheadSelectService.setMax(getMax());
				$scope.selectedNameIndex = pdTypeAheadSelectService.getSelected();
			};

			$scope.filterData('');
		}],
		link:function(scope,element,attr) {
			element[0].focus();
			element.attr('pd-mousetrap','');
			element.removeAttr("type-ahead"); //remove the attribute to avoid indefinite loop
			element.removeAttr("data-type-ahead"); //also remove the same attribute with data- prefix in case users specify data-common-things in the html
			$document[0].getElementById('idSearch').focus(); // auto-focus to input field
			$compile(element)(scope); // update because of newly added directive
		},
		templateUrl:'src/components/typeahead/typeahead.tmpl'
	}
}]); 
// service.js
/* @ngInject */
angular.module('pdTypeAhead')
.factory('pdTypeAheadService', ['$http', '$q', 'DATA_SERVICE', function($http,$q,DATA_SERVICE) {
	var factory = {};
	var def = $q.defer();
	factory.getData = function() {
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
			})
			return def.promise;
		}
	return factory;
}])
.factory('pdTypeAheadSelectService', ['$rootScope', function($rootScope) {
	var selectedIndex = 0,
		maxIndex = 0;

	return {
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
			if ( selectedIndex > 0 )
				selectedIndex--; 

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

	}
}]);
'use strict';

angular.module('typeahead.tpls', []).
run(['$templateCache', function($templateCache) {
  $templateCache.put('typeahead.tmpl',
    '<h2 class="text-center">Typeahead Example Using AngularJS Directives</h2>\n' +
    '<div class="bs-example">\n' +
    '  \n' +
    '    <div class="form-group col-sm-10">\n' +
    '      <label for="Search term" class="form-group">Enter search term</label>\n' +
    '      <input class="form-control" type="search" id="idSearch" ng-model="sterm" ng-change="filterData(sterm)" placeholder="Enter Search Term">\n' +
    '      <div ng-if="visible" class="dropdown limitHeight">\n' +
    '          <a href="#" ng-model="selName" ng-class="{active: data.selected}" ng-click="updateSearchTerm(data)" ng-repeat="data in typeAheadCtrl.results track by $index" class="divider list-group-item">\n' +
    '           {{data.value}}\n' +
    '          </a>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '</div>'
  );
}]);
