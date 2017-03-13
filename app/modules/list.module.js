/**
 * @author Raphael MARQUES
 * @copyright Chift 2014-2015. All rights reserved.

 * @file The user module file.
 * @module UserModule
 */

(function () {

    'use strict';

    var vm =
    {
        usersCollection: null,
        listsCollection: null,
        mongojs: require('mongojs'),
        stringService: require('../services/string.service')
    };

    module.exports =
        function (connectionString) {

            setUp(connectionString);

            return {

                getList: getList,
                addList: addList,
                editList: editList,
                deleteList: deleteList,
                getListForOwner: getListForOwner,
                getSharedListForOwner: getSharedListForOwner

            };

        };

    /**
     * setUp
     * @name setUp
     * @function
     */
    function setUp(connectionString) {

        vm.usersCollection = vm.mongojs(connectionString).collection('users');
        vm.listsCollection = vm.mongojs(connectionString).collection('lists');

    }

    /**
     * Get a list from the Chift database.
     * @name getList
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function getList(req, res, next) {
        if (req.params.listId && req.params.listId.trim() !== '') {

            vm.listsCollection.find(
                {

                    code: req.params.listId

                },
                function (error, list) {

                    if (error) {

                        res.send(500, {message: error.message});
                        console.log(error.message);

                    } else if (list.length === 0) {

                        res.send(404, {message: 'Liste non trouvée'});


                    } else {

                        res.send(200, list[0]);

                    }

                }
            );
        } else {

            res.send(400, {message: 'ID invalide.'});

        }
        return next();
    }

    /**
     * Get a list from the Chift database.
     * @name getListForOwner
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function getListForOwner(req, res, next) {
        if (req.params.ownerId && req.params.ownerId.trim() !== '') {

            vm.listsCollection.find(
                {

                    owner: req.params.ownerId

                },
                function (error, list) {

                    if (error) {

                        res.send(500, {message: error.message});
                        console.log(error.message);

                    } else if (list.length === 0) {
                        res.send(404, {message: 'Aucune liste enregistrée.'});

                    } else {

                        res.send(200, list);

                    }

                }
            );
        } else {

            res.send(400, {message: 'ID invalide.'});

        }
        return next();
    }

    /**
     * Get a list from the Chift database.
     * @name getListForOwner
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function getSharedListForOwner(req, res, next) {
        if (req.params.ownerId && req.params.ownerId.trim() !== '') {

            vm.usersCollection.find(
                {

                    _id: vm.mongojs.ObjectId(req.params.ownerId)

                },
                function (error, user) {

                    if (error) {

                        res.send(500, {message: error.message});
                        console.log(error.message);

                    } else if (user.length === 0) {
                        res.send(404, {message: 'Erreur user.'});

                    } else {

                        console.log(user[0].sharedWithMe);

                        vm.listsCollection.find(
                            {

                                code: {$in: user[0].sharedWithMe || []}

                            },
                            function (error, lists) {

                                if (error) {

                                    res.send(500, {message: error.message});
                                    console.log(error.message);

                                } else if (lists.length === 0) {
                                    res.send(404, {message: 'Erreur lists.'});

                                } else {

                                    res.send(200, lists);

                                }

                            }
                        );

                    }

                }
            );
        } else {

            res.send(400, {message: 'ID invalide.'});

        }
        return next();
    }

    /**
     * Actions to add a list in collection lists.
     * @name addList
     * @function
     */
    function addList(req, res, next) {
        vm.listsCollection.save(
            req.body,

            function (error, list) {

                if (error) {

                    res.send(500, {message: 'Une erreur interne est survenue.'});
                    console.log(error.message);

                }

                for(var i = 0; i < req.body.sharedWith.length; ++i) {

                    var index = i;

                    vm.usersCollection.find(
                        {
                            _id: vm.mongojs.ObjectId(req.body.sharedWith[i]._id)
                        },

                        function (error, user) {

                            if (error) {

                                console.log(error.message);

                            } else if (user.length > 0) {

                                if(!user[0].sharedWithMe) {

                                    user[0].sharedWithMe = [];

                                }


                                user[0].sharedWithMe.push(req.body.code);

                                vm.usersCollection.update(
                                    {
                                        _id: vm.mongojs.ObjectId(req.body.sharedWith[index]._id)
                                    },

                                    user[0],

                                    function (error, user) {

                                        if (error) {

                                            console.log(error.message);

                                        }

                                    }
                                );

                            }
                        }
                    );

                }

                res.send(201, list);
            }
        );
        return next();
    }

    /**
     * Update a list whith the listId.
     * @name editList
     * @function
     */
    function editList(req, res, next) {
        vm.listsCollection.find(
            {
                code: req.params.listId
            },

            function (error, list) {

                if (error) {

                    res.send(500, {message: 'Une erreur interne est survenue.'});
                    console.log(error.message);

                } else if (list.length === 0) {

                    res.send(404, {message: 'List non trouvé.'});
                    console.log(error.message);

                } else {

                    delete req.body._id;

                    vm.listsCollection.update(
                        {
                            code: req.params.listId
                        },

                        req.body,

                        function (error) {

                            if (error) {

                                res.send(500, {message: 'Une erreur interne est survenue.'});
                                console.log(error.message);

                            } else {

                                res.send(200);

                            }

                        }
                    );

                }
            }
        );
        return next();
    }

    /**
     * Delete a list whith the listId.
     * @name deleteList
     * @function
     */
    function deleteList(req, res, next) {
        vm.listsCollection.remove(
            {

                code: req.params.listId

            },
            function (error) {

                if (error) {

                    res.send(500, {message: error.message});
                    console.log(error.message);

                } else {

                    res.send(200);

                }

            }
        );
        return next();
    }

})();