const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
chai.use(chaiHttp);

const Pathfinder = global.Pathfinder;
const Config = require(Pathfinder.absPathInSrcFolder("models/meta/config.js")).Config;

const projectUtils = require(Pathfinder.absPathInTestsFolder("utils/project/projectUtils.js"));
const userUtils = require(Pathfinder.absPathInTestsFolder("utils/user/userUtils.js"));
const appUtils = require(Pathfinder.absPathInTestsFolder("utils/app/appUtils.js"));

const demouser1 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser1.js"));

const publicProject = require(Pathfinder.absPathInTestsFolder("mockdata/projects/public_project.js"));

const addMetadataToFoldersUnit = require(Pathfinder.absPathInTestsFolder("units/metadata/addMetadataToFolders.Unit.js"));
const db = appUtilsrequireUncached(Pathfinder.absPathInTestsFolder("utils/db/db.Test.js"));

// THIS TEST SHOULD BE DELETED BECAUSE THIS FEATURE DOES NOT EXIST
describe("Public project ?version tests", function ()
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

    describe("[GET] /project/:handle?version", function ()
    {
        // TODO API ONLY
        // TODO make a request to HTML, should return invalid request
        // TODO test all three types of project accesses (public, private, metadata only)

        it("Should give an error if the user is unauthenticated", function (done)
        {
            done(1);
        });

        it("Should give an error if the project does not exist", function (done)
        {
            done(1);
        });

        it("Should give an error if the user is logged in as demouser2(not a collaborator nor creator of the project)", function (done)
        {
            done(1);
        });

        it("Should give the resource versions if the resource exists and if the user is logged in as demouser1(the creator of the project)", function (done)
        {
            // jsonOnly, agent, projectHandle, cb
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                projectUtils.getProjectVersion(true, agent, publicProject.handle, 0, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    done();
                });
            });
        });

        it("Should give the resource versions if the resource exists and if the user is logged in as demouser3(a collaborator on the project)", function (done)
        {
            done(1);
        });

        it("Should give an error if the descriptors in the resource version are locked for alterations", function (done)
        {
            done(1);
        });
    });

    after(function (done)
    {
        // destroy graphs

        db.deleteGraphs(function (err, data)
        {
            should.equal(err, null);
            global.tests.server.close();
            done();
        });
    });
});
