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