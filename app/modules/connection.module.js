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
        usersCollection: null,
        crypto: require('crypto'),
        mongojs: require('mongojs'),
        stringService: require('../services/string.service')
    };

    module.exports =
        function (connectionString) {

            setUp(connectionString);

            return {

                login: login,
                lostPassword: lostPassword,
                changePassword: changePassword,
                cancelPassword: cancelPassword

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
     * Try to login.
     * @name login
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function login(req, res, next) {

        if (
            vm.stringService.isValid(
                [
                    req.body.email,
                    req.body.hash
                ]
            )
        ) {

            console.log(req.body);

            vm.usersCollection.find(
                {
                    email: req.body.email
                },
                function (error, user) {

                    if (error) {

                        res.send(500, {message: 'Une erreur interne est survenue.'});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        res.send(404, {message: 'Utilisateur non trouvé.'});
                        console.log(error.message);

                    } else {

                        var saltedHash = vm.crypto.createHash('sha256')
                            .update(req.body.hash + user[0].salt)
                            .digest('base64');

                        if (saltedHash === user[0].hash) {

                            delete user[0].salt;
                            delete user[0].hash;
                            res.send(200, user[0]);

                        } else {

                            res.send(401, {message: 'Mot de passe incorrect.'});
                            console.log(error.message);

                        }
                    }

                }
            )

        }

        return next();

    }

    /**
     * lostPassword
     * @name lostPassword
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function lostPassword(req, res, next) {

        if (vm.stringService.isValid(req.body.email)) {

            vm.usersCollection.find(
                {
                    email: req.body.email
                },
                function (error, user) {

                    if (error) {

                        res.send(500, {message: 'Une erreur interne est survenue.'});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        res.send(404, {message: 'Utilisateur non trouvé.'});
                        console.log(error.message);

                    } else {

                        var passwordToken =
                            vm.crypto.createHash('sha256')
                                .update(req.body.email + new Date() + (Math.random() * Math.random()))
                                .digest('base64').replace(/"/g, '');

                        var userData =
                        {
                            firstname: user[0].firstname,
                            lastname: user[0].lastname,
                            email: user[0].email,
                            salt: user[0].salt,
                            hash: user[0].hash,
                            token: passwordToken
                        };

                        vm.usersCollection.update(
                            {
                                _id: vm.mongojs.ObjectId(user[0]._id)
                            },

                            userData,

                            function (error, user) {

                                if (error) {

                                    res.send(500, {message: 'Une erreur interne est survenue.'});
                                    console.log(error.message);

                                } else {

                                    // TODO: send email to user
                                    res.send(200, {token: passwordToken});

                                }

                            }
                        );

                    }

                }
            )

        }

        return next();

    }

    /**
     * changePassword
     * @name changePassword
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function changePassword(req, res, next) {

        if (
            vm.stringService.isValid(
                [
                    req.body.email,
                    req.body.token,
                    req.body.hash
                ]
            )
        ) {

            vm.usersCollection.find(
                {
                    email: req.body.email
                },
                function (error, user) {

                    if (error) {

                        res.send(500, {message: 'Une erreur interne est survenue.'});
                        console.log(error.message);

                    } else if (user.length === 0) {

                        res.send(404, {message: 'Utilisateur non trouvé.'});
                        console.log(error.message);

                    } else {

                        var salt =
                            vm.crypto.createHash('sha256')
                                .update(new Date() + (Math.random() * Math.random()))
                                .digest('base64'),

                            hash =
                                vm.crypto.createHash('sha256')
                                    .update(req.body.hash + salt)
                                    .digest('base64');

                        var userData =
                        {
                            firstname: user[0].firstname,
                            lastname: user[0].lastname,
                            email: req.body.email,
                            salt: salt,
                            hash: hash
                        };

                        vm.usersCollection.update(
                            {
                                _id: vm.mongojs.ObjectId(user[0]._id)
                            },

                            userData,

                            function (error, user) {

                                if (error) {

                                    res.send(500, {message: 'Une erreur interne est survenue.'});
                                    console.log(error.message);

                                } else {

                                    // TODO: send email to user
                                    res.send(200);

                                }

                            }
                        );

                    }

                }
            )

        }

        return next();

    }

    /**
     * cancelPassword
     * @name cancelPassword
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Object} next The iterator for the next request
     * @function
     */
    function cancelPassword(req, res, next) {

        if (vm.stringService.isValid(req.body.token)) {

            vm.usersCollection.find(
                {
                    token: req.body.token
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
                            firstname: user[0].firstname,
                            lastname: user[0].lastname,
                            email: user[0].email,
                            salt: user[0].salt,
                            hash: user[0].hash
                        };

                        vm.usersCollection.update(
                            {
                                _id: vm.mongojs.ObjectId(user[0]._id)
                            },

                            userData,

                            function (error, user) {

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
            )

        }

        return next();

    }

})();