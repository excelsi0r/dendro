const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
chai.use(chaiHttp);

const rlequire = require("rlequire");
const Config = rlequire("dendro", "src/models/meta/config.js").Config;

const userUtils = rlequire("dendro", "test/utils/user/userUtils.js");
const itemUtils = rlequire("dendro", "test/utils/item/itemUtils.js");
const projectUtils = rlequire("dendro", "test/utils/project/projectUtils.js");
const repositoryUtils = rlequire("dendro", "test/utils/repository/repositoryUtils.js");
const appUtils = rlequire("dendro", "test/utils/app/appUtils.js");

const demouser1 = rlequire("dendro", "test/mockdata/users/demouser1.js");
const demouser2 = rlequire("dendro", "test/mockdata/users/demouser2.js");
const demouser3 = rlequire("dendro", "test/mockdata/users/demouser3.js");

const publicProject = rlequire("dendro", "test/mockdata/projects/public_project.js");
const invalidProject = rlequire("dendro", "test/mockdata/projects/invalidProject.js");

const addMetadataToFoldersUnit = rlequire("dendro", "test/units/metadata/addMetadataToFolders.Unit.js");
const db = rlequire("dendro", "test/utils/db/db.Test.js");

describe("Public project level metadata&deep tests", function ()
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

    describe("/project/" + publicProject.handle + "?metadata&deep (public project)", function ()
    {
        /**
         * Request types
         */
        it("[HTML] should accept request if Accept application/json was not specified", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                projectUtils.getProjectMetadataDeep(false, agent, publicProject.handle, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    done();
                });
            });
        });

        /**
         * Valid request type
         */
        it("[JSON] should fetch metadata recursively of the " + publicProject.handle + " project without authenticating", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);
            projectUtils.getProjectMetadataDeep(true, agent, publicProject.handle, function (err, res)
            {
                res.statusCode.should.equal(200);
                res.body.descriptors.should.be.instanceof(Array);
                _.filter(res.body.descriptors, function (descriptor)
                {
                    return descriptor.prefix === "nie" && descriptor.shortName === "hasLogicalPart";
                }).length.should.be.above(0);
                done();
            });
        });

        it("[JSON] should fetch metadata recursively of the " + publicProject.handle + " project, authenticated as " + demouser1.username + " (creator)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                projectUtils.getProjectMetadataDeep(true, agent, publicProject.handle, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.descriptors.should.be.instanceof(Array);
                    _.filter(res.body.descriptors, function (descriptor)
                    {
                        return descriptor.prefix === "nie" && descriptor.shortName === "hasLogicalPart";
                    }).length.should.be.above(0);
                    done();
                });
            });
        });

        it("[JSON] should fetch metadata recursively of the " + publicProject.handle + " project, authenticated as " + demouser3.username + " (not creator nor contributor)", function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                projectUtils.getProjectMetadataDeep(true, agent, publicProject.handle, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.descriptors.should.be.instanceof(Array);
                    _.filter(res.body.descriptors, function (descriptor)
                    {
                        return descriptor.prefix === "nie" && descriptor.shortName === "hasLogicalPart";
                    }).length.should.be.above(0);
                    done();
                });
            });
        });

        it("[JSON] should fetch metadata recursively of the " + publicProject.handle + " project, authenticated as " + demouser2.username + " (contributor)", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                projectUtils.getProjectMetadataDeep(true, agent, publicProject.handle, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.descriptors.should.be.instanceof(Array);
                    _.filter(res.body.descriptors, function (descriptor)
                    {
                        return descriptor.prefix === "nie" && descriptor.shortName === "hasLogicalPart";
                    }).length.should.be.above(0);
                    done();
                });
            });
        });
    });

    describe(invalidProject.handle + "?metadata&deep (non-existant project)", function ()
    {
        it("[HTML] should refuse request if Accept application/json was not specified", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                projectUtils.getProjectMetadataDeep(false, agent, invalidProject.handle, function (err, res)
                {
                    res.statusCode.should.equal(404);
                    should.not.exist(res.body.descriptors);

                    done();
                });
            });
        });

        it("[JSON] should give a 404 because the project NON_EXISTENT_PROJECT does not exist", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                projectUtils.getProjectMetadataDeep(true, agent, invalidProject.handle, function (err, res)
                {
                    res.statusCode.should.equal(404);
                    should.not.exist(res.body.descriptors);

                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an("array");
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain(invalidProject.handle);
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
