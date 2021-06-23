(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Random = Package.random.Random;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var BlazeLayout = Package['kadira:blaze-layout'].BlazeLayout;
var FlowRouter = Package['kadira:flow-router'].FlowRouter;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var check = Package.check.check;
var Match = Package.check.Match;
var Async = Package['meteorhacks:async'].Async;
var JsonRoutes = Package['simple:json-routes'].JsonRoutes;
var RestMiddleware = Package['simple:json-routes'].RestMiddleware;
var SubsManager = Package['meteorhacks:subs-manager'].SubsManager;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var Selector = Package['steedos:base'].Selector;
var Steedos = Package['steedos:base'].Steedos;
var AjaxCollection = Package['steedos:base'].AjaxCollection;
var SteedosDataManager = Package['steedos:base'].SteedosDataManager;
var SteedosOffice = Package['steedos:base'].SteedosOffice;
var billingManager = Package['steedos:base'].billingManager;
var _i18n = Package['universe:i18n']._i18n;
var i18n = Package['universe:i18n'].i18n;
var Promise = Package.promise.Promise;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var refreshTokensCollection, authCodesCollection, spaceId, oAuth2Server, MeteorModel, client, __coffeescriptShare;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/steedos_oauth2-server/lib/common.js                                                                  //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
db.OAuth2Clients = new Meteor.Collection('OAuth2Clients');
db.OAuth2Clients.allow({
    insert: function(userId, doc) {
        return true;
    },
    update: function(userId, doc, fieldNames, modifier) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    }
});

refreshTokensCollection = new Meteor.Collection('OAuth2RefreshTokens');
refreshTokensCollection.allow({
    insert: function(userId, doc) {
        return Meteor.isServer && userId && userId === doc.userId;
    },
    update: function(userId, doc, fieldNames, modifier) {
        return false;
    },
    remove: function(userId, doc) {
        return userId && userId === doc.userId;
    }
});

authCodesCollection = new Meteor.Collection('OAuth2AuthCodes');
authCodesCollection.allow({
    insert: function(userId, doc) {
        return Meteor.isServer && userId && userId === doc.userId;
    },
    update: function(userId, doc, fieldNames, modifier) {
        return false;
    },
    remove: function(userId, doc) {
        return userId && userId === doc.userId;
    }
});

if(Meteor.isServer){
    authCodesCollection.before.insert(function(userId, doc){
        spaceId = db.space_users.findOne({user: doc.userId}).space;
        doc.spaceId = spaceId;
    });
}


