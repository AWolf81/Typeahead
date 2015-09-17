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