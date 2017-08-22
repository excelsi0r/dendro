const chai = require("chai");
const async = require("async");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
chai.use(chaiHttp);

const Pathfinder = global.Pathfinder;
const Config = require(Pathfinder.absPathInSrcFolder("models/meta/config.js")).Config;

const userUtils = require(Pathfinder.absPathInTestsFolder("utils/user/userUtils.js"));
const itemUtils = require(Pathfinder.absPathInTestsFolder("utils/item/itemUtils.js"));
const appUtils = require(Pathfinder.absPathInTestsFolder("utils/app/appUtils.js"));
const fileUtils = require(Pathfinder.absPathInTestsFolder("utils/file/fileUtils.js"));
const folderUtils = require(Pathfinder.absPathInTestsFolder("utils/folder/folderUtils.js"));

const demouser1 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser1.js"));
const demouser2 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser2.js"));
const demouser3 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser3.js"));

const privateProject = require(Pathfinder.absPathInTestsFolder("mockdata/projects/private_project.js"));
const invalidProject = require(Pathfinder.absPathInTestsFolder("mockdata/projects/invalidProject.js"));

const folder = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folder.js"));
const testFolder1 = require(Pathfinder.absPathInTestsFolder("mockdata/folders/testFolder1.js"));
const notFoundFolder = require(Pathfinder.absPathInTestsFolder("mockdata/folders/notFoundFolder.js"));
const folderForDemouser2 = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folderDemoUser2"));
const createFilesUnit = appUtils.requireUncached(Pathfinder.absPathInTestsFolder("units/files/createFiles.Unit.js"));
const db = appUtils.requireUncached(Pathfinder.absPathInTestsFolder("utils/db/db.Test.js"));

const csvMockFile = require(Pathfinder.absPathInTestsFolder("mockdata/files/csvMockFile.js"));
const docxMockFile = require(Pathfinder.absPathInTestsFolder("mockdata/files/docxMockFile.js"));
const xlsxMockFile = require(Pathfinder.absPathInTestsFolder("mockdata/files/xlsxMockFile.js"));
const zipMockFile = require(Pathfinder.absPathInTestsFolder("mockdata/files/zipMockFile.js"));
const txtMockFile = require(Pathfinder.absPathInTestsFolder("mockdata/files/txtMockFile.js"));

const allFiles = createFilesUnit.allFiles;

const cutFilesFolderName = "cutFiles";
const filesToMove = [txtMockFile, docxMockFile];