oAuth2Server = {
    pubSubNames: {
        authCodes: 'oauth2/authCodes',
        refreshTokens: 'oauth2/refreshTokens'
    },
    methodNames: {
        authCodeGrant: 'oauth2/authCodeGrant'
    },
    collections: {
        refreshToken: refreshTokensCollection,
        authCode: authCodesCollection,
        clients: db.OAuth2Clients
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/steedos_oauth2-server/lib/meteor-model.js                                                            //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
/**
 * A oauth2-server model for dealing with the meteor collections. Original code
 * from: https://github.com/RocketChat/rocketchat-oauth2-server/blob/master/model.coffee
 * Modifications and improvements have been made.
 * This class is used a callback model for oauth2-server. oauth2-server runs it's calls
 * in a different context and fiber. Doing so can get really messy when attempting to
 * run Meteor code, like Collection calls. We work-around this problem by creating
 * instance methods are runtime that are proxied through Meteor.bindEnvironment.
 * This strategy allows us to specify the this context.
 * Defining the class with prototype methods defined by Meteor.bindEnvironment
 * would ensure we lose our this context when the method executes.
 */
MeteorModel = (function() {
    function MeteorModel(accessTokenCollection,
                         refreshTokenCollection,
                         authCodeCollection,
                         clientsCollection,
                         debug) {
        this.accessTokenCollection = accessTokenCollection;
        this.refreshTokenCollection = refreshTokenCollection;
        this.authCodeCollection = authCodeCollection;
        this.clientsCollection = clientsCollection;
        this.debug = debug;

        ///////////////////
        // Defining the methods.
        ///////////////////

        this.getAccessToken = Meteor.bindEnvironment(
                function (bearerToken, callback) {
                if (this.debug === true) {
                    console.log('[OAuth2Server]', 'in getAccessToken (bearerToken:', bearerToken, ')');
                }

                try {
                    var token = this.accessTokenCollection.findOne({
                        accessToken: bearerToken
                    });

                    callback(null, token);

                } catch (e) {
                    callback(e);
                }
            },
            null, // exception handler
            this // this context.
        );

        this.getClient = Meteor.bindEnvironment(
            function (clientId, clientSecret, callback) {
                if (this.debug === true) {
                    console.log('[OAuth2Server]', 'in getClient (clientId:', clientId, ', clientSecret:', clientSecret, ')');
                }

                try {
                    var collection = this.clientsCollection;
                    if (clientSecret == null) {
                        client = collection.findOne({
                            active: true,
                            clientId: clientId
                        });
                    } else {
                        client = collection.findOne({
                            active: true,
                            clientId: clientId,
                            clientSecret: clientSecret
                        });
                    }
                    callback(null, client);
                } catch (e) {
                    callback(e);
                }
            },
            null, // exception handler
            this // this context.
        );


        this.grantTypeAllowed = Meteor.bindEnvironment(
            function (clientId, grantType, callback) {
                if (this.debug === true) {
                    console.log('[OAuth2Server]', 'in grantTypeAllowed (clientId:', clientId, ', grantType:', grantType + ')');
                }

                callback(false, grantType === 'authorization_code');
            },
            null, // exception handler
            this // this context.
        );

        this.saveAccessToken = Meteor.bindEnvironment(
            function (token, clientId, expires, user, callback) {
                if (this.debug === true) {
                    console.log('[OAuth2Server]', 'in saveAccessToken (token:', token, ', clientId:', clientId, ', user:', user, ', expires:', expires, ')');
                }
                
                try {
                    // 有效期（默认一小时）
                    var collection = this.clientsCollection;
                    var clientObj = collection.findOne({clientId: clientId});
                    if(clientObj && clientObj.expires && clientObj.expires>1){
                        expires.setHours(expires.getHours()+clientObj.expires-1);
                    }
                    var tokenId = this.accessTokenCollection.insert({
                        accessToken: token,
                        clientId: clientId,
                        userId: user.id,
                        expires: expires
                    });

                    callback(null, tokenId);

                } catch (e) {
                    callback(e);
                }
            },
            null, // exception handler
            this // this context.
        );

        this.getAuthCode = Meteor.bindEnvironment(
            function (authCode, callback) {
                if (this.debug === true) {
                    console.log('[OAuth2Server]', 'in getAuthCode (authCode: ' + authCode + ')');
                }

                try {
                    var code = this.authCodeCollection.findOne({
                        authCode: authCode
                    });

                    callback(null, code);

                } catch (e) {
                    callback(e);
                }
            },
            null, // exception handler
            this // this context.
        );

        this.saveAuthCode = Meteor.bindEnvironment(
            function (code, clientId, expires, user, callback) {
                Meteor.bindEnvironment(code, clientId, expires, user, callback)
                if (this.debug === true) {
                    console.log('[OAuth2Server]', 'in saveAuthCode (code:', code, ', clientId:', clientId, ', expires:', expires, ', user:', user, ')');
                }

                try {
                    this.authCodeCollection.remove({authCode: code});
                    var codeId = this.authCodeCollection.insert({
                        authCode: code,
                        clientId: clientId,
                        userId: user.id,
                        expires: expires
                    });

                    callback(null, codeId);

                } catch (e) {
                    callback(e);
                }
            },
            null, // exception handler
            this // this context.
        );

        this.saveRefreshToken = Meteor.bindEnvironment(
            function (token, clientId, expires, user, callback) {
                if (this.debug === true) {
                    console.log('[OAuth2Server]', 'in saveRefreshToken (token:', token, ', clientId:', clientId, ', user:', user, ', expires:', expires, ')');
                }

                try {
                    this.refreshTokenCollection.remove({refreshToken: token});
                    var tokenId = this.refreshTokenCollection.insert({
                        refreshToken: token,
                        clientId: clientId,
                        userId: user.id,
                        expires: expires
                    });

                    callback(null, tokenId);

                } catch (e) {
                    callback(e);
                }
            },
            null, // exception handler
            this // this context.
        );

        this.getRefreshToken = Meteor.bindEnvironment(
            function (refreshToken, callback) {
                if (this.debug === true) {
                    console.log('[OAuth2Server]', 'in getRefreshToken (refreshToken: ' + refreshToken + ')');
                }

                try {
                    var token = this.refreshTokenCollection.findOne({
                        refreshToken: refreshToken
                    });

                    callback(null, token);

                } catch (e) {
                    callback(e);
                }
            },
            null, // exception handler
            this // this context.
        );
    };

    return MeteorModel;
})();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/steedos_oauth2-server/lib/server.js                                                                  //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
// get the node modules.
var express = Npm.require('express'),
    bodyParser = Npm.require('body-parser'),
    oauthserver = Npm.require('oauth2-server');


// configure the server-side collections. The rest of the collections
// exist in common.js and are for both client and server.
db.OAuth2AccessTokens = new Meteor.Collection('OAuth2AccessTokens');

if(Meteor.isServer){
    db.OAuth2AccessTokens.before.insert(function(userId, doc){
        spaceId = db.space_users.findOne({user: doc.userId}).space;
        doc.spaceId = spaceId;
    });
}

// setup the node oauth2 model.
var meteorModel = new MeteorModel(
    db.OAuth2AccessTokens,
    refreshTokensCollection,
    authCodesCollection,
    db.OAuth2Clients,
    true
);


// setup the exported object.
oAuth2Server.oauthserver = oauthserver({
    model: meteorModel,
    grants: ['authorization_code'],
    debug: true
});

oAuth2Server.collections.accessToken = db.OAuth2AccessTokens;

// configure a url handler for the /steedos/oauth2/token path.
var app = express();

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.all('/oauth2/token', oAuth2Server.oauthserver.grant());
// 不应该给整个app设置全局的bodyParser，会影响cms正文字段summernote控件中的图片上传控件保存报错：request entity too large
app.all('/oauth2/token', bodyParser.urlencoded({ extended: true }), bodyParser.json(), oAuth2Server.oauthserver.grant());

WebApp.rawConnectHandlers.use(app);


/////////////////////
// Configure really basic identity service
////////////////////
JsonRoutes.Middleware.use(
    '/oauth2/getIdentity',
    oAuth2Server.oauthserver.authorise()
);

JsonRoutes.add('get', '/oauth2/getIdentity', function(req, res, next) {
    var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
    
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    var user = Meteor.users.findOne(accessToken.userId);

    JsonRoutes.sendResult(
        res,
        {
            data: {
                id: user._id,
                name: user.name,
                username: user.username
            }
        }
    );
});



////////////////////
// Meteor publish.
///////////////////
Meteor.publish(oAuth2Server.pubSubNames.authCodes, function() {
    if (!this.userId) {
        return this.ready();
    }

    return oAuth2Server.collections.authCode.find({
        userId: this.userId,
        expires: {
            $gt: new Date()
        }
    });
});

Meteor.publish(oAuth2Server.pubSubNames.refreshTokens, function() {
    if (!this.userId) {
        return this.ready();
    }

    return oAuth2Server.collections.refreshToken.find({
        userId: this.userId,
        expires: {
            $gt: new Date()
        }
    });
});

////////////
// configure the meteor methods.
//////////////
var methods = {};
methods[oAuth2Server.methodNames.authCodeGrant] = function(clientId, redirectUri, responseType, scope, state) {
    // validate parameters.
    check(clientId, String);
    check(redirectUri, String);
    check(responseType, String);
    check(scope, Match.Optional(Match.OneOf(null, [String])));
    check(state, Match.Optional(Match.OneOf(null, String)));

    if (!scope) {
        scope = [];
    }

    // validate the user is authenticated.
    var userId = this.userId;
    if (!userId) {
        return {
            success: false,
            error: 'User not authenticated.'
        };
    }

    // The oauth2-server project relies heavily on express to validate and
    // manipulate the oauth2 grant. A forthcoming version will abstract this
    // behaviour into promises.
    // That being the case, we need to get run an authorization grant as if
    // it were a promise. Warning, the following code is difficult to follow.
    // What we are doing is mocking and express app but never attaching it to
    // Meteor. This allows oauth2-server to behave as it would as if it was
    // natively attached to the webapp. The following code mocks express,
    // request, response, check and next in order to retrive the data we need.
    // Further, we are also running this in a synchronous manner. Enjoy! :)

    // create check callback that returns the user.
    var checkCallback = function (req, callback) {
        callback(
            null, // error.
            true, // user authorizes the code creation.
            {
                id: userId
            }
        );
    };

    // retrieve the grant function from oauth2-server. This method setups up the
    // this context and such. The returned method is what express would normally
    // expect when handling a URL. eg. function(req, res, next)
    var authCodeGrantFn = oAuth2Server.oauthserver.authCodeGrant(checkCallback);

    // make the grant function run synchronously.
    var authCodeGrantFnSync = Async.wrap(function (done) {
        // the return object.
        var response = {
            success: false,
            error: null,
            authorizationCode: null,
            redirectToUri: null
        };

        // create mock express app.
        var mockApp = express();
        var req = mockApp.request;

        // set the request body values. In a typical express setup, the body
        // would be parsed by the body-parser package. We are cutting out
        // the middle man, so to speak.
        req.body = {
            client_id: clientId,
            response_type: responseType,
            redirect_uri: redirectUri
        };
        req.query = {};

        // listen for redirect calls.
        var res = mockApp.response;
        res.redirect = function (uri) {
            response.redirectToUri = uri;

            // we have what we need, trigger the done function with the response data.
            done(null, response);
        };

        // listen for errors.
        var next = function (err) {
            response.error = err;

            // we have what we need, trigger the done function with the response data.
            done(null, response);
        };

        // call the async function with the mocked params.
        authCodeGrantFn(req, res, next);
    });

    // run the auth code grant function in a synchronous manner.
    var result = authCodeGrantFnSync();


    // update the success flag.
    result.success = !result.error && !(/[?&]error=/g).test(result.redirectToUri);

    // set the authorization code.
    if (result.redirectToUri) {
        var match = result.redirectToUri.match(/[?&]code=([0-9a-f]+)/);
        if (match.length > 1) {
            result.authorizationCode = match[1];
        }

        // add the state to the url.
        if (state) {
            result.redirectToUri += '&state=' + state;
        }
    }
//console.log(result);

    return result;
};

Meteor.methods(methods);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/steedos_oauth2-server/client/subscribe.coffee                                                        //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var subClients;
subClients = new SubsManager();
Meteor.startup(function () {
  return Tracker.autorun(function (c) {
    var client_id;

    if (subClients.ready()) {
      client_id = FlowRouter.getQueryParam("client_id");

      if (client_id) {
        return subClients.subscribe("OAuth2Clients", client_id);
      }
    }
  });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/steedos_oauth2-server/server/rest.coffee                                                             //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Cookies, Setup;
Cookies = Npm.require("cookies");
Setup = {};

Setup.clearAuthCookies = function (req, res) {
  var cookies, uri;
  cookies = new Cookies(req, res);
  cookies.set("X-User-Id");
  cookies.set("X-Auth-Token");
  cookies.set("X-Space-Id");
  cookies.set("X-Space-Token");

  if (req.headers.origin) {
    uri = new URI(req.headers.origin);
  } else if (req.headers.referer) {
    uri = new URI(req.headers.referer);
  }

  cookies.set("X-User-Id", "", {
    domain: uri != null ? uri.domain() : void 0,
    overwrite: true
  });
  cookies.set("X-Auth-Token", "", {
    domain: uri != null ? uri.domain() : void 0,
    overwrite: true
  });
  cookies.set("X-Space-Id", "", {
    domain: uri != null ? uri.domain() : void 0,
    overwrite: true
  });
  return cookies.set("X-Space-Token", "", {
    domain: uri != null ? uri.domain() : void 0,
    overwrite: true
  });
};

Setup.setAuthCookies = function (req, res, userId, authToken) {
  var cookies;
  cookies = new Cookies(req, res);
  cookies.set("X-User-Id", userId, {
    maxAge: 90 * 60 * 60 * 24 * 1000,
    httpOnly: false,
    overwrite: true
  });
  return cookies.set("X-Auth-Token", authToken, {
    maxAge: 90 * 60 * 60 * 24 * 1000,
    httpOnly: false,
    overwrite: true
  });
};

JsonRoutes.Middleware.use('/oauth2/sso', oAuth2Server.oauthserver.authorise());
JsonRoutes.add('get', '/oauth2/sso', function (req, res, next) {
  var accessToken, accessTokenStr, authToken, cookies, hashedToken, redirectUrl, ref, ref1, ref2, ref3, userId;
  redirectUrl = (req != null ? (ref = req.params) != null ? ref.redirect_url : void 0 : void 0) || (req != null ? (ref1 = req.query) != null ? ref1.redirect_url : void 0 : void 0) || '/';
  accessTokenStr = (req != null ? (ref2 = req.params) != null ? ref2.access_token : void 0 : void 0) || (req != null ? (ref3 = req.query) != null ? ref3.access_token : void 0 : void 0);
  accessToken = oAuth2Server.collections.accessToken.findOne({
    accessToken: accessTokenStr
  });
  cookies = new Cookies(req, res);
  userId = cookies.get("X-User-Id");
  authToken = cookies.get("X-Auth-Token");

  if (userId && authToken) {
    if (accessToken.userId !== userId) {
      Setup.clearAuthCookies(req, res);
      hashedToken = Accounts._hashLoginToken(authToken);
      Accounts.destroyToken(userId, hashedToken);
    } else {
      res.writeHead(301, {
        'Location': redirectUrl
      });
      return res.end('');
    }
  }

  authToken = Accounts._generateStampedLoginToken();
  hashedToken = Accounts._hashStampedToken(authToken);

  Accounts._insertHashedLoginToken(accessToken.userId, hashedToken);

  Setup.setAuthCookies(req, res, accessToken.userId, authToken.token);
  res.writeHead(301, {
    'Location': redirectUrl
  });
  return res.end('');
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/steedos_oauth2-server/server/publications/oauth2clients.coffee                                       //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
Meteor.publish("OAuth2Clients", function (clientId) {
  var collection;
  collection = oAuth2Server.collections.client;
  return collection.find({
    'clientId': clientId
  }, {
    fields: {
      clientName: 1
    }
  });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/steedos_oauth2-server/server/methods/oauth2authcodes.coffee                                          //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
Meteor.methods({
  isAuthorized: function (userId, clientId) {
    var count;
    count = authCodesCollection.find({
      'userId': userId,
      'clientId': clientId
    }).count();

    if (count > 0) {
      return true;
    } else {
      return false;
    }
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("steedos:oauth2-server", {
  oAuth2Server: oAuth2Server,
  Random: Random
});

})();

//# sourceURL=meteor://💻app/packages/steedos_oauth2-server.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3RlZWRvc19vYXV0aDItc2VydmVyL2NsaWVudC9zdWJzY3JpYmUuY29mZmVlIiwibWV0ZW9yOi8v8J+Su2FwcC9jbGllbnQvc3Vic2NyaWJlLmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3RlZWRvc19vYXV0aDItc2VydmVyL3NlcnZlci9yZXN0LmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL3Jlc3QuY29mZmVlIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zdGVlZG9zX29hdXRoMi1zZXJ2ZXIvc2VydmVyL3B1YmxpY2F0aW9ucy9vYXV0aDJjbGllbnRzLmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3RlZWRvc19vYXV0aDItc2VydmVyL3NlcnZlci9tZXRob2RzL29hdXRoMmF1dGhjb2Rlcy5jb2ZmZWUiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tZXRob2RzL29hdXRoMmF1dGhjb2Rlcy5jb2ZmZWUiXSwibmFtZXMiOlsic3ViQ2xpZW50cyIsIlN1YnNNYW5hZ2VyIiwiTWV0ZW9yIiwic3RhcnR1cCIsIlRyYWNrZXIiLCJhdXRvcnVuIiwiYyIsImNsaWVudF9pZCIsInJlYWR5IiwiRmxvd1JvdXRlciIsImdldFF1ZXJ5UGFyYW0iLCJzdWJzY3JpYmUiLCJDb29raWVzIiwiU2V0dXAiLCJOcG0iLCJyZXF1aXJlIiwiY2xlYXJBdXRoQ29va2llcyIsInJlcSIsInJlcyIsImNvb2tpZXMiLCJ1cmkiLCJzZXQiLCJoZWFkZXJzIiwib3JpZ2luIiwiVVJJIiwicmVmZXJlciIsImRvbWFpbiIsIm92ZXJ3cml0ZSIsInNldEF1dGhDb29raWVzIiwidXNlcklkIiwiYXV0aFRva2VuIiwibWF4QWdlIiwiaHR0cE9ubHkiLCJKc29uUm91dGVzIiwiTWlkZGxld2FyZSIsInVzZSIsIm9BdXRoMlNlcnZlciIsIm9hdXRoc2VydmVyIiwiYXV0aG9yaXNlIiwiYWRkIiwibmV4dCIsImFjY2Vzc1Rva2VuIiwiYWNjZXNzVG9rZW5TdHIiLCJoYXNoZWRUb2tlbiIsInJlZGlyZWN0VXJsIiwicmVmIiwicmVmMSIsInJlZjIiLCJyZWYzIiwicGFyYW1zIiwicmVkaXJlY3RfdXJsIiwicXVlcnkiLCJhY2Nlc3NfdG9rZW4iLCJjb2xsZWN0aW9ucyIsImZpbmRPbmUiLCJnZXQiLCJBY2NvdW50cyIsIl9oYXNoTG9naW5Ub2tlbiIsImRlc3Ryb3lUb2tlbiIsIndyaXRlSGVhZCIsImVuZCIsIl9nZW5lcmF0ZVN0YW1wZWRMb2dpblRva2VuIiwiX2hhc2hTdGFtcGVkVG9rZW4iLCJfaW5zZXJ0SGFzaGVkTG9naW5Ub2tlbiIsInRva2VuIiwicHVibGlzaCIsImNsaWVudElkIiwiY29sbGVjdGlvbiIsImNsaWVudCIsImZpbmQiLCJmaWVsZHMiLCJjbGllbnROYW1lIiwibWV0aG9kcyIsImlzQXV0aG9yaXplZCIsImNvdW50IiwiYXV0aENvZGVzQ29sbGVjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFBQSxVQUFBO0FBQUFBLGFBQWEsSUFBSUMsV0FBSixFQUFiO0FBRUFDLE9BQU9DLE9BQVAsQ0FBZTtBQ0diLFNERkRDLFFBQVFDLE9BQVIsQ0FBZ0IsVUFBQ0MsQ0FBRDtBQUNULFFBQUFDLFNBQUE7O0FBQUEsUUFBR1AsV0FBV1EsS0FBWCxFQUFIO0FBQ0lELGtCQUFZRSxXQUFXQyxhQUFYLENBQXlCLFdBQXpCLENBQVo7O0FBQ0EsVUFBR0gsU0FBSDtBQ0lKLGVESFFQLFdBQVdXLFNBQVgsQ0FBcUIsZUFBckIsRUFBcUNKLFNBQXJDLENDR1I7QUROQTtBQ1FIO0FEVEosSUNFQztBREhGLEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUVGQSxJQUFBSyxPQUFBLEVBQUFDLEtBQUE7QUFBQUQsVUFBVUUsSUFBSUMsT0FBSixDQUFZLFNBQVosQ0FBVjtBQUVBRixRQUFRLEVBQVI7O0FBRUFBLE1BQU1HLGdCQUFOLEdBQXlCLFVBQUNDLEdBQUQsRUFBTUMsR0FBTjtBQUN4QixNQUFBQyxPQUFBLEVBQUFDLEdBQUE7QUFBQUQsWUFBVSxJQUFJUCxPQUFKLENBQWFLLEdBQWIsRUFBa0JDLEdBQWxCLENBQVY7QUFDQUMsVUFBUUUsR0FBUixDQUFZLFdBQVo7QUFDQUYsVUFBUUUsR0FBUixDQUFZLGNBQVo7QUFDQUYsVUFBUUUsR0FBUixDQUFZLFlBQVo7QUFDQUYsVUFBUUUsR0FBUixDQUFZLGVBQVo7O0FBR0EsTUFBR0osSUFBSUssT0FBSixDQUFZQyxNQUFmO0FBQ0NILFVBQU0sSUFBSUksR0FBSixDQUFRUCxJQUFJSyxPQUFKLENBQVlDLE1BQXBCLENBQU47QUFERCxTQUVLLElBQUdOLElBQUlLLE9BQUosQ0FBWUcsT0FBZjtBQUNKTCxVQUFNLElBQUlJLEdBQUosQ0FBUVAsSUFBSUssT0FBSixDQUFZRyxPQUFwQixDQUFOO0FDRUM7O0FEQUZOLFVBQVFFLEdBQVIsQ0FBWSxXQUFaLEVBQXlCLEVBQXpCLEVBQ0M7QUFBQUssWUFBQU4sT0FBQSxPQUFRQSxJQUFLTSxNQUFMLEVBQVIsR0FBUSxNQUFSO0FBQ0FDLGVBQVc7QUFEWCxHQUREO0FBR0FSLFVBQVFFLEdBQVIsQ0FBWSxjQUFaLEVBQTRCLEVBQTVCLEVBQ0M7QUFBQUssWUFBQU4sT0FBQSxPQUFRQSxJQUFLTSxNQUFMLEVBQVIsR0FBUSxNQUFSO0FBQ0FDLGVBQVc7QUFEWCxHQUREO0FBR0FSLFVBQVFFLEdBQVIsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCLEVBQ0M7QUFBQUssWUFBQU4sT0FBQSxPQUFRQSxJQUFLTSxNQUFMLEVBQVIsR0FBUSxNQUFSO0FBQ0FDLGVBQVc7QUFEWCxHQUREO0FDT0MsU0RKRFIsUUFBUUUsR0FBUixDQUFZLGVBQVosRUFBNkIsRUFBN0IsRUFDQztBQUFBSyxZQUFBTixPQUFBLE9BQVFBLElBQUtNLE1BQUwsRUFBUixHQUFRLE1BQVI7QUFDQUMsZUFBVztBQURYLEdBREQsQ0NJQztBRDFCdUIsQ0FBekI7O0FBMEJBZCxNQUFNZSxjQUFOLEdBQXVCLFVBQUNYLEdBQUQsRUFBTUMsR0FBTixFQUFXVyxNQUFYLEVBQW1CQyxTQUFuQjtBQUN0QixNQUFBWCxPQUFBO0FBQUFBLFlBQVUsSUFBSVAsT0FBSixDQUFhSyxHQUFiLEVBQWtCQyxHQUFsQixDQUFWO0FBSUFDLFVBQVFFLEdBQVIsQ0FBWSxXQUFaLEVBQXlCUSxNQUF6QixFQUVDO0FBQUFFLFlBQVEsS0FBRyxFQUFILEdBQU0sRUFBTixHQUFTLEVBQVQsR0FBWSxJQUFwQjtBQUNBQyxjQUFVLEtBRFY7QUFFQUwsZUFBVztBQUZYLEdBRkQ7QUNTQyxTREpEUixRQUFRRSxHQUFSLENBQVksY0FBWixFQUE0QlMsU0FBNUIsRUFFQztBQUFBQyxZQUFRLEtBQUcsRUFBSCxHQUFNLEVBQU4sR0FBUyxFQUFULEdBQVksSUFBcEI7QUFDQUMsY0FBVSxLQURWO0FBRUFMLGVBQVc7QUFGWCxHQUZELENDSUM7QURkcUIsQ0FBdkI7O0FBZ0JBTSxXQUFXQyxVQUFYLENBQXNCQyxHQUF0QixDQUNDLGFBREQsRUFFQ0MsYUFBYUMsV0FBYixDQUF5QkMsU0FBekIsRUFGRDtBQUtBTCxXQUFXTSxHQUFYLENBQWUsS0FBZixFQUFzQixhQUF0QixFQUFxQyxVQUFDdEIsR0FBRCxFQUFNQyxHQUFOLEVBQVdzQixJQUFYO0FBRXBDLE1BQUFDLFdBQUEsRUFBQUMsY0FBQSxFQUFBWixTQUFBLEVBQUFYLE9BQUEsRUFBQXdCLFdBQUEsRUFBQUMsV0FBQSxFQUFBQyxHQUFBLEVBQUFDLElBQUEsRUFBQUMsSUFBQSxFQUFBQyxJQUFBLEVBQUFuQixNQUFBO0FBQUFlLGdCQUFBLENBQUEzQixPQUFBLFFBQUE0QixNQUFBNUIsSUFBQWdDLE1BQUEsWUFBQUosSUFBMkJLLFlBQTNCLEdBQTJCLE1BQTNCLEdBQTJCLE1BQTNCLE1BQWNqQyxPQUFBLFFBQUE2QixPQUFBN0IsSUFBQWtDLEtBQUEsWUFBQUwsS0FBeUNJLFlBQXpDLEdBQXlDLE1BQXpDLEdBQXlDLE1BQXZELEtBQXVFLEdBQXZFO0FBRUFSLG1CQUFBLENBQUF6QixPQUFBLFFBQUE4QixPQUFBOUIsSUFBQWdDLE1BQUEsWUFBQUYsS0FBOEJLLFlBQTlCLEdBQThCLE1BQTlCLEdBQThCLE1BQTlCLE1BQWlCbkMsT0FBQSxRQUFBK0IsT0FBQS9CLElBQUFrQyxLQUFBLFlBQUFILEtBQXlDSSxZQUF6QyxHQUF5QyxNQUF6QyxHQUF5QyxNQUExRDtBQUVBWCxnQkFBY0wsYUFBYWlCLFdBQWIsQ0FBeUJaLFdBQXpCLENBQXFDYSxPQUFyQyxDQUNiO0FBQUNiLGlCQUFhQztBQUFkLEdBRGEsQ0FBZDtBQUlBdkIsWUFBVSxJQUFJUCxPQUFKLENBQWFLLEdBQWIsRUFBa0JDLEdBQWxCLENBQVY7QUFDQVcsV0FBU1YsUUFBUW9DLEdBQVIsQ0FBWSxXQUFaLENBQVQ7QUFDQXpCLGNBQVlYLFFBQVFvQyxHQUFSLENBQVksY0FBWixDQUFaOztBQUdBLE1BQUcxQixVQUFXQyxTQUFkO0FBRUMsUUFBR1csWUFBWVosTUFBWixLQUFvQkEsTUFBdkI7QUFFQ2hCLFlBQU1HLGdCQUFOLENBQXVCQyxHQUF2QixFQUE0QkMsR0FBNUI7QUFDQXlCLG9CQUFjYSxTQUFTQyxlQUFULENBQXlCM0IsU0FBekIsQ0FBZDtBQUNBMEIsZUFBU0UsWUFBVCxDQUFzQjdCLE1BQXRCLEVBQThCYyxXQUE5QjtBQUpEO0FBTUN6QixVQUFJeUMsU0FBSixDQUFjLEdBQWQsRUFBbUI7QUFBQyxvQkFBWWY7QUFBYixPQUFuQjtBQUNBLGFBQU8xQixJQUFJMEMsR0FBSixDQUFRLEVBQVIsQ0FBUDtBQVRGO0FDUUU7O0FER0Y5QixjQUFZMEIsU0FBU0ssMEJBQVQsRUFBWjtBQUNBbEIsZ0JBQWNhLFNBQVNNLGlCQUFULENBQTJCaEMsU0FBM0IsQ0FBZDs7QUFDQTBCLFdBQVNPLHVCQUFULENBQWlDdEIsWUFBWVosTUFBN0MsRUFBb0RjLFdBQXBEOztBQUNBOUIsUUFBTWUsY0FBTixDQUFxQlgsR0FBckIsRUFBeUJDLEdBQXpCLEVBQTZCdUIsWUFBWVosTUFBekMsRUFBZ0RDLFVBQVVrQyxLQUExRDtBQUNBOUMsTUFBSXlDLFNBQUosQ0FBYyxHQUFkLEVBQW1CO0FBQUMsZ0JBQVlmO0FBQWIsR0FBbkI7QUFDQSxTQUFPMUIsSUFBSTBDLEdBQUosQ0FBUSxFQUFSLENBQVA7QUEvQkQsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBRW5EQTFELE9BQU8rRCxPQUFQLENBQWUsZUFBZixFQUFnQyxVQUFDQyxRQUFEO0FBQy9CLE1BQUFDLFVBQUE7QUFBQUEsZUFBYS9CLGFBQWFpQixXQUFiLENBQXlCZSxNQUF0QztBQUNBLFNBQU9ELFdBQVdFLElBQVgsQ0FBZ0I7QUFBQyxnQkFBWUg7QUFBYixHQUFoQixFQUF3QztBQUFDSSxZQUFPO0FBQUNDLGtCQUFXO0FBQVo7QUFBUixHQUF4QyxDQUFQO0FBRkQsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBckUsT0FBT3NFLE9BQVAsQ0FDQztBQUFBQyxnQkFBYyxVQUFDNUMsTUFBRCxFQUFRcUMsUUFBUjtBQUNQLFFBQUFRLEtBQUE7QUFBQUEsWUFBUUMsb0JBQW9CTixJQUFwQixDQUF5QjtBQUFDLGdCQUFTeEMsTUFBVjtBQUFpQixrQkFBV3FDO0FBQTVCLEtBQXpCLEVBQWdFUSxLQUFoRSxFQUFSOztBQUNBLFFBQUdBLFFBQVEsQ0FBWDtBQUNJLGFBQU8sSUFBUDtBQURKO0FBR0ksYUFBTyxLQUFQO0FDS1A7QURWSjtBQUFBLENBREQsRSIsImZpbGUiOiIvcGFja2FnZXMvc3RlZWRvc19vYXV0aDItc2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsic3ViQ2xpZW50cyA9IG5ldyBTdWJzTWFuYWdlcigpXHJcblxyXG5NZXRlb3Iuc3RhcnR1cCAtPlxyXG5cdFRyYWNrZXIuYXV0b3J1biAoYyktPlxyXG4gICAgICAgIGlmIHN1YkNsaWVudHMucmVhZHkoKVxyXG4gICAgICAgICAgICBjbGllbnRfaWQgPSBGbG93Um91dGVyLmdldFF1ZXJ5UGFyYW0oXCJjbGllbnRfaWRcIilcclxuICAgICAgICAgICAgaWYgY2xpZW50X2lkXHJcbiAgICAgICAgICAgICAgICBzdWJDbGllbnRzLnN1YnNjcmliZSBcIk9BdXRoMkNsaWVudHNcIixjbGllbnRfaWQiLCJ2YXIgc3ViQ2xpZW50cztcblxuc3ViQ2xpZW50cyA9IG5ldyBTdWJzTWFuYWdlcigpO1xuXG5NZXRlb3Iuc3RhcnR1cChmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFRyYWNrZXIuYXV0b3J1bihmdW5jdGlvbihjKSB7XG4gICAgdmFyIGNsaWVudF9pZDtcbiAgICBpZiAoc3ViQ2xpZW50cy5yZWFkeSgpKSB7XG4gICAgICBjbGllbnRfaWQgPSBGbG93Um91dGVyLmdldFF1ZXJ5UGFyYW0oXCJjbGllbnRfaWRcIik7XG4gICAgICBpZiAoY2xpZW50X2lkKSB7XG4gICAgICAgIHJldHVybiBzdWJDbGllbnRzLnN1YnNjcmliZShcIk9BdXRoMkNsaWVudHNcIiwgY2xpZW50X2lkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSk7XG4iLCJDb29raWVzID0gTnBtLnJlcXVpcmUoXCJjb29raWVzXCIpXHJcblxyXG5TZXR1cCA9IHt9XHJcblxyXG5TZXR1cC5jbGVhckF1dGhDb29raWVzID0gKHJlcSwgcmVzKSAtPlxyXG5cdGNvb2tpZXMgPSBuZXcgQ29va2llcyggcmVxLCByZXMgKVxyXG5cdGNvb2tpZXMuc2V0KFwiWC1Vc2VyLUlkXCIpXHJcblx0Y29va2llcy5zZXQoXCJYLUF1dGgtVG9rZW5cIilcclxuXHRjb29raWVzLnNldChcIlgtU3BhY2UtSWRcIilcclxuXHRjb29raWVzLnNldChcIlgtU3BhY2UtVG9rZW5cIilcclxuXHJcblx0IyDpop3lpJbmuIXpmaTogIHnmoRkb21haW7kuIvnmoRjb29raWVcclxuXHRpZiByZXEuaGVhZGVycy5vcmlnaW5cclxuXHRcdHVyaSA9IG5ldyBVUkkocmVxLmhlYWRlcnMub3JpZ2luKVxyXG5cdGVsc2UgaWYgcmVxLmhlYWRlcnMucmVmZXJlclxyXG5cdFx0dXJpID0gbmV3IFVSSShyZXEuaGVhZGVycy5yZWZlcmVyKVxyXG5cclxuXHRjb29raWVzLnNldCBcIlgtVXNlci1JZFwiLCBcIlwiLFxyXG5cdFx0ZG9tYWluOiB1cmk/LmRvbWFpbigpLFxyXG5cdFx0b3ZlcndyaXRlOiB0cnVlXHJcblx0Y29va2llcy5zZXQgXCJYLUF1dGgtVG9rZW5cIiwgXCJcIixcclxuXHRcdGRvbWFpbjogdXJpPy5kb21haW4oKSxcclxuXHRcdG92ZXJ3cml0ZTogdHJ1ZVxyXG5cdGNvb2tpZXMuc2V0IFwiWC1TcGFjZS1JZFwiLCBcIlwiLFxyXG5cdFx0ZG9tYWluOiB1cmk/LmRvbWFpbigpLFxyXG5cdFx0b3ZlcndyaXRlOiB0cnVlXHJcblx0Y29va2llcy5zZXQgXCJYLVNwYWNlLVRva2VuXCIsIFwiXCIsXHJcblx0XHRkb21haW46IHVyaT8uZG9tYWluKCksXHJcblx0XHRvdmVyd3JpdGU6IHRydWVcclxuXHJcblNldHVwLnNldEF1dGhDb29raWVzID0gKHJlcSwgcmVzLCB1c2VySWQsIGF1dGhUb2tlbikgLT5cclxuXHRjb29raWVzID0gbmV3IENvb2tpZXMoIHJlcSwgcmVzIClcclxuXHQjIHNldCBjb29raWUgdG8gcmVzcG9uc2VcclxuXHQjIG1heEFnZSAzIG1vbnRoXHJcblx0IyB1cmkgPSBuZXcgVVJJKHJlcS5oZWFkZXJzLm9yaWdpbik7XHJcblx0Y29va2llcy5zZXQgXCJYLVVzZXItSWRcIiwgdXNlcklkLFxyXG5cdFx0IyBkb21haW46IHVyaS5kb21haW4oKSxcclxuXHRcdG1heEFnZTogOTAqNjAqNjAqMjQqMTAwMCxcclxuXHRcdGh0dHBPbmx5OiBmYWxzZVxyXG5cdFx0b3ZlcndyaXRlOiB0cnVlXHJcblx0Y29va2llcy5zZXQgXCJYLUF1dGgtVG9rZW5cIiwgYXV0aFRva2VuLFxyXG5cdFx0IyBkb21haW46IHVyaS5kb21haW4oKSxcclxuXHRcdG1heEFnZTogOTAqNjAqNjAqMjQqMTAwMCxcclxuXHRcdGh0dHBPbmx5OiBmYWxzZVxyXG5cdFx0b3ZlcndyaXRlOiB0cnVlXHJcblxyXG5Kc29uUm91dGVzLk1pZGRsZXdhcmUudXNlKFxyXG5cdCcvb2F1dGgyL3NzbycsXHJcblx0b0F1dGgyU2VydmVyLm9hdXRoc2VydmVyLmF1dGhvcmlzZSgpXHJcbilcclxuXHJcbkpzb25Sb3V0ZXMuYWRkICdnZXQnLCAnL29hdXRoMi9zc28nLCAocmVxLCByZXMsIG5leHQpLT5cclxuXHJcblx0cmVkaXJlY3RVcmwgPSByZXE/LnBhcmFtcz8ucmVkaXJlY3RfdXJsIHx8IHJlcT8ucXVlcnk/LnJlZGlyZWN0X3VybCB8fCAnLydcclxuXHRcclxuXHRhY2Nlc3NUb2tlblN0ciA9IHJlcT8ucGFyYW1zPy5hY2Nlc3NfdG9rZW4gfHwgcmVxPy5xdWVyeT8uYWNjZXNzX3Rva2VuXHJcblx0XHJcblx0YWNjZXNzVG9rZW4gPSBvQXV0aDJTZXJ2ZXIuY29sbGVjdGlvbnMuYWNjZXNzVG9rZW4uZmluZE9uZShcclxuXHRcdHthY2Nlc3NUb2tlbjogYWNjZXNzVG9rZW5TdHJ9XHJcblx0KVxyXG5cdFxyXG5cdGNvb2tpZXMgPSBuZXcgQ29va2llcyggcmVxLCByZXMgKTtcclxuXHR1c2VySWQgPSBjb29raWVzLmdldChcIlgtVXNlci1JZFwiKVxyXG5cdGF1dGhUb2tlbiA9IGNvb2tpZXMuZ2V0KFwiWC1BdXRoLVRva2VuXCIpXHJcblxyXG5cdCMg5aaC5p6c5pys5Zyw5bey57uP5pyJY29va2llc1xyXG5cdGlmIHVzZXJJZCBhbmQgYXV0aFRva2VuXHJcblx0XHQjIOavlOi+g+acrOWcsOaVsOaNruWSjOW9k+WJjeeUqOaIt+aYr+WQpuS4gOiHtFxyXG5cdFx0aWYgYWNjZXNzVG9rZW4udXNlcklkIT11c2VySWRcclxuXHRcdFx0IyDkuI3kuIDoh7TvvIzmuIXpmaTkv6Hmga9cclxuXHRcdFx0U2V0dXAuY2xlYXJBdXRoQ29va2llcyhyZXEsIHJlcylcclxuXHRcdFx0aGFzaGVkVG9rZW4gPSBBY2NvdW50cy5faGFzaExvZ2luVG9rZW4oYXV0aFRva2VuKVxyXG5cdFx0XHRBY2NvdW50cy5kZXN0cm95VG9rZW4odXNlcklkLCBoYXNoZWRUb2tlbilcclxuXHRcdGVsc2VcclxuXHRcdFx0cmVzLndyaXRlSGVhZCAzMDEsIHsnTG9jYXRpb24nOiByZWRpcmVjdFVybCB9XHJcblx0XHRcdHJldHVybiByZXMuZW5kICcnXHJcblx0IyDpqozor4HmiJDlip/vvIznmbvlvZVcclxuXHRhdXRoVG9rZW4gPSBBY2NvdW50cy5fZ2VuZXJhdGVTdGFtcGVkTG9naW5Ub2tlbigpXHJcblx0aGFzaGVkVG9rZW4gPSBBY2NvdW50cy5faGFzaFN0YW1wZWRUb2tlbiBhdXRoVG9rZW5cclxuXHRBY2NvdW50cy5faW5zZXJ0SGFzaGVkTG9naW5Ub2tlbiBhY2Nlc3NUb2tlbi51c2VySWQsaGFzaGVkVG9rZW5cclxuXHRTZXR1cC5zZXRBdXRoQ29va2llcyByZXEscmVzLGFjY2Vzc1Rva2VuLnVzZXJJZCxhdXRoVG9rZW4udG9rZW5cclxuXHRyZXMud3JpdGVIZWFkIDMwMSwgeydMb2NhdGlvbic6IHJlZGlyZWN0VXJsIH1cclxuXHRyZXR1cm4gcmVzLmVuZCAnJ1xyXG5cclxuXHJcblxyXG4iLCJ2YXIgQ29va2llcywgU2V0dXA7XG5cbkNvb2tpZXMgPSBOcG0ucmVxdWlyZShcImNvb2tpZXNcIik7XG5cblNldHVwID0ge307XG5cblNldHVwLmNsZWFyQXV0aENvb2tpZXMgPSBmdW5jdGlvbihyZXEsIHJlcykge1xuICB2YXIgY29va2llcywgdXJpO1xuICBjb29raWVzID0gbmV3IENvb2tpZXMocmVxLCByZXMpO1xuICBjb29raWVzLnNldChcIlgtVXNlci1JZFwiKTtcbiAgY29va2llcy5zZXQoXCJYLUF1dGgtVG9rZW5cIik7XG4gIGNvb2tpZXMuc2V0KFwiWC1TcGFjZS1JZFwiKTtcbiAgY29va2llcy5zZXQoXCJYLVNwYWNlLVRva2VuXCIpO1xuICBpZiAocmVxLmhlYWRlcnMub3JpZ2luKSB7XG4gICAgdXJpID0gbmV3IFVSSShyZXEuaGVhZGVycy5vcmlnaW4pO1xuICB9IGVsc2UgaWYgKHJlcS5oZWFkZXJzLnJlZmVyZXIpIHtcbiAgICB1cmkgPSBuZXcgVVJJKHJlcS5oZWFkZXJzLnJlZmVyZXIpO1xuICB9XG4gIGNvb2tpZXMuc2V0KFwiWC1Vc2VyLUlkXCIsIFwiXCIsIHtcbiAgICBkb21haW46IHVyaSAhPSBudWxsID8gdXJpLmRvbWFpbigpIDogdm9pZCAwLFxuICAgIG92ZXJ3cml0ZTogdHJ1ZVxuICB9KTtcbiAgY29va2llcy5zZXQoXCJYLUF1dGgtVG9rZW5cIiwgXCJcIiwge1xuICAgIGRvbWFpbjogdXJpICE9IG51bGwgPyB1cmkuZG9tYWluKCkgOiB2b2lkIDAsXG4gICAgb3ZlcndyaXRlOiB0cnVlXG4gIH0pO1xuICBjb29raWVzLnNldChcIlgtU3BhY2UtSWRcIiwgXCJcIiwge1xuICAgIGRvbWFpbjogdXJpICE9IG51bGwgPyB1cmkuZG9tYWluKCkgOiB2b2lkIDAsXG4gICAgb3ZlcndyaXRlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gY29va2llcy5zZXQoXCJYLVNwYWNlLVRva2VuXCIsIFwiXCIsIHtcbiAgICBkb21haW46IHVyaSAhPSBudWxsID8gdXJpLmRvbWFpbigpIDogdm9pZCAwLFxuICAgIG92ZXJ3cml0ZTogdHJ1ZVxuICB9KTtcbn07XG5cblNldHVwLnNldEF1dGhDb29raWVzID0gZnVuY3Rpb24ocmVxLCByZXMsIHVzZXJJZCwgYXV0aFRva2VuKSB7XG4gIHZhciBjb29raWVzO1xuICBjb29raWVzID0gbmV3IENvb2tpZXMocmVxLCByZXMpO1xuICBjb29raWVzLnNldChcIlgtVXNlci1JZFwiLCB1c2VySWQsIHtcbiAgICBtYXhBZ2U6IDkwICogNjAgKiA2MCAqIDI0ICogMTAwMCxcbiAgICBodHRwT25seTogZmFsc2UsXG4gICAgb3ZlcndyaXRlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gY29va2llcy5zZXQoXCJYLUF1dGgtVG9rZW5cIiwgYXV0aFRva2VuLCB7XG4gICAgbWF4QWdlOiA5MCAqIDYwICogNjAgKiAyNCAqIDEwMDAsXG4gICAgaHR0cE9ubHk6IGZhbHNlLFxuICAgIG92ZXJ3cml0ZTogdHJ1ZVxuICB9KTtcbn07XG5cbkpzb25Sb3V0ZXMuTWlkZGxld2FyZS51c2UoJy9vYXV0aDIvc3NvJywgb0F1dGgyU2VydmVyLm9hdXRoc2VydmVyLmF1dGhvcmlzZSgpKTtcblxuSnNvblJvdXRlcy5hZGQoJ2dldCcsICcvb2F1dGgyL3NzbycsIGZ1bmN0aW9uKHJlcSwgcmVzLCBuZXh0KSB7XG4gIHZhciBhY2Nlc3NUb2tlbiwgYWNjZXNzVG9rZW5TdHIsIGF1dGhUb2tlbiwgY29va2llcywgaGFzaGVkVG9rZW4sIHJlZGlyZWN0VXJsLCByZWYsIHJlZjEsIHJlZjIsIHJlZjMsIHVzZXJJZDtcbiAgcmVkaXJlY3RVcmwgPSAocmVxICE9IG51bGwgPyAocmVmID0gcmVxLnBhcmFtcykgIT0gbnVsbCA/IHJlZi5yZWRpcmVjdF91cmwgOiB2b2lkIDAgOiB2b2lkIDApIHx8IChyZXEgIT0gbnVsbCA/IChyZWYxID0gcmVxLnF1ZXJ5KSAhPSBudWxsID8gcmVmMS5yZWRpcmVjdF91cmwgOiB2b2lkIDAgOiB2b2lkIDApIHx8ICcvJztcbiAgYWNjZXNzVG9rZW5TdHIgPSAocmVxICE9IG51bGwgPyAocmVmMiA9IHJlcS5wYXJhbXMpICE9IG51bGwgPyByZWYyLmFjY2Vzc190b2tlbiA6IHZvaWQgMCA6IHZvaWQgMCkgfHwgKHJlcSAhPSBudWxsID8gKHJlZjMgPSByZXEucXVlcnkpICE9IG51bGwgPyByZWYzLmFjY2Vzc190b2tlbiA6IHZvaWQgMCA6IHZvaWQgMCk7XG4gIGFjY2Vzc1Rva2VuID0gb0F1dGgyU2VydmVyLmNvbGxlY3Rpb25zLmFjY2Vzc1Rva2VuLmZpbmRPbmUoe1xuICAgIGFjY2Vzc1Rva2VuOiBhY2Nlc3NUb2tlblN0clxuICB9KTtcbiAgY29va2llcyA9IG5ldyBDb29raWVzKHJlcSwgcmVzKTtcbiAgdXNlcklkID0gY29va2llcy5nZXQoXCJYLVVzZXItSWRcIik7XG4gIGF1dGhUb2tlbiA9IGNvb2tpZXMuZ2V0KFwiWC1BdXRoLVRva2VuXCIpO1xuICBpZiAodXNlcklkICYmIGF1dGhUb2tlbikge1xuICAgIGlmIChhY2Nlc3NUb2tlbi51c2VySWQgIT09IHVzZXJJZCkge1xuICAgICAgU2V0dXAuY2xlYXJBdXRoQ29va2llcyhyZXEsIHJlcyk7XG4gICAgICBoYXNoZWRUb2tlbiA9IEFjY291bnRzLl9oYXNoTG9naW5Ub2tlbihhdXRoVG9rZW4pO1xuICAgICAgQWNjb3VudHMuZGVzdHJveVRva2VuKHVzZXJJZCwgaGFzaGVkVG9rZW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMud3JpdGVIZWFkKDMwMSwge1xuICAgICAgICAnTG9jYXRpb24nOiByZWRpcmVjdFVybFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzLmVuZCgnJyk7XG4gICAgfVxuICB9XG4gIGF1dGhUb2tlbiA9IEFjY291bnRzLl9nZW5lcmF0ZVN0YW1wZWRMb2dpblRva2VuKCk7XG4gIGhhc2hlZFRva2VuID0gQWNjb3VudHMuX2hhc2hTdGFtcGVkVG9rZW4oYXV0aFRva2VuKTtcbiAgQWNjb3VudHMuX2luc2VydEhhc2hlZExvZ2luVG9rZW4oYWNjZXNzVG9rZW4udXNlcklkLCBoYXNoZWRUb2tlbik7XG4gIFNldHVwLnNldEF1dGhDb29raWVzKHJlcSwgcmVzLCBhY2Nlc3NUb2tlbi51c2VySWQsIGF1dGhUb2tlbi50b2tlbik7XG4gIHJlcy53cml0ZUhlYWQoMzAxLCB7XG4gICAgJ0xvY2F0aW9uJzogcmVkaXJlY3RVcmxcbiAgfSk7XG4gIHJldHVybiByZXMuZW5kKCcnKTtcbn0pO1xuIiwiTWV0ZW9yLnB1Ymxpc2ggXCJPQXV0aDJDbGllbnRzXCIsIChjbGllbnRJZCktPlxyXG5cdGNvbGxlY3Rpb24gPSBvQXV0aDJTZXJ2ZXIuY29sbGVjdGlvbnMuY2xpZW50XHJcblx0cmV0dXJuIGNvbGxlY3Rpb24uZmluZCh7J2NsaWVudElkJzogY2xpZW50SWR9LCB7ZmllbGRzOntjbGllbnROYW1lOjF9fSkiLCJNZXRlb3IubWV0aG9kc1xyXG5cdGlzQXV0aG9yaXplZDogKHVzZXJJZCxjbGllbnRJZCkgLT5cclxuICAgICAgICBjb3VudCA9IGF1dGhDb2Rlc0NvbGxlY3Rpb24uZmluZCh7J3VzZXJJZCc6dXNlcklkLCdjbGllbnRJZCc6Y2xpZW50SWR9KS5jb3VudCgpXHJcbiAgICAgICAgaWYgY291bnQgPiAwXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UiLCJNZXRlb3IubWV0aG9kcyh7XG4gIGlzQXV0aG9yaXplZDogZnVuY3Rpb24odXNlcklkLCBjbGllbnRJZCkge1xuICAgIHZhciBjb3VudDtcbiAgICBjb3VudCA9IGF1dGhDb2Rlc0NvbGxlY3Rpb24uZmluZCh7XG4gICAgICAndXNlcklkJzogdXNlcklkLFxuICAgICAgJ2NsaWVudElkJzogY2xpZW50SWRcbiAgICB9KS5jb3VudCgpO1xuICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59KTtcbiJdfQ==
