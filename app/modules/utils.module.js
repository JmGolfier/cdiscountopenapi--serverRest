/**
 * @author Raphael MARQUES
 * @copyright Chift 2014-2015. All rights reserved.

 * @file The utils module file.
 * @module UtilsModule
 */

(function () {

    'use strict';

    var vm =
    {
        client: null,
        usersCollection: null,
        listsCollection: null,
        mongojs: require('mongojs'),
        extend: require('util')._extend,
        stringService: require('../services/string.service')
    };

    module.exports =
        function (connectionString, JSON, key, url) {

            setUp(connectionString, JSON, key, url);

            return {

                getSharedCode: getSharedCode,
                createSearchResponse: createSearchResponse,
                searchProductsByName: searchProductsByName

            };

        };

    /**
     * setUp
     * @name setUp
     * @function
     */
    function setUp(connectionString, JSON, key, url) {

        vm.apiKey = key;
        vm.SEARCH_JSON = JSON;
        vm.client = createClient(url);

        vm.usersCollection = vm.mongojs(connectionString).collection('users');
        vm.listsCollection = vm.mongojs(connectionString).collection('lists');

    }

    /**
     * createClient
     * @name createClient
     * @function
     */
    function createClient(url) {

        return require('restify').createJsonClient(
            {
                url: url,
                version: '0.0.6'
            }
        );

    }

    /**
     * get a shared code
     * @name getSharedCode
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function getSharedCode(req, res, next) {

        var generateCodes = [];

        for (var i = 0; i < 10; ++i) {

            generateCodes.push(sharedCode());

        }

        vm.listsCollection.find(
            {
                code: {$in: generateCodes}
            },

            function (error, code) {
                if (error) {

                    res.send(500, {message: error.message});
                    console.log(error.message);

                } else if (code.length === 0) {

                    res.send(200, {code: generateCodes[0]});

                } else {

                    var found = false;

                    for (var i = 0; i < code.length; ++i) {

                        for (var j = 0; j < generateCodes.length; ++j) {

                            console.log(code[i]);

                            if (code[i].code == generateCodes[j]) {

                                found = true;

                            }
                        }
                    }

                    if (generateCodes.length > 0 && !found) {

                        res.send(200, {code:generateCodes[0]});

                    } else {

                        return getSharedCode(res, req, next);

                    }

                }
            });

        return next();

    }

    /**
     * return a shared code for friends.
     * @name sharedCode
     * @function
     */
    function sharedCode() {

        return randCode() + randCode();

    }

    /**
     * return a random code.
     * @name randCode
     * @function
     */
    function randCode() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    /**
     * Actions to do when the server gets online.
     * @name createSearchResponse
     * @param {Object} data The data to parse
     * @function
     */
    function createSearchResponse(data) {

        var responseData = [];

        for (var i = 0; i < data.Products.length; i++) {

            responseData.push(
                {
                    name: data.Products[i].Name,
                    img: data.Products[i].MainImageUrl,
                    price: data.Products[i].BestOffer.SalePrice,
                    url: data.Products[i].BestOffer.ProductURL
                }
            );

        }

        return responseData;
    }

    /**
     * Search products by name from CDiscount API.
     * @name searchProductsByName
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function searchProductsByName(req, res, next) {

        var data = vm.extend({}, vm.SEARCH_JSON);
        data.SearchRequest.Keyword = req.params.name;
        data.ApiKey = vm.apiKey;

        vm.client.post(
            vm.client.url.href + '/search',

            data,

            function (cli_err, cli_req, cli_res, cli_obj) {

                if (cli_err) {

                    console.log("Error :", cli_err);
                    res.send(500, {message: 'Une erreur interne est survenue.'});
                    console.log(error.message);

                } else {

                    res.send(200, createSearchResponse(cli_obj));

                }
            }
        );

        return next();
    }

})();