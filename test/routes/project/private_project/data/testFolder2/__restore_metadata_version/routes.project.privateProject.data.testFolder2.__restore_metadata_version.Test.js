const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
chai.use(chaiHttp);

const rlequire = require("rlequire");
const Config = rlequire("dendro", "src/models/meta/config.js").Config;

const userUtils = rlequire("dendro", "test/utils/user/userUtils.js");
const itemUtils = rlequire("dendro", "test/utils/item/itemUtils.js");
const appUtils = rlequire("dendro", "test/utils/app/appUtils.js");

const demouser1 = rlequire("dendro", "test/mockdata/users/demouser1.js");
const demouser2 = rlequire("dendro", "test/mockdata/users/demouser2.js");
const demouser3 = rlequire("dendro", "test/mockdata/users/demouser3.js");

const privateProject = rlequire("dendro", "test/mockdata/projects/private_project.js");
const invalidProject = rlequire("dendro", "test/mockdata/projects/invalidProject.js");

const testFolder2 = rlequire("dendro", "test/mockdata/folders/testFolder2.js");
const notFoundFolder = rlequire("dendro", "test/mockdata/folders/notFoundFolder.js");
const folderForDemouser2 = rlequire("dendro", "test/mockdata/folders/folderDemoUser2");
const addMetadataToFoldersUnit = rlequire("dendro", "test/units/metadata/addMetadataToFolders.Unit.js");
const db = rlequire("dendro", "test/utils/db/db.Test.js");

describe("Private project testFolder2 level restore_metadata_version", function ()
{
    this.timeout(Config.testsTimeout);
    before(function (done)
    {
        addMetadataToFoldersUnit.setup(function (err, results)
        {
            should.equal(err, null);
            done();
        });
    });

    describe("[POST] [PRIVATE PROJECT] /project/" + privateProject.handle + "/data/foldername?restore_metadata_version", function ()
    {
        // API ONLY
        it("Should give an error of the request type for this route is html", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.itemRestoreMetadataVersion(false, agent, privateProject.handle, testFolder2.name, 0, function (err, res)
                {
                    res.statusCode.should.equal(400);
                    done();
                });
            });
        });

        it("Should give an error if the user is unauthenticated", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);

            itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, testFolder2.name, 0, function (err, res)
            {
                res.statusCode.should.equal(401);
                done();
            });
        });

        it("Should give an error if the project does not exist", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.itemRestoreMetadataVersion(true, agent, invalidProject.handle, testFolder2.name, 0, function (err, res)
                {
                    res.statusCode.should.equal(404);
                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an("array");
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain(testFolder2.name);
                    res.body.message[0].should.contain(invalidProject.handle);
                    done();
                });
            });
        });

        it("Should give an error if the folder identified by foldername does not exist", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, notFoundFolder.name, 0, function (err, res)
                {
                    res.statusCode.should.equal(404);
                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an("array");
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain(notFoundFolder.name);
                    res.body.message[0].should.contain(privateProject.handle);
                    done();
                });
            });
        });

        it("Should give an error if the metadata_version sent in the body is in an invalid format", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, testFolder2.name, "thisisaninvalidversion", function (err, res)
                {
                    res.statusCode.should.equal(405);
                    res.body.message.should.contain("Unable to retrieve version");
                    done();
                });
            });
        });

        it("Should give an error if the user is logged in as demouser3(not a collaborator nor creator of the project)", function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, testFolder2.name, 0, function (err, res)
                {
                    res.statusCode.should.equal(401);
                    done();
                });
            });
        });

        it("Should restore the metadata version related to the folder if the folder exists and if the user is logged in as demouser1(the creator of the project) and if the version sent in the body is a valid one", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, testFolder2.name, 0, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.message.should.contain("successfully restored to version " + 0);
                    done();
                });
            });
        });

        it("Should restore the metadata version related to the folder if the folder exists and if the user is logged in as demouser2(a collaborator on the project) and if the version sent in the body is a valid one", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, folderForDemouser2.name, 0, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.message.should.contain("successfully restored to version " + 0);
                    done();
                });
            });
        });
    });

    after(function (done)
    {
        // destroy graphs

        appUtils.clearAppState(function (err, data)
        {
            should.equal(err, null);
            done(err);
        });
    });
});
