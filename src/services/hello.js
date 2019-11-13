/**
 * Service to store all filters on dashboard
 */
(function () {
        'use strict';

        function HelloSvc($rootScope, Connector, Storage, Lang, $location, Utils) {
            this.initialize = initialize;
        }

        // User formatting for intersytems login
        function formatUser(o) {
            o.login = o.sub;
        }

        function initialize(conf) {
            const hello = window.hello;
            const o = Object.assign({}, conf.auth.socialKeys);

            hello.init(extendWithIntersystemsOauth(conf));
            hello.init(conf.auth.socialKeys, {
                scope: 'email',
                redirect_uri: conf.auth.redirect,
                oauth_proxy: conf.auth.proxy || 'https://auth-server.herokuapp.com/proxy'
            });

            hello.on('auth.login', a => {
                // Call user information, for the given network
                hello(a.network).api('me').then((r) => {
                    console.log('Success: ', r);
                    // this.auth.social = r;
                    // this.auth.network = a.network;
                    // this.auth.loginSocial({login: r.login, network: a.network, email: r.email || '', name: r.name || ''});
                });
            }, err => {
                console.error(err);
            });
        }

        function extendWithIntersystemsOauth(config) {
            return {
                intersystems: {
                    name: 'Intersystems',
                    oauth: {
                        version: 2,
                        auth: config.auth.authorize || 'https://login.intersystems.com/oauth2/authorize'/*'https://login.intersystems.com/uat/oauth2/authorize'*/,
                        grant: config.auth.token || 'https://login.intersystems.com/oauth2/token'/*'https://login.intersystems.com/uat/oauth2/token'*/
                    },
                    wrap: {
                        me: function (o) {
                            formatUser(o);
                            return o;
                        }
                    },
                    get: {
                        me: 'userinfo'
                    },
                    scope: {
                        email: 'email+profile+openid'
                    },
                    login: (p) => {
                        p.qs.response_type = 'id_token token';
                    },
                    // Refresh the access_token
                    refresh: true,
                    // API Base URL
                    base: config.auth.base || 'https://login.intersystems.com/oauth2/', /*'https://login.intersystems.com/uat/oauth2/',*/
                    // No XHR
                    xhr: true,
                    // All requests should be JSONP as of missing CORS headers
                    jsonp: true,
                    // No form
                    form: false
                }
            };
        }

        angular.module('app')
            .service('Hello', ['$rootScope', 'Connector', 'Storage', 'Lang', '$location', 'Utils', HelloSvc]);
    }
)();