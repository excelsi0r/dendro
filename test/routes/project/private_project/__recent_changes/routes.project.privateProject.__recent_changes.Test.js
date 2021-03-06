const chai = require("chai");
const path = require("path");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
chai.use(chaiHttp);

const rlequire = require("rlequire");
const Config = rlequire("dendro", "src/models/meta/config.js").Config;

const projectUtils = rlequire("dendro", "test/utils/project/projectUtils.js");
const userUtils = rlequire("dendro", "test/utils/user/userUtils.js");
const folderUtils = rlequire("dendro", "test/utils/folder/folderUtils.js");
const httpUtils = rlequire("dendro", "test/utils/http/httpUtils.js");
const descriptorUtils = rlequire("dendro", "test/utils/descriptor/descriptorUtils.js");
const appUtils = rlequire("dendro", "test/utils/app/appUtils.js");

const demouser1 = rlequire("dendro", "test/mockdata/users/demouser1.js");
const demouser2 = rlequire("dendro", "test/mockdata/users/demouser2.js");
const demouser3 = rlequire("dendro", "test/mockdata/users/demouser3.js");

const privateProject = rlequire("dendro", "test/mockdata/projects/private_project.js");

const folder = rlequire("dendro", "test/mockdata/folders/folder.js");
const addMetadataToFoldersUnit = rlequire("dendro", "test/units/metadata/addMetadataToFolders.Unit.js");
const db = rlequire("dendro", "test/utils/db/db.Test.js");

describe("private project recent changes", function ()
{
    this.timeout(Config.testsTimeout);
    before(function (done)
    {
        appUtils.newTestRouteLog(path.basename(__filename));
        addMetadataToFoldersUnit.setup(function (err, results)
        {
            should.equal(err, null);
            done();
        });
    });

    describe("[GET] /project/:handle?recent_changes", function ()
    {
        // API ONLY

        it("Should give an error if the request type for the route is HTML", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                // jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(false, agent, privateProject.handle, function (err, res)
                {
                    res.should.have.status(400);
                    done();
                });
            });
        });

        it("Should give an error if the user is unauthenticated", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);

            projectUtils.getProjectRecentChanges(true, agent, privateProject.handle, function (err, res)
            {
                res.should.have.status(401);// because the project is private
                should.equal(res.body.length, undefined);
                done();
            });
        });

        it("Should give an error if the project does not exist", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                // jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(true, agent, "ARandomProjectHandle", function (err, res)
                {
                    res.statusCode.should.equal(404);
                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an("array");
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain("ARandomProjectHandle");
                    done();
                });
            });
        });

        it("Should give an error if the user is logged in as demouser3(not a collaborator nor creator of the project)", function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                // jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(true, agent, privateProject.handle, function (err, res)
                {
                    res.should.have.status(401);// because the project is private
                    should.equal(res.body.length, undefined);
                    done();
                });
            });
        });

        it("Should give the recent project changes if the user is logged in as demouser1(the creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                // jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(true, agent, privateProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.length.should.equal(9);
                    done();
                });
            });
        });

        it("Should give the recent project changes if the user is logged in as demouser2(a collaborator on the project)", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                // jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(true, agent, privateProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.length.should.equal(9);
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
