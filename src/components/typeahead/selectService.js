// selectService.js
(function() {
    'use strict';

    angular.module('pdTypeahead')
    .factory('pdTypeaheadSelectService', SelectService);

    /* @ngInject */
    function SelectService($rootScope) {
        var factory = {
                selectedIndex: 0,
                maxIndex: 0,
                setSelected: function(index) {
                    this.selectedIndex = index;
                },
                setMax: function(max) {
                    this.maxIndex = max;
                },
                getSelected: function() {
                    return this.selectedIndex;
                },
                moveUp: function() {
                    if ( this.selectedIndex > 0 ) {
                        this.selectedIndex--; 
                    }
                    $rootScope.$broadcast('pd.typeahead:updatedIndex', this.selectedIndex);
                },
                moveDown: function() {
                    if ( this.selectedIndex < this.maxIndex -1 ){
                        this.selectedIndex++;
                    }
                    $rootScope.$broadcast('pd.typeahead:updatedIndex', this.selectedIndex);

                },
                applySelection: function() {
                    $rootScope.$broadcast('pd.typeahead:applySelection', this.selectedIndex);
                }
            };

        return factory;
    }

})();