// typeahead.module.js
(function() {
    'use strict';
    
    angular.module('pdTypeahead', [
        'pdMousetrapModule',
        'utils.focus-if',

        'pdTypeahead.defaultOptions', 
        'typeahead.tpls']);

})();