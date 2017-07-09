const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const _ = require('underscore');
chai.use(chaiHttp);

const Config = global.Config;

const userUtils = require(Config.absPathInTestsFolder("utils/user/userUtils.js"));
const itemUtils = require(Config.absPathInTestsFolder("utils/item/itemUtils.js"));
const appUtils = require(Config.absPathInTestsFolder("utils/app/appUtils.js"));

const demouser1 = require(Config.absPathInTestsFolder("mockdata/users/demouser1.js"));
const demouser2 = require(Config.absPathInTestsFolder("mockdata/users/demouser2.js"));
const demouser3 = require(Config.absPathInTestsFolder("mockdata/users/demouser3.js"));

const privateProject = require(Config.absPathInTestsFolder("mockdata/projects/private_project.js"));
const invalidProject = require(Config.absPathInTestsFolder("mockdata/projects/invalidProject.js"));

const testFolder2 = require(Config.absPathInTestsFolder("mockdata/folders/testFolder2.js"));
const notFoundFolder = require(Config.absPathInTestsFolder("mockdata/folders/notFoundFolder.js"));
const folderForDemouser2 = require(Config.absPathInTestsFolder("mockdata/folders/folderDemoUser2"));
const addMetadataToFoldersUnit = appUtils.requireUncached(Config.absPathInTestsFolder("units/metadata/addMetadataToFolders.Unit.js"));
const db = appUtils.requireUncached(Config.absPathInTestsFolder("utils/db/db.Test.js"));

describe("Private project testFolder2 level ?version", function () {
    before(function (done) {
        this.timeout(60000);
        addMetadataToFoldersUnit.setup(function (err, results) {
            should.equal(err, null);
            done();
        });
    });

    describe("[GET] [PRIVATE PROJECT] /project/" + privateProject.handle  + "/data/foldername?version", function () {
        //API ONLY
        it("Should give an error if the request type for this route is HTML", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.getItemVersion(false, agent, privateProject.handle, testFolder2.name, testFolder2.version, function (err, res) {
                    res.statusCode.should.equal(400);
                    done();
                });
            });
        });

        it("Should give an error if the user is unauthenticated", function (done) {
            const app = global.tests.app;
            const agent = chai.request.agent(app);

            itemUtils.getItemVersion(true, agent, privateProject.handle, testFolder2.name, testFolder2.version, function (err, res) {
                res.statusCode.should.equal(401);//because it is a private project
                done();
            });
        });

        it("Should give an error if the project does not exist", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.getItemVersion(true, agent, invalidProject.handle, testFolder2.name, testFolder2.version, function (err, res) {
                    res.statusCode.should.equal(404);
                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an('array');
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain(testFolder2.name);
                    res.body.message[0].should.contain(invalidProject.handle);
                    done();
                });
            });
        });

        it("Should give an error if the folder identified by foldername does not exist", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.getItemVersion(true, agent, privateProject.handle, notFoundFolder.name, notFoundFolder.version, function (err, res) {
                    res.statusCode.should.equal(404);
                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an('array');
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain(notFoundFolder.name);
                    res.body.message[0].should.contain(privateProject.handle);
                    done();
                });
            });
        });

        it("Should give an error if the user is logged in as demouser3(not a collaborator nor creator of the project)", function (done) {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent) {
                itemUtils.getItemVersion(true, agent, privateProject.handle, testFolder2.name, testFolder2.version, function (err, res) {
                    res.statusCode.should.equal(401);//because it is a private project
                    done();
                });
            });
        });

        it("Should give the folder versions if the folder exists and if the user is logged in as demouser1(the creator of the project)", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.getItemVersion(true, agent, privateProject.handle, testFolder2.name, testFolder2.version, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.body.descriptors.length.should.equal(8);
                    done();
                });
            });
        });

        it("Should give the folder versions if the folder exists and if the user is logged in as demouser2(a collaborator on the project)", function (done) {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                itemUtils.getItemVersion(true, agent, privateProject.handle, folderForDemouser2.name, folderForDemouser2.version, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.body.descriptors.length.should.equal(8);
                    done();
                });
            });
        });

        it("Should give an error if no version is specified", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.getItemVersion(true, agent, privateProject.handle, testFolder2.name, null, function (err, res) {
                    res.statusCode.should.equal(405);
                    done();
                });
            });
        })
    });

    after(function (done) {
        //destroy graphs
        this.timeout(60000);
        appUtils.clearAppState(function (err, data) {
            should.equal(err, null);
            done();
        });
    });
});