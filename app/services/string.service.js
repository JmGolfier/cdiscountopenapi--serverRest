/**
 * @author Raphael MARQUES
 * @author Jean Mathieu GOLFIER
 * @author Yohan RODRIGUEZ
 * @copyright Chift 2014-2015. All rights reserved.

 * @file The StringService file.
 * @module StringService
 */

module.exports = {

    /**
     * Check string(s).
     * @name isValid
     * @param {String} data The string to be checked
     * @param {Array} data The strings to be checked
     * @return {Boolean} The fact that the string is valid
     * @function
     */
    isValid: function (data) {

        if(data instanceof Array) {

            for(var i = 0; i < data.length; ++i) {

                if(data[i] === null || data[i] === undefined || data[i].trim() === '') {

                    return false;

                }

            }

        } else if(typeof data === 'string') {

            return data !== null && data !== undefined && data.trim() !== '';

        } else {

            return false;

        }

        return true;

    }

};