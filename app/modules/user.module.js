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
        crypto: require('crypto'),
        mongojs: require('mongojs'),
        stringService: require('../services/string.service')
    };

    module.exports =
        function (connectionString) {

            setUp(connectionString);

            return {

                addUser: addUser,
                getUser: getUser,
                editUser: editUser,
                deleteUser: deleteUser,
                searchUser: searchUser

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
     * Add a user to the Chift database.
     * @name addUser
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function addUser(req, res, next) {

        if (
            vm.stringService.isValid(
                [
                    req.body.firstname,
                    req.body.lastname,
                    req.body.pseudo,
                    req.body.email,
                    req.body.hash
                ]
            )
        ) {

            vm.usersCollection.find(
                {
                    //email: req.body.email

                    $or:
                        [
                            {
                                email: req.body.email
                            },

                            {
                                pseudo: req.body.pseudo
                            }
                        ]
                },

                function (error, user) {

                    if (error) {

                        res.send(500, {message: 'Une erreur interne est survenue.'});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        req.body.salt = vm.crypto.createHash('sha256')
                            .update(new Date().toString())
                            .digest('base64');

                        req.body.hash = vm.crypto.createHash('sha256')
                            .update(req.body.hash + req.body.salt)
                            .digest('base64');

                        vm.usersCollection.save(
                            req.body,

                            function (error, user) {

                                if (error) {

                                    res.send(500, {message: 'Une erreur interne est survenue.'});
                                    console.log(error.message);

                                }

                                delete user.hash;
                                delete user.salt;

                                res.send(201, user);

                            }
                        );

                    } else {

                        res.send(400, {message: 'Un compte existe déjà avec cette adresse email ou ce pseudo.'});

                    }

                }
            );

        } else {

            res.send(400, {message: 'Une des valeurs est incorrecte ou manquante.'});


        }

        return next();

    }

    /**
     * Get a user.
     * @name getUser
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function getUser(req, res, next) {

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

                        delete user[0].hash;
                        delete user[0].salt;
                        delete user[0].friends;
                        res.send(200, user[0]);

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
     * Update user.
     * @name editUser
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function editUser(req, res, next) {

        if (
            vm.stringService.isValid(
                [
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    req.body.pseudo
                ]
            )
        ) {

            vm.usersCollection.find(
                {
                    _id: vm.mongojs.ObjectId(req.params.userId)
                },

                function (error, user) {

                    if (error) {

                        res.send(500, {message: 'Une erreur interne est survenue.'});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        res.send(404, {message: 'Utilisateur non trouvé.'});
                        console.log(error.message);

                    } else {

                        var userData =
                        {
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            pseudo: req.body.pseudo,
                            email: req.body.email,
                            salt: user[0].salt,
                            hash: user[0].hash
                        };

                        if (
                            vm.stringService.isValid(
                                [
                                    req.body.oldHash,
                                    req.body.newHash
                                ]
                            )
                        ) {

                            var saltedHash = vm.crypto.createHash('sha256')
                                .update(req.body.oldHash + user[0].salt)
                                .digest('base64');

                            if (saltedHash === user[0].hash) {

                                userData.hash = vm.crypto.createHash('sha256')
                                    .update(req.body.newHash + user[0].salt)
                                    .digest('base64');

                            } else {

                                res.send(400, {message: 'L\'ancien mot de passe est incorrect.'});

                            }

                        }

                        vm.usersCollection.update(
                            {
                                _id: vm.mongojs.ObjectId(req.params.userId)
                            },

                            userData,

                            function (error, user) {

                                if (error) {

                                    res.send(500, {message: 'Une erreur interne est survenue.'});
                                    console.log(error.message);

                                } else {

                                    res.send(200, user);

                                }

                            }
                        );

                    }
                }
            );

        } else {

            res.send(400, {message: 'Une des valeurs est manquante ou incorrecte.'});

        }

        return next();

    }

    /**
     * Delete a user whith the userId.
     * @name delUser
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function deleteUser(req, res, next) {

        vm.usersCollection.remove(
            {

                _id: vm.mongojs.ObjectId(req.params.userId)

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

    /**
     * searchUser
     * @name searchUser
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function searchUser(req, res, next) {

        if (vm.stringService.isValid(req.params.q)) {

            vm.usersCollection.find(
                {

                    //_id: vm.mongojs.ObjectId(req.params.userId)
                    pseudo: new RegExp(req.params.q)

                    //$or:
                    //    [
                    //        {
                    //            firstname: new RegExp(req.params.q)
                    //        },
                    //
                    //        {
                    //            lastname: new RegExp(req.params.q)
                    //        }
                    //    ]

                },

                function (error, users) {

                    if (error) {

                        res.send(500, {message: error.message});
                        console.log(error.message);

                    } else if (users.length === 0) {

                        res.send(404, {message: 'Aucun utilisateur trouvé.'});

                    } else {

                        for (var i = 0; i < users.length; ++i) {

                            delete users[i].hash;
                            delete users[i].salt;
                            delete users[i].friends;

                        }

                        res.send(200, users);

                    }

                }
            );

        }
        else {

            res.send(400, {message: 'Recherche invalide.'});

        }

        return next();
    }

})();