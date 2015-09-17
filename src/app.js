angular.module('pdTypeadheadDemo', ['pdTypeahead'])
.value('DATA_SERVICE', 'https://raw.githubusercontent.com/dominictarr/random-name/master/first-names.json')
.controller('mainCtrl', ['$scope', 'pdTypeaheadDataService', function($scope,  pdTypeaheadDataService) {
  	pdTypeaheadDataService.getData()
        .then(function (httpData) {
            $scope.dataToPopulate = httpData;
        },
        function(httpData) {
          //error
        });
    }
]);