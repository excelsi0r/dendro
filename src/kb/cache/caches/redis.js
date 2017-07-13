const util = require('util');
const path = require('path');
const Pathfinder = require(path.join(process.cwd(), "src", "models", "meta", "pathfinder.js")).Pathfinder;
const Config = require(path.join(process.cwd(), "src", "models", "meta", "config.js")).Config;

const isNull = require(Pathfinder.absPathInSrcFolder("/utils/null.js")).isNull;
const colors = require('colors');
const redis = require('redis');

function RedisCache (options)
{
    const self = this;
    self.options = options;

    self.databaseNumber = options.databaseNumber;
    self.port = options.port;
    self.host = options.host;
    self.id = options.id;
}

RedisCache.prototype.openConnection = function(callback) {
    const self = this;

    if(Config.cache.active)
    {
        if(!isNull(self.redis))
        {
            return callback(1, "Redis connection is already open.");
        }
        else
        {
            self.redis = redis.createClient(self.options);

            const registerConnectionCallbacks = function (err) {

                /*self.redis.on('connect', function ()
                {
                    console.log('Redis client connected');
                    return callback(null, self);
                });*/

                self.redis.on('ready', function ()
                {
                    return callback(null, self);
                });

                self.redis.on('error', function (err)
                {
                    const msg = 'Error connecting to Redis client ' + JSON.stringify(err);
                    console.error(msg);
                    return callback(err, msg);
                });
            };

            if (!isNull(self.databaseNumber))
            {
                registerConnectionCallbacks();
                self.redis.select(self.databaseNumber, function ()
                {
                    console.log("Redis client switched to database number " + self.databaseNumber);
                });
            }
            else
            {
                registerConnectionCallbacks();
            }
        }
    }
    else
    {
        return callback(null, null);
    }
};

RedisCache.prototype.closeConnection = function(cb)
{
    let self = this;
    self.redis.end(true);
    cb(null, null);
};

RedisCache.prototype.put = function(resourceUri, object, callback) {
    const self = this;

    if(Config.cache.active)
    {
        if(!isNull(object))
        {
            if(!isNull(self.redis))
            {
                self.redis.set(resourceUri, JSON.stringify(object), function(err, reply)
                {
                    if(isNull(err))
                    {
                        if (Config.debug.active && Config.debug.cache.log_cache_writes)
                        {
                            console.log("[DEBUG] Saved cache record for " + resourceUri);
                        }

                        return callback(null);
                    }
                    else
                    {
                        return callback(1, "Unable to set value of " + resourceUri + " as " + JSON.stringify(object) + " into redis cache");
                    }
                })
            }
            else
            {
                return callback(1, "Tried to save a resource into cache providing a null object!");
            }
        }
        else
        {
            return callback(null, null);
        }
    }
    else
    {
        return callback(null, null);
    }
};

RedisCache.prototype.get = function(resourceUri, callback) {
    const self = this;

    if(Config.cache.active)
    {

        if(!isNull(self.redis))
        {
            if(!isNull(resourceUri))
            {
                self.redis.get(resourceUri, function(err, cachedJSON)
                {
                    if(isNull(err))
                    {
                        if(Config.cache.active && Config.debug.cache.log_cache_hits)
                        {
                            if(!isNull(cachedJSON))
                            {
                                console.log("Cache HIT on " + resourceUri);
                            }
                            else
                            {
                                console.log("Cache MISS on " + resourceUri);
                            }
                        }

                        return callback(null, JSON.parse(cachedJSON));
                    }
                    else
                    {
                        return callback(err, "Unable to retrieve value of " + resourceUri + " as " + JSON.stringify(object) + " from redis cache");
                    }
                });
            }
            else
            {
                return callback(1, "Tried to fetch a resource from cache providing a null resourceUri!");
            }
        }
        else
        {
            return callback(1, "Must open connection to Redis first!");
        }
    }
    else
    {
        return callback(null, null);
    }
};

RedisCache.prototype.delete = function(resourceUriOrArrayOfResourceUris, callback) {
    const self = this;

    if(Config.cache.active)
    {
        if(!isNull(self.redis))
        {
            if(!isNull(resourceUriOrArrayOfResourceUris))
            {
                self.redis.del(resourceUriOrArrayOfResourceUris, function (err)
                {
                    if(isNull(err))
                    {
                        if (Config.debug.active && Config.debug.cache.log_cache_deletes)
                        {
                            console.log("[DEBUG] Deleted cache records for " + JSON.stringify(resourceUriOrArrayOfResourceUris));
                        }

                        return callback(null, null);
                    }
                    else
                    {
                        const msg = "Unable to delete resource " + resourceUriOrArrayOfResourceUris + " from redis cache. " + err;
                        console.log(msg);
                        return callback(err, msg);
                    }
                });
            }
            else
            {
                return callback(1, "Tried to delete resources in cache with null uri array");
            }
        }
        else
        {
            return callback(1, "Must open connection to Redis first!");
        }
    }
    else
    {
        return callback(null, null);
    }
};

RedisCache.prototype.deleteAll = function(callback) {
    const self = this;

    if(Config.cache.active)
    {

        if(!isNull(self.redis))
        {
            self.redis.flushdb(function (err)
            {
                if(isNull(err))
                {
                    if (Config.debug.active && Config.debug.cache.log_cache_deletes)
                    {
                        console.log("[DEBUG] Deleted ALL cache records");
                    }

                    return callback(null);
                }
                else
                {
                    const msg = "Unable to delete database number " + self.databaseNumber + " : " + JSON.stringify(err);
                    console.log(msg);
                    return callback(err, msg);
                }
            });
        }
        else
        {
            return callback(1, "Must open connection to Redis first!");
        }
    }
    else
    {
        return callback(null, null);
    }

};

RedisCache.default = {};

RedisCache.type = "redis";

module.exports.RedisCache = RedisCache;
