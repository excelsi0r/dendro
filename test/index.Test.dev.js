process.env.NODE_ENV = "test";

const path = require("path");
const appDir = path.resolve(path.dirname(require.main.filename), "../../..");
const rlequire = require("rlequire");

const Config = rlequire("dendro", "src/models/meta/config.js").Config;
Config.testsTimeout = 1800000;
console.log("Running in test mode and the app directory is : " + rlequire.getRootFolder("dendro"));

global.Config = Config;

global.tests = {};

// rlequire("dendro", "test/routes/posts/all/routes.posts.all.Test.js");

// rlequire("dendro", "test/routes/posts/all/routes.posts.all.ranked.Test.js");

// Import projects tests
// rlequire("dendro", "test//routes/projects/import/route.projects.import.Test.js");

// Dendro Administration page
// rlequire("dendro", "test//routes/admin/routes.admin.Test.js");

// PUBLIC PROJECT FOLDER LEVEL ?restore_metadata_version
// rlequire("dendro", "test//routes/project/public_project/data/testFolder1/__restore_metadata_version/routes.project.publicProject.data.testFolder1.__restore_metadata_version.Test.js");
// rlequire("dendro", "test//routes/project/public_project/data/testFolder2/__restore_metadata_version/routes.project.publicProject.data.testFolder2.__restore_metadata_version.Test.js");

// PRIVATE PROJECT FOLDER LEVEL ?restore_metadata_version
// rlequire("dendro", "test//routes/project/private_project/data/testFolder1/__restore_metadata_version/routes.project.privateProject.data.testFolder1.__restore_metadata_version.Test.js");
// rlequire("dendro", "test//routes/project/private_project/data/testFolder2/__restore_metadata_version/routes.project.privateProject.data.testFolder2.__restore_metadata_version.Test.js");

// METADATA ONLY PROJECT FOLDER LEVEL ?restore_metadata_version
// rlequire("dendro", "test//routes/project/metadata_only_project/data/testFolder1/__restore_metadata_version/routes.project.metadataonlyProject.data.testFolder1.__restore_metadata_version.Test.js");
// rlequire("dendro", "test//routes/project/metadata_only_project/data/testFolder2/__restore_metadata_version/routes.project.metadataonlyProject.data.testFolder2.__restore_metadata_version.Test.js");


rlequire("dendro", "test/routes/keywords/route.keywords.Test.js");

