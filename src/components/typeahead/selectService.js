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