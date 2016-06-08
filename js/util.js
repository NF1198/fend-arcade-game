
/* util.js
 * This file provides various utility functions.
 *
 * For example, to generate a random integer within a specified range
 * call: Util.randomInt(3, 10);
 */

var Util = (function(global) {
  var methods = {};

  // This method generates a random integer with the range [low, high] inclusive.
  methods.randomInt = function(low, high) {
    var range = high - low;
    return Math.floor(Math.random() * (range + 1)) + low;
  };

  // This method generates a random float within the range [low, high] inclusive.
  methods.randomFloat = function(low, high) {
    return Math.random() * (high - low) + low;
  };

  return methods;
}(this));
