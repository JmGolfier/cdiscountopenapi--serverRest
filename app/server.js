/**
 * @author Raphael MARQUES
 * @author Jean Mathieu GOLFIER
 * @author Yohan RODRIGUEZ
 * @copyright Chift 2014-2015. All rights reserved.

 * @file The NodeJS Server file.
 * @module NodeJSServer
 */

 // TEST MODIF DATE

(function () {

    'use strict';

    var vm = {};

    vm.restify = require('restify');

    vm.localConfig = require('./services/config.service');
    vm.stringService = require('./services/string.service');

    vm.port = process.env.PORT || vm.localConfig.PORT;
    vm.dbUrl = process.env.DB_URL || vm.localConfig.DB_URL;
    vm.apiKey = process.env.API_KEY || vm.localConfig.API_KEY;
    vm.apiUrl = process.env.API_URL || vm.localConfig.API_URL;
    vm.dbUser = process.env.DB_USER || vm.localConfig.DB_USER;
    vm.dbPort = process.env.DB_PORT || vm.localConfig.DB_PORT;
    vm.dbName = process.env.DB_NAME || vm.localConfig.DB_NAME;
    vm.dbPassword = process.env.DB_PASS || vm.localConfig.DB_PASS;

    vm.connectionString = vm.dbUser + ":" + vm.dbPassword + "@" + vm.dbUrl + ":" + vm.dbPort + "/" + vm.dbName;

    vm.user = require('./modules/user.module')(vm.connectionString);
    vm.list = require('./modules/list.module')(vm.connectionString);
    vm.friend = require('./modules/friend.module')(vm.connectionString);
    vm.connection = require('./modules/connection.module')(vm.connectionString);
    vm.utils = require('./modules/utils.module')(vm.connectionString, vm.localConfig.SEARCH_JSON, vm.apiKey, vm.apiUrl);

    vm.server = vm.restify.createServer(
        {
            name: 'Chift-Server',
            version: '0.0.6'
        }
    );

    vm.server.use(vm.restify.CORS());
    vm.server.use(vm.restify.bodyParser());
    vm.server.use(vm.restify.queryParser());
    vm.server.use(vm.restify.fullResponse());

    // GET Handlers
    vm.server.get('/users', vm.user.searchUser);
    vm.server.get('/users/:userId', vm.user.getUser);
    vm.server.get('/lists/:listId', vm.list.getList);
    vm.server.get('/listsOwner/:ownerId', vm.list.getListForOwner);
    vm.server.get('/sharedLists/:ownerId', vm.list.getSharedListForOwner);
    vm.server.get('/listCode', vm.utils.getSharedCode);
    vm.server.get('/friends/:userId', vm.friend.getFriends);
    vm.server.get('/products/:name', vm.utils.searchProductsByName);

    // POST Handlers
    vm.server.post('/users', vm.user.addUser);
    vm.server.post('/lists', vm.list.addList);
    vm.server.post('/login', vm.connection.login);
    vm.server.post('/lostpassword', vm.connection.lostPassword);
    vm.server.post('/changepassword', vm.connection.changePassword);
    vm.server.post('/cancelpassword', vm.connection.cancelPassword);
    vm.server.post('/friends/:friendEmail', vm.friend.lookForAFriend);

    // PUT Handlers
    vm.server.put('/users/:userId', vm.user.editUser);
    vm.server.put('/lists/:listId', vm.list.editList);
    vm.server.put('/friends/:userId/:userFriendId', vm.friend.addFriend);

    // DELETE Handlers
    vm.server.del('/lists/:listId', vm.list.deleteList);
    vm.server.del('/users/:userId', vm.user.deleteUser);
    vm.server.del('/friends/:userId/:userFriendId', vm.friend.deleteFriend);

    vm.server.listen(vm.port, serverListening);

    return vm;

    /**
     * Actions to do when the server gets online.
     * @name serverListening
     * @function
     */
    function serverListening() {

        console.log('All the magic happens when %s is listening at %s...', vm.server.name, vm.server.url);

    }
})
();