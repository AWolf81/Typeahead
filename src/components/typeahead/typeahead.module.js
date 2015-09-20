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