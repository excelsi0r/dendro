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
const userUtils = require(Pathfinder.absPathInTestsFolder("utils/user/userUtils"));

describe('/interactions/:project/data/:filepath?register_interaction', function (){

    it('[JSON] should not delete all interactions unless the user is a Dendro admin', function (done)
    {
        userUtils.loginUser('demouser1', 'demouserpassword2015', function (err, agent) {
            async.map(interactions, function(interaction,callback){
                interactionUtils.deletesAllInteractions(false, publicProjectFolderUrl, publicProject.handle, interaction, agent, (err, res) => {
                    res.should.have.status(405);
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

    it('[JSON] should delete all interactions if the user is a Dendro admin', function (done)
    {
        //TODO
        done();
    });

    it('[JSON] should register an interaction of each type for the user ' + demouser1.username, function (done)
    {
        //TODO
        done();
    });

    it('[JSON] should register two interactions of each type for the user ' + demouser2.username, function (done)
    {
        //TODO
        done();
    });
});

