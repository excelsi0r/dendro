var Config = function() { return GLOBAL.Config; }();
var Class = require(Config.absPathInSrcFolder("/models/meta/class.js")).Class;

function Upload (object)
{
    Upload.baseConstructor.call(this, object);

    var self = this;
    var uuid = require('node-uuid');

    if( object.username != null
        &&
        object.filename != null
        &&
        object.parent_folder != null
    )
    {
        self.username = object.username;
        self.filename = object.filename;
        self.parentFolder = object.parent_folder;

        if(self.loaded == null){
            self.loaded = 0;
        }
        else
        {
            self.loaded = object.loaded;
        }

        self.id = uuid.v4();
    }

    return self;
}

Upload.prototype.set_expected = function(expected)
{
    var self = this;
    self.expected = expected;
}

Upload.isFinished = function()
{
    var self = this;
    return (self.loaded >= self.expected);
}

Upload = Class.extend(Upload, Class);

module.exports.Upload = Upload;