describe("[Test File Cut / Move] Private project cutFiles ?paste", function () {
    describe("[PRIVATE PROJECT] [Invalid Cases] /project/" + privateProject.handle + "/data/cutFiles?cut", function ()
    {
        beforeEach(function (done) {
            this.timeout(10*Config.testsTimeout);
            createFilesUnit.setup(function (err, results) {
                should.equal(err, null);
                done();
            });
        });

        afterEach(function (done) {
            //destroy graphs
            this.timeout(Config.testsTimeout);
            appUtils.clearAppState(function (err, data) {
                should.equal(err, null);
                done();
            });
        });

        it("Should give an error if the request is of type HTML even if the user is logged in as demouser1 (the creator of the project)", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                    res.statusCode.should.equal(200);
                    should.equal(err, null);
                    JSON.parse(res.text).should.be.instanceof(Array);
                    JSON.parse(res.text).length.should.equal(allFiles.length);
                    should.equal(folderUtils.responseContainsAllMockFiles(res, allFiles), true);

                    const urisOfFilesToMove = _.map(JSON.parse(res.text), function(file){
                        return file.uri;
                    });

                    folderUtils.createFolderInProject(true, agent, "", cutFilesFolderName, privateProject.handle, function(err, res){
                        res.statusCode.should.equal(200);
                        should.equal(err, null);
                        const destinationFolderUri = JSON.parse(res.text).id;

                        folderUtils.getFolderContents(true,agent, privateProject.handle, cutFilesFolderName, function(err, res){
                            res.statusCode.should.equal(200);
                            should.equal(err, null);

                            JSON.parse(res.text).should.be.instanceof(Array);
                            should.equal(folderUtils.responseContainsAllMockFiles(res, filesToMove), false);

                            folderUtils.moveFilesIntoFolder(false, agent, urisOfFilesToMove, destinationFolderUri, function(err, res){
                                res.statusCode.should.equal(400);
                                done();
                            });
                        });
                    });
                });
            });
        });

        it("Should give an error when the user is unauthenticated", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                    res.statusCode.should.equal(200);
                    should.equal(err, null);
                    JSON.parse(res.text).should.be.instanceof(Array);
                    JSON.parse(res.text).length.should.equal(allFiles.length);
                    should.equal(folderUtils.responseContainsAllMockFiles(res, allFiles), true);

                    const urisOfFilesToMove = _.map(JSON.parse(res.text), function(file){
                        return file.uri;
                    });

                    folderUtils.createFolderInProject(true, agent, "", cutFilesFolderName, privateProject.handle, function(err, res){
                        res.statusCode.should.equal(200);
                        should.equal(err, null);
                        const destinationFolderUri = JSON.parse(res.text).id;

                        folderUtils.getFolderContents(true,agent, privateProject.handle, cutFilesFolderName, function(err, res){
                            res.statusCode.should.equal(200);
                            should.equal(err, null);

                            JSON.parse(res.text).should.be.instanceof(Array);
                            should.equal(folderUtils.responseContainsAllMockFiles(res, filesToMove), false);

                            userUtils.logoutUser(agent, function(err, agent){
                                res.statusCode.should.equal(200);
                                should.equal(err, null);

                                folderUtils.moveFilesIntoFolder(true, agent, urisOfFilesToMove, destinationFolderUri, function(err, res){
                                    res.statusCode.should.equal(401);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it("Should give an error if any of the files that are supposed to be moved do not exist", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                    res.statusCode.should.equal(200);
                    should.equal(err, null);
                    JSON.parse(res.text).should.be.instanceof(Array);
                    JSON.parse(res.text).length.should.equal(allFiles.length);
                    should.equal(folderUtils.responseContainsAllMockFiles(res, allFiles), true);

                    const urisOfFilesToMove = _.map(JSON.parse(res.text), function(file){
                        return file.uri;
                    });

                    folderUtils.createFolderInProject(true, agent, "", cutFilesFolderName, privateProject.handle, function(err, res){
                        res.statusCode.should.equal(200);
                        should.equal(err, null);
                        const destinationFolderUri = JSON.parse(res.text).id;

                        folderUtils.getFolderContents(true,agent, privateProject.handle, cutFilesFolderName, function(err, res){
                            res.statusCode.should.equal(200);
                            should.equal(err, null);

                            JSON.parse(res.text).should.be.instanceof(Array);
                            should.equal(folderUtils.responseContainsAllMockFiles(res, filesToMove), false);

                            //here we introduce the error, an identifier that does not exist
                            urisOfFilesToMove[0] = "/r/file/00000000-0000-0000-0000-000000000000";

                            folderUtils.moveFilesIntoFolder(true, agent, urisOfFilesToMove, destinationFolderUri, function(err, res){
                                res.statusCode.should.equal(404);
                                JSON.parse(res.text).message.should.equal("Some of the files that were asked to be moved do not exist.");
                                JSON.parse(res.text).error[0].should.equal("Resource /r/file/00000000-0000-0000-0000-000000000000 does not exist.");
                                done();
                            });
                        });
                    });
                });
            });
        });

        it("Should give an error if the destination folder of the operation does not exist", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                    res.statusCode.should.equal(200);
                    should.equal(err, null);
                    JSON.parse(res.text).should.be.instanceof(Array);
                    JSON.parse(res.text).length.should.equal(allFiles.length);
                    should.equal(folderUtils.responseContainsAllMockFiles(res, allFiles), true);

                    const urisOfFilesToMove = _.map(JSON.parse(res.text), function(file){
                        return file.uri;
                    });

                    //here we introduce the error, an identifier that does not exist
                    const nonExistentTargetFolder = "/r/folder/00000000-0000-0000-0000-000000000000";
                    folderUtils.moveFilesIntoFolder(true, agent, urisOfFilesToMove, nonExistentTargetFolder, function(err, res){
                        res.statusCode.should.equal(404);
                        done();
                    });
                });
            });
        });

        it("Should give an error if the user does not have permission to cut files into the destination folder (demouser3 is neither a creator nor a collaborator of its owner project", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                    res.statusCode.should.equal(200);
                    should.equal(err, null);
                    JSON.parse(res.text).should.be.instanceof(Array);
                    JSON.parse(res.text).length.should.equal(allFiles.length);
                    should.equal(folderUtils.responseContainsAllMockFiles(res, allFiles), true);

                    const urisOfFilesToMove = _.map(JSON.parse(res.text), function(file){
                        return file.uri;
                    });

                    folderUtils.createFolderInProject(true, agent, "", cutFilesFolderName, privateProject.handle, function(err, res){
                        res.statusCode.should.equal(200);
                        should.equal(err, null);
                        const destinationFolderUri = JSON.parse(res.text).id;

                        folderUtils.getFolderContents(true,agent, privateProject.handle, cutFilesFolderName, function(err, res){
                            res.statusCode.should.equal(200);
                            should.equal(err, null);

                            JSON.parse(res.text).should.be.instanceof(Array);
                            should.equal(folderUtils.responseContainsAllMockFiles(res, filesToMove), false);

                            userUtils.logoutUser(agent, function (err, agent) {
                                res.statusCode.should.equal(200);
                                should.equal(err, null);
                                userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent) {
                                    res.statusCode.should.equal(200);
                                    should.equal(err, null);
                                    folderUtils.moveFilesIntoFolder(true, agent, urisOfFilesToMove, destinationFolderUri, function(err, res){
                                        res.statusCode.should.equal(401);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        it("Should give an error if the user does not have permission to cut a file (demouser3 is neither a creator nor a collaborator of the owner project of the file being cut, even though he is the creator of the project that contains the destination folder)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.createFolder(true, agent, privateProject.handle, "*invalidFolder", folder.name, function (err, res)
                {
                    res.statusCode.should.equal(404);
                    done();
                });
            });
        });
    });

    describe("[Move files] [PRIVATE PROJECT] [Valid Cases] /project/" + privateProject.handle + "/data/testFolder1/:filename?cut", function () {
        beforeEach(function (done) {
            this.timeout(10*Config.testsTimeout);
            createFilesUnit.setup(function (err, results) {
                should.equal(err, null);
                done();
            });
        });

        it("Should cut files with success if the user is logged in as demouser1 (the creator of the project)", function (done) {
           userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                    res.statusCode.should.equal(200);
                    should.equal(err, null);
                    JSON.parse(res.text).should.be.instanceof(Array);
                    JSON.parse(res.text).length.should.equal(allFiles.length);
                    should.equal(folderUtils.responseContainsAllMockFiles(res, allFiles), true);

                    const urisOfFilesToMove = _.map(JSON.parse(res.text), function(file){
                        return file.uri;
                    });

                    folderUtils.createFolderInProject(true, agent, "", cutFilesFolderName, privateProject.handle, function(err, res){
                        res.statusCode.should.equal(200);
                        should.equal(err, null);
                        const destinationFolderUri = JSON.parse(res.text).id;

                        folderUtils.getFolderContents(true,agent, privateProject.handle, cutFilesFolderName, function(err, res){
                            res.statusCode.should.equal(200);
                            should.equal(err, null);

                            JSON.parse(res.text).should.be.instanceof(Array);
                            should.equal(folderUtils.responseContainsAllMockFiles(res, filesToMove), false);

                            folderUtils.moveFilesIntoFolder(true, agent, urisOfFilesToMove, destinationFolderUri, function(err, res){
                                res.statusCode.should.equal(200);
                                should.equal(err, null);

                                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                                    res.statusCode.should.equal(200);
                                    should.equal(err, null);
                                    JSON.parse(res.text).should.be.instanceof(Array);
                                    JSON.parse(res.text).length.should.equal(0);

                                    folderUtils.getFolderContents(true,agent, privateProject.handle, cutFilesFolderName, function(err, res){
                                        res.statusCode.should.equal(200);
                                        should.equal(err, null);

                                        JSON.parse(res.text).should.be.instanceof(Array);
                                        should.equal(folderUtils.responseContainsAllMockFiles(res, filesToMove), true);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        it("Should cut files with success if the user is logged in as demouser2(a collaborator of the project)", function (done) {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                    res.statusCode.should.equal(200);
                    should.equal(err, null);
                    JSON.parse(res.text).should.be.instanceof(Array);
                    JSON.parse(res.text).length.should.equal(allFiles.length);
                    should.equal(folderUtils.responseContainsAllMockFiles(res, allFiles), true);

                    const urisOfFilesToMove = _.map(JSON.parse(res.text), function(file){
                        return file.uri;
                    });

                    folderUtils.createFolderInProject(true, agent, "", cutFilesFolderName, privateProject.handle, function(err, res){
                        res.statusCode.should.equal(200);
                        should.equal(err, null);
                        const destinationFolderUri = JSON.parse(res.text).id;

                        folderUtils.getFolderContents(true,agent, privateProject.handle, cutFilesFolderName, function(err, res){
                            res.statusCode.should.equal(200);
                            should.equal(err, null);

                            JSON.parse(res.text).should.be.instanceof(Array);
                            should.equal(folderUtils.responseContainsAllMockFiles(res, filesToMove), false);

                            folderUtils.moveFilesIntoFolder(true, agent, urisOfFilesToMove, destinationFolderUri, function(err, res){
                                res.statusCode.should.equal(200);
                                should.equal(err, null);

                                folderUtils.getFolderContents(true, agent, privateProject.handle, testFolder1.name, function(err, res){
                                    res.statusCode.should.equal(200);
                                    should.equal(err, null);
                                    JSON.parse(res.text).should.be.instanceof(Array);
                                    JSON.parse(res.text).length.should.equal(0);

                                    folderUtils.getFolderContents(true,agent, privateProject.handle, cutFilesFolderName, function(err, res){
                                        res.statusCode.should.equal(200);
                                        should.equal(err, null);

                                        JSON.parse(res.text).should.be.instanceof(Array);
                                        should.equal(folderUtils.responseContainsAllMockFiles(res, filesToMove), true);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        afterEach(function (done) {
            //destroy graphs
            this.timeout(Config.testsTimeout);
            appUtils.clearAppState(function (err, data) {
                should.equal(err, null);
                done();
            });
        });
    });
});