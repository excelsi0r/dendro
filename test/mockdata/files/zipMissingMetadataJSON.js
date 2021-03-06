const path = require("path");
const rlequire = require("rlequire");
const Config = rlequire("dendro", "src/models/meta/config.js").Config;
const md5File = require("md5-file");

module.exports = {
    md5: md5File.sync(rlequire.absPathInApp("dendro", "test/mockdata/files/test_folder_restore/zipMissingMetadataJSON.zip")),
    name: "zipMissingMetadataJSON.zip",
    extension: "zip",
    location: rlequire.absPathInApp("dendro", "test/mockdata/files/test_folder_restore/zipMissingMetadataJSON.zip"),
    metadata: [
        {
            prefix: "dcterms",
            shortName: "abstract",
            value: "This is a zipForFolderRestore file and its search tag is zipMissingMetadataJSON.zip. It is a fantastic test of search for specific metadata."
        },
        {
            prefix: "dcterms",
            shortName: "abstract",
            value: "This is a zip file for testing the folder restore feature."
        },
        {
            prefix: "dcterms",
            shortName: "title",
            value: "zipMissingMetadataJSON file."
        }
    ]
};
