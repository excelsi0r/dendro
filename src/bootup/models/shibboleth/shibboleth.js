const slug = require("slug");
const path = require("path");

const Pathfinder = global.Pathfinder;
const isNull = require(Pathfinder.absPathInSrcFolder("/utils/null.js")).isNull;
const Logger = require(Pathfinder.absPathInSrcFolder("utils/logger.js")).Logger;

const Config = require(Pathfinder.absPathInSrcFolder("models/meta/config.js")).Config;
const _ = require("underscore");
const fs = require("fs");

class Shibboleth
{
    constructor (shibbolethConfig)
    {
        try
        {
            this.__CALLBACK_URL = shibbolethConfig.CALLBACK_URL;
            this.__ENTRY_POINT = shibbolethConfig.ENTRY_POINT;
            this.__ISSUER = shibbolethConfig.ISSUER;
            this.__SESSION_SECRET = shibbolethConfig.SESSION_SECRET;
            this.__button_text = shibbolethConfig.button_text;

            /*
            this.__idp_cert = shibbolethConfig.idp_cert;
            this.__key = shibbolethConfig.key;
            this.__cert = shibbolethConfig.cert;
            */

            this.__idp_cert = fs.readFileSync(shibbolethConfig.idp_cert_path);
            this.__key = fs.readFileSync(shibbolethConfig.key_path);
            this.__cert = fs.readFileSync(shibbolethConfig.cert_path);
        }
        catch (error)
        {
            throw error;
        }
    }


    /*
    addNewSocket (newSocket)
    {
        let self = this;
        self.__sockets.push(newSocket);
        Logger.log("info", "Num connectedSockets for user " + self.__userUri + " : " + self.__sockets.length);
    };
    */
}

module.exports.Shibboleth = Shibboleth;
