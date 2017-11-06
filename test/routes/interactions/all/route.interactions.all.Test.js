process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

let should = chai.should();
const async = require('async');

let demouser1 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser1.js"));
let demouser2 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser2.js"));

let admin = require(Pathfinder.absPathInTestsFolder("mockdata/users/admin.js"));

let interactions = require(Pathfinder.absPathInTestsFolder("mockdata/interactions/interactions.js"));
let folder = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folder"));

const publicProject = require(Pathfinder.absPathInTestsFolder("mockdata/projects/public_project"));

const publicProjectFolderUrl = "/project/"+ publicProject.handle +"/data"+folder.pathInProject+"/"+folder.name;
const nonExistentFolderUrl = "/project/"+ publicProject.handle +"/data"+folder.pathInProject+"/NON_EXISTENT_URL";

const interactionUtils = require(Pathfinder.absPathInTestsFolder("utils/interactions/interactionsUtils"));
const appUtils = require(Pathfinder.absPathInTestsFolder("utils/app/appUtils.js"));
const userUtils = require(Pathfinder.absPathInTestsFolder("utils/user/userUtils"));
const createFoldersUnit = appUtils.requireUncached(Pathfinder.absPathInTestsFolder("units/folders/createFolders.Unit.js"));

describe('/interactions/:project/data/:filepath?register_interaction', function ()
{

    before(function (done) {
        this.timeout(Config.testsTimeout);
        createFoldersUnit.setup(function (err, results) {
            should.equal(err, null);
            done();
        });
    });

    it('[HTML] should not register an interaction if Accept "application/json" header is absent', function (done)
    {
        userUtils.loginUser('demouser1', 'demouserpassword2015', function (err, agent) {
            async.map(interactions, function(interaction,callback){
                interactionUtils.recordInteraction(false, publicProjectFolderUrl, publicProject.handle, interaction, agent, (err, res) => {
                    res.should.have.status(404);
                JSON.parse(res.text).result.should.equal("error");
                JSON.parse(res.text).message.should.equal("Method accessible only via API. Please add the \"Accept : application/json\" header to the HTTP request.");
                callback(null, res.text);
            });
            }, function(err, results){
                console.log("Results " + JSON.stringify(results));
                done(err);
            });
        });
    });

    it('[JSON] should not register an interaction if user is unauthenticated', function (done)
    {
        userUtils.logoutUser(function (err, agent) {
            async.map(interactions, function(interaction,callback){
                interactionUtils.recordInteraction(false, publicProjectFolderUrl, publicProject.handle, interaction, agent, (err, res) => {
                    res.should.have.status(405);
                JSON.parse(res.text).result.should.equal("error");
                JSON.parse(res.text).message.should.equal("Please log into Dendro");
                callback(null, res.text);
            });
            }, function(err, results){
                console.log("Results " + JSON.stringify(results));
                done(err);
            });
        });
    });

    it('[JSON] should not register an interaction if the folder or file does not exist', function (done)
    {
        let interactionsOverNonExistentFile = JSON.parse(JSON.stringify(require(Pathfinder.absPathInTestsFolder("mockdata/interactions/interactions.js"))));

        userUtils.loginUser('demouser1', 'demouserpassword2015', function (err, agent) {
            async.map(interactionsOverNonExistentFile, function(interaction,callback){
                interaction.ddr.originallyRecommendedFor = nonExistentFolderUrl;
                interactionUtils.recordInteraction(false, publicProjectFolderUrl, publicProject.handle, interaction, agent, (err, res) => {
                    res.should.have.status(401);
                JSON.parse(res.text).result.should.equal("error");
                JSON.parse(res.text).message.should.equal("Resource with URI " + nonExistentFolderUrl + " does not exist.");
                callback(null, res.text);
            });
            }, function(err, results){
                console.log("Results " + JSON.stringify(results));
                done(err);
            });
        });
    });

    it('[JSON] should not register an interaction if interaction type is missing', function (done)
    {
        let interactionsWithoutType = JSON.parse(JSON.stringify(require(Pathfinder.absPathInTestsFolder("mockdata/interactions/interactions.js"))));

        userUtils.loginUser('demouser1', 'demouserpassword2015', function (err, agent) {
            async.map(interactionsWithoutType, function(interaction,callback){
                delete interaction.ddr.interactionType;
                interactionUtils.recordInteraction(false, publicProjectFolderUrl, publicProject.handle, interaction, agent, (err, res) => {
                    res.should.have.status(405);
                JSON.parse(res.text).result.should.equal("error");
                JSON.parse(res.text).message.should.equal("Resource with URI " + nonExistentFolderUrl + " does not exist.");
                callback(null, res.text);
            });
            }, function(err, results){
                console.log("Results " + JSON.stringify(results));
                done(err);
            });
        });
    });

    it('[JSON] should register an interaction of each type for the user ' + demouser1.username, function (done)
    {
        userUtils.loginUser('demouser1', 'demouserpassword2015', function (err, agent) {
            async.map(interactions, function(interaction,callback){
                interactionUtils.recordInteraction(false, publicProjectFolderUrl, publicProject.handle, interaction, agent, (err, res) => {
                    res.should.have.status(200);
                JSON.parse(res.text).result.should.equal("error");
                JSON.parse(res.text).message.should.equal("Method accessible only via API. Please add the \"Accept : application/json\" header to the HTTP request.");
                callback(null, res.text);
            });
            }, function(err, results){
                console.log("Results " + JSON.stringify(results));
                done(err);
            });
        });
        done();
    });

    it('[JSON] should register two interactions of each type for the user ' + demouser2.username, function (done)
    {
        userUtils.loginUser('demouser1', 'demouserpassword2015', function (err, agent) {
            async.map(interactions, function(interaction,callback){
                interactionUtils.recordInteraction(false, publicProjectFolderUrl, publicProject.handle, interaction, agent, (err, res) => {
                    res.should.have.status(200);
                JSON.parse(res.text).result.should.equal("error");
                JSON.parse(res.text).message.should.equal("Method accessible only via API. Please add the \"Accept : application/json\" header to the HTTP request.");
                callback(null, res.text);
            });
            }, function(err, results){
                console.log("Results " + JSON.stringify(results));
                done(err);
            });
        });
        done();
    });
});

