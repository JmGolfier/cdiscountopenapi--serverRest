/**
 * @author Raphael MARQUES
 * @author Jean Mathieu GOLFIER
 * @author Yohan RODRIGUEZ
 * @copyright Chift 2014-2015. All rights reserved.

 * @file The config file.
 * @module Config
 */

module.exports = {

    PORT: 8080,
    DB_NAME: 'chift',
    DB_PORT: '33390',
    DB_USER: 'chift',
    DB_PASS: 'C41f753rv3R',
    DB_URL: 'ds033390.mongolab.com',
    API_KEY: '3efcaa54e01b4129b1afec8197d71224',
    API_URL: 'http://api.cdiscount.com/OpenApi/json/',

    SEARCH_JSON:
    {
        ApiKey: '',
        SearchRequest: {
            Filters: {
                Brands: [],
                Condition: "new",
                IncludeMarketPlace: false,
                Navigation: null,
                Price: {
                    Max: 0,
                    Min: 0
                }
            },
            Keyword: "",
            Pagination: {
                ItemsPerPage: 10,
                PageNumber: 1
            }
        }
    }

};