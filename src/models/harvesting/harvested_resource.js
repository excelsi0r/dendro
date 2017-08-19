const path = require("path");
const Pathfinder = global.Pathfinder;
const Config = require(Pathfinder.absPathInSrcFolder("models/meta/config.js")).Config;

const isNull = require(Pathfinder.absPathInSrcFolder("/utils/null.js")).isNull;
const Class = require(Pathfinder.absPathInSrcFolder("/models/meta/class.js")).Class;
const DbConnection = require(Pathfinder.absPathInSrcFolder("/kb/db.js")).DbConnection;
const Resource = require(Pathfinder.absPathInSrcFolder("/models/resource.js")).Resource;

const db = Config.getDBByID();

function HarvestedResource(object)
{
    HarvestedResource.baseConstructor.call(this, object);

    const self = this;

    self.ddr.lastHarvested = object.ddr.lastHarvested;
    self.ddr.md5Checksum = object.ddr.md5Checksum;
    self.ddr.sourceRepository = object.ddr.sourceRepository;

    return self;
}

/**
 * Records a resource harvested from an external source of Linked Open Data into the Dendro Graph
 * @deprecated
 * @param indexConnection Connection to the ElasticSearch cluster
 * @param callback function to call after the resource is saved
 */

HarvestedResource.prototype.save = function(indexConnection, callback) {
    const self = this;
    let metadataInsertionString = "";
    let argumentCount = 6;

    const argumentsArray =
        [
            {
                type: DbConnection.resourceNoEscape,
                value: db.graphUri
            },
            {
                type: DbConnection.resource,
                value: self.uri
            },
            {
                type: DbConnection.resource,
                value: self.sourceRepository.uri
            },
            {
                type: DbConnection.date,
                value: self.timestamp
            },
            {
                type: DbConnection.string,
                value: self.md5Checksum
            },
            {
                type: DbConnection.string,
                value: self.md5Checksum
            }
        ];

    for(let i = 0; i < self.metadata.length; i++)
    {
        const metadataDescriptor = self.metadata[i];

        if(!isNull(metadataDescriptor.namespace) && !isNull(metadataDescriptor.element))
        {

            let predicate = null;

            if(isNull(metadataDescriptor.qualifier))
            {
                predicate = {
                    value : metadataDescriptor.namespace + ":" + metadataDescriptor.element,
                    type : DbConnection.prefixedResource
                }
            }
            else
            {
                predicate = {
                    value : metadataDescriptor.namespace + ":" + metadataDescriptor.qualifier,
                    type : DbConnection.prefixedResource
                }
            }

            metadataInsertionString = metadataInsertionString + "[1] ["+ argumentCount +"] ["+ (argumentCount+1) +"] .\n";

            const object = {
                value: metadataDescriptor.value,
                type: DbConnection.string
            };

            argumentsArray.push(predicate);
            argumentsArray.push(object);

            argumentCount = argumentCount + 2;
        }
    }


    //TODO CACHE
    const fullQueryString =
        " DELETE FROM [0]\n" +
        "{ \n" +
        "[1] ?p ?o . \n" +
        "}" +
        "WHERE \n" +
        "{ \n" +
        " FILTER NOT EXISTS " +
        "{ \n" +
        " [1] ddr:md5_checksum [2] .\n" +
        "} \n" +
        "}; \n" +
        " INSERT INTO [0]\n" +
        "{ \n" +
        "   [1] rdf:type ddr:HarvestedResource . \n" +
        "   [1] ddr:last_harvested [3] . \n" +
        "   [1] ddr:md5_checksum [4] . \n" +
        "   [1] dcterms:publisher [5] . \n " +
        "   [2] rdf:type ddr:ExternalRepository . \n " +
        metadataInsertionString +
        "} \n" +
        "WHERE \n" +
        "{ \n" +
        " FILTER NOT EXISTS " +
        "{ \n" +
        " [1] rdf:type ddr:HarvestedResource . \n" +
        " [1] ddr:md5_checksum [3] .\n" +
        "} \n" +
        "} \n";

    db.connection.execute(
        fullQueryString,
        argumentsArray,
        function(err, result)
        {
            if(isNull(err))
            {
                self.reindex(indexConnection, function(err, result)
                {
                    if(isNull(err))
                    {
                        return callback(null, "Metadata successfully inserted for resource : "+ self.uri + " Virtuoso error : " + result);
                    }
                    else
                    {
                        const error = "Error indexing harvested resource with uri " + self.uri + ". Error reported: " + result;
                        console.error(error);
                        return callback(1, error);
                    }

                });
            }
            else
            {
                return callback(1, "Error inserting metadata for resource : "+ self.uri + " : Virtuoso error : "+ result);
            }
        }
    );
};

HarvestedResource = Class.extend(HarvestedResource, Resource, "ddr:HarvestedResource");

module.exports.HarvestedResource = HarvestedResource;