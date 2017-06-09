var Config = function() { return GLOBAL.Config; }();
var Class = require(Config.absPathInSrcFolder("/models/meta/class.js")).Class;
var Descriptor = require(Config.absPathInSrcFolder("/models/meta/descriptor.js")).Descriptor;
var Post = require(Config.absPathInSrcFolder("/models/social/post.js")).Post;
var DbConnection = require(Config.absPathInSrcFolder("/kb/db.js")).DbConnection;
var uuid = require('uuid');

var db = function() { return GLOBAL.db.default; }();
var db_social = function() { return GLOBAL.db.social; }();

var gfs = function() { return GLOBAL.gfs.default; }();
var _ = require('underscore');
var async = require('async');

function MetadataChangePost (object)
{
    MetadataChangePost.baseConstructor.call(this, object);
    var self = this;

    if(object.uri != null)
    {
        self.uri = object.uri;
    }
    else
    {
        self.uri = Config.baseUri + "/posts/" + uuid.v4();
    }

    self.copyOrInitDescriptors(object);

    self.rdf.type = "ddr:MetadataChangePost";

    self.ddr.numLikes = 0;

    var descriptor = new Descriptor ({
        prefixedForm : "rdf:type",
        type : DbConnection.prefixedResource,
        value : "ddr:Post"
    });

    self.insertDescriptors([descriptor], function(err, result){
        return self;
    }, db_social.graphUri);
}

MetadataChangePost.buildFromArchivedVersion = function (archivedVersion, project, callback) {
    //CREATE A POST FOR EACH ARCHIVED VERSION CHANGE
    //DON'T SAVE IT HERE
    var changeAuthor = archivedVersion.ddr.versionCreator;
    var numberOfChanges = archivedVersion.changes.length;
    var changesSortedByType = _.groupBy(archivedVersion.changes, function(change){ return change.ddr.changeType;});
    var hasNumberOfDescriptorsAdded = changesSortedByType.add ? changesSortedByType.add.length : 0;
    var hasNumberOfDescriptorsEdited = changesSortedByType.edit ? changesSortedByType.edit.length : 0;
    var hasNumberOfDescriptorsDeleted = changesSortedByType.delete ? changesSortedByType.delete.length : 0;
    var title = changeAuthor.split("/").pop() + " worked on " + numberOfChanges + " metadata changes";
    var versionUri = archivedVersion.uri;

    async.map(changesSortedByType, function(changeType, callback)
    {
        callback(null, changeType[0]);
    }, function(err, results){
        //Add to the post the number of changes added, edited, deleted
        //the number of changes total
        //the version uri for the full details
        //TODO MAYBE ADD THE URI OF THE RESOURCE????
        var newMetadataChangePost = new MetadataChangePost({
            ddr: {
                //hasContent: JSON.stringify(results),//substituir por sharedContent da SocialMediaMetadataChangePosting http://schema.org/SocialMediaMetadataChangePosting -> fazer JSON.parse depois para aceder
                numLikes: 0,//isto não é necessário aqui
                projectUri: project.uri,
            },
            dcterms: {
                creator: changeAuthor,
                title: title
            },
            schema: {
                sharedContent: JSON.stringify(results)
            }
        });
        callback(null, newMetadataChangePost);
    });
};


MetadataChangePost = Class.extend(MetadataChangePost, Post);

module.exports.MetadataChangePost = MetadataChangePost;



