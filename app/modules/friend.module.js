/**
 * @author Raphael MARQUES
 * @copyright Chift 2014-2015. All rights reserved.

 * @file The friend module file.
 * @module FriendModule
 */

(function () {

    'use strict';

    var vm =
    {
        usersCollection: null,
        mongojs: require('mongojs'),
        stringService: require('../services/string.service')
    };

    module.exports =
        function (connectionString) {

            setUp(connectionString);

            return {

                addFriend: addFriend,
                getFriends: getFriends,
                deleteFriend: deleteFriend,
                lookForAFriend: lookForAFriend

            };

        };

    /**
     * setUp
     * @name setUp
     * @function
     */
    function setUp(connectionString) {

        vm.usersCollection = vm.mongojs(connectionString).collection('users');

    }

    /**
     * getFriends
     * @name getFriends
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function getFriends(req, res, next) {

        if (vm.stringService.isValid(req.params.userId)) {

            vm.usersCollection.find(
                {

                    _id: vm.mongojs.ObjectId(req.params.userId)

                },
                function (error, user) {

                    if (error) {

                        res.send(500, {message: error.message});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        res.send(404, {message: 'Utilisateur non trouvé.'});

                    } else {

                        if (!user[0].friends) {

                            res.send(200, []);

                        } else {

                            var userFriends = [], goneThroughAllFriends = false;

                            for (var i = 0; i < user[0].friends.length; i++) {

                                if (i === user[0].friends.length - 1) {

                                    goneThroughAllFriends = true;

                                }

                                vm.usersCollection.find(
                                    {

                                        _id: vm.mongojs.ObjectId(user[0].friends[i])

                                    },

                                    function (error, friend) {

                                        if (error) {

                                            res.send(500, {message: error.message});
                                            console.log(error.message);

                                        } else if (friend.length > 0) {

                                            delete friend[0].hash;
                                            delete friend[0].salt;
                                            delete friend[0].friends;
                                            userFriends.push(friend[0]);

                                            if (goneThroughAllFriends && userFriends.length === user[0].friends.length) {

                                                res.send(200, userFriends);

                                            }

                                        }

                                    }
                                );

                            }
                        }

                    }

                }
            );

        }
        else {

            res.send(400, {message: 'Utilisateur invalide.'});

        }

        return next();

    }

    /**
     * lookForAFriend
     * @name lookForAFriend
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function lookForAFriend(req, res, next) {

        if (vm.stringService.isValid(req.params.friendEmail)) {

            vm.usersCollection.find(
                {

                    email: req.params.friendEmail

                },

                function (error, user) {

                    if (error) {

                        res.send(500, {message: error.message});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        res.send(404, {message: 'Utilisateur non trouvé.'});

                    } else {

                        delete user[0].hash;
                        delete user[0].salt;
                        delete user[0].friends;

                        res.send(200, user[0]);

                    }

                }
            );

        } else {

            res.send(400, {message: 'Utilisateur invalide.'});

        }

        return next();

    }

    /**
     * add a friends
     * @name addFriend
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function addFriend(req, res, next) {

        if (vm.stringService.isValid(req.params.userId)) {

            vm.usersCollection.find(
                {

                    _id: vm.mongojs.ObjectId(req.params.userId)

                },
                function (error, user) {

                    if (error) {

                        res.send(500, {message: error.message});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        res.send(404, {message: 'Utilisateur non trouvé.'});

                    } else {

                        vm.usersCollection.find(
                            {
                                _id: vm.mongojs.ObjectId(req.params.userFriendId)

                            },
                            function (error) {

                                if (error) {

                                    res.send(500, {message: error.message});
                                    console.log(error.message);

                                }
                                else {

                                    if (!user[0].friends) {
                                        user[0].friends = [];
                                    }

                                    // TODO: create contain function
                                    var existingFriend = false;
                                    for (var i = 0; i < user[0].friends.length; i++) {
                                        if (user[0].friends[i] === req.params.userFriendId) {
                                            existingFriend = true;
                                            break;
                                        }
                                    }

                                    if (!existingFriend) {

                                        user[0].friends.push(req.params.userFriendId);

                                        vm.usersCollection.update(
                                            {
                                                _id: vm.mongojs.ObjectId(req.params.userId)
                                            },

                                            user[0],

                                            function (error) {

                                                if (error) {

                                                    res.send(500, {message: 'Une erreur interne est survenue.'});
                                                    console.log(error.message);

                                                } else {

                                                    res.send(200, user[0].friends);

                                                }

                                            }
                                        );

                                    } else {

                                        res.send(200, user[0].friends);

                                    }
                                }
                            }
                        );

                    }

                }
            );

        }
        else {

            res.send(400, {message: 'Utilisateur invalide.'});

        }

        return next();

    }

    /**
     * delete a friends
     * @name deleteFriend
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function deleteFriend(req, res, next) {
        if (vm.stringService.isValid(req.params.userId)) {

            vm.usersCollection.find(
                {

                    _id: vm.mongojs.ObjectId(req.params.userId)

                },
                function (error, user) {

                    if (error) {

                        res.send(500, {message: error.message});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        res.send(404, {message: 'Utilisateur non trouvé.'});

                    } else {

                        if (!user[0].friends) {
                            user[0].friends = [];
                        }

                        for (var i = 0; i < user[0].friends.length; i++) {

                            if (user[0].friends[i] === req.params.userFriendId) {

                                user[0].friends.splice(i, 1);
                                break;

                            }

                        }

                        vm.usersCollection.update(
                            {
                                _id: vm.mongojs.ObjectId(req.params.userId)
                            },

                            user[0],

                            function (error) {

                                if (error) {

                                    res.send(500, {message: 'Une erreur interne est survenue.'});
                                    console.log(error.message);

                                } else {

                                    res.send(200, user[0].friends);

                                }

                            }
                        );

                    }

                }
            );

        }
        else {

            res.send(400, {message: 'Utilisateur invalide.'});

        }

        return next();
    }

})();