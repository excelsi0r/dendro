const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
const md5 = require("md5");
const fs = require("fs");
const path = require("path");
chai.use(chaiHttp);

const Pathfinder = global.Pathfinder;
const Config = require(Pathfinder.absPathInSrcFolder("models/meta/config.js")).Config;

const userUtils = require(Pathfinder.absPathInTestsFolder("utils/user/userUtils.js"));
const fileUtils = require(Pathfinder.absPathInTestsFolder("utils/file/fileUtils.js"));
const projectUtils = require(Pathfinder.absPathInTestsFolder("utils/project/projectUtils.js"));
const itemUtils = require(Pathfinder.absPathInTestsFolder("utils/item/itemUtils.js"));
const appUtils = require(Pathfinder.absPathInTestsFolder("utils/app/appUtils.js"));
const descriptorUtils = require(Pathfinder.absPathInTestsFolder("utils/descriptor/descriptorUtils.js"));
const interactionsUtils = require(Pathfinder.absPathInTestsFolder("utils/interactions/interactionsUtils.js"));

const demouser1 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser1.js"));
const demouser2 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser2.js"));
const demouser3 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser3.js"));

const publicProject = require(Pathfinder.absPathInTestsFolder("mockdata/projects/public_project.js"));

const createFilesUnit = appUtils.requireUncached(Pathfinder.absPathInTestsFolder("units/files/createFiles.Unit.js"));

/*var bodyObj = {
    "prefix": "dcterms",
    "shortName": "abstract",
    "ontology": "http://purl.org/dc/terms/",
    "uri": "http://purl.org/dc/terms/abstract",
    "prefixedForm": "dcterms:abstract",
    "type": 3,
    "control": "markdown_box",
    "label": "Abstract",
    "comment": "A summary of the resource.",
    "recommendation_types": {
        "dc_element_forced": true
    },
    "recommendationCallId": "abe11605-5bd4-4669-913e-42d34206df25",
    "recommendationCallTimeStamp": "2018-02-27T16:30:26.545Z",
    "$$hashKey": "object:170",
    "just_added": true,
    "added_from_quick_list": true,
    "rankingPosition": 2,
    "pageNumber": 0,
    "interactionType": "accept_descriptor_from_quick_list",
    "recommendedFor": "/r/folder/403de121-d0fc-4329-a534-e87c997b5596"
};*/
let bodyObj = null;
let projectRootData = null;
let dctermsDescriptors = null;
let dctermsPrefix = "dcterms";

let demouser1InteractionObj = null;
let demouser2InteractionObj = null;

describe("[" + publicProject.handle + "]"   + "[INTERACTION TESTS] accept_descriptor_from_quick_list", function ()
{
    this.timeout(Config.testsTimeout);
    before(function (done)
    {
        createFilesUnit.setup(function (err, results)
        {
            should.equal(err, null);
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                should.equal(err, null);
                projectUtils.getProjectRootContent(true, agent, publicProject.handle, function (err, res)
                {
                    should.equal(err, null);
                    should.exist(res);
                    projectRootData = res.body;
                    should.exist(projectRootData);
                    descriptorUtils.getDescriptorsFromOntology(true, agent, dctermsPrefix, function (err, res) {
                        should.equal(err, null);
                        should.exist(res);
                        dctermsDescriptors = res.body.descriptors;
                        should.exist(dctermsDescriptors);
                        // TODO recommendationCallId and recommendedFor must be added after the unit runs
                        // TODO recommendedFor maybe for a uri of a folder on the root of the project
                        // TODO recommendationCallId is I think from the descriptor associated to the resource
                        demouser1InteractionObj = dctermsDescriptors[0];
                        demouser1InteractionObj.just_added = true;
                        demouser1InteractionObj.added_from_quick_list = true;
                        //demouser1InteractionObj.rankingPosition = index;
                        demouser1InteractionObj.rankingPosition = 0;
                        //demouser1InteractionObj.pageNumber = $scope.recommendations_page;
                        demouser1InteractionObj.pageNumber = 2;
                        demouser1InteractionObj.interactionType = "accept_descriptor_from_quick_list";
                        demouser1InteractionObj.recommendedFor = projectRootData[0].uri;

                        demouser2InteractionObj = dctermsDescriptors[1];
                        demouser2InteractionObj.just_added = true;
                        demouser2InteractionObj.added_from_quick_list = true;
                        demouser2InteractionObj.rankingPosition = 0;
                        demouser2InteractionObj.pageNumber = 2;
                        demouser2InteractionObj.interactionType = "accept_descriptor_from_quick_list";
                        demouser2InteractionObj.recommendedFor = projectRootData[0].uri;
                        done();
                    });
                });
            });
        });
    });


    describe("[POST] [Invalid Cases] /interactions/accept_descriptor_from_quick_list", function ()
    {
        it("Should give an error and not accept and register an interaction when a descriptor is added from the quick list when unauthenticated", function (done)
        {
            const app = global.tests.app;
            let agent = chai.request.agent(app);
            interactionsUtils.acceptDescriptorFromQuickList(true, agent, demouser1InteractionObj, function (err, res)
            {
                should.exist(err);
                res.statusCode.should.equal(401);
                //SHOULD NOT BE IN THE MYSQL DATABASE
                interactionsUtils.getNumberOfInteractionsInDB(function (err, info) {
                    should.equal(err, null);
                    should.exist(info);
                    info[0].nInteractions.should.equal(0);
                    done();
                });
            });
        });

        it("Should give an error and not accept and register an interaction when a descriptor is added from the quick list when logged in as demouser3, who is not a creator or collaborator of the project where the current resource belongs to", function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                interactionsUtils.acceptDescriptorFromQuickList(true, agent, demouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    res.statusCode.should.equal(400);
                    res.body.message.should.contain("Unable to record interactions for resources of projects of which you are not a creator or contributor.");
                    //SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info) {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(0);
                        done();
                    });
                });
            });
        });
    });

    describe("[POST] [Valid Cases] /interactions/accept_descriptor_from_quick_list", function ()
    {
        it("Should accept and register an interaction when a descriptor is added from the quick list when logged in as demouser1 (the creator of the current project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                userUtils.getUserInfo(demouser1.username, true, agent, function (err, res)
                {
                    should.equal(err, null);
                    should.exist(res);
                    should.exist(res.body);
                    should.exist(res.body.uri);
                    let demouser1Uri = res.body.uri;
                    interactionsUtils.acceptDescriptorFromQuickList(true, agent, demouser1InteractionObj, function (err, res)
                    {
                        should.equal(err, null);
                        res.statusCode.should.equal(200);
                        //SHOULD ALSO BE IN THE MYSQL DATABASE
                        interactionsUtils.getNumberOfInteractionsInDB(function (err, info) {
                            should.equal(err, null);
                            should.exist(info);
                            info[0].nInteractions.should.equal(1);
                            interactionsUtils.getLatestInteractionInDB(function (err, info) {
                                should.equal(err, null);
                                should.exist(info);
                                info.length.should.equal(1);
                                demouser1InteractionObj.uri.should.not.equal(demouser2InteractionObj.uri);
                                info[0].executedOver.should.equal(demouser1InteractionObj.uri);
                                info[0].interactionType.should.equal(demouser1InteractionObj.interactionType);
                                info[0].originallyRecommendedFor.should.equal(demouser1InteractionObj.recommendedFor);
                                info[0].pageNumber.should.equal(demouser1InteractionObj.pageNumber);
                                info[0].performedBy.should.equal(demouser1Uri);
                                info[0].rankingPosition.should.equal(demouser1InteractionObj.rankingPosition);
                                info[0].recommendationCallId.should.equal(demouser1InteractionObj.recommendationCallId);
                                should.exist(info[0].uri);
                                info[0].uri.should.contain("interaction");
                                done();
                            });
                        });
                    });
                });
            });
        });

        it("Should accept and register an interaction when a descriptor is added from the quick list when logged in as demouser2 (a collaborator on the current project)", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                userUtils.getUserInfo(demouser2.username, true, agent, function (err, res)
                {
                    should.equal(err, null);
                    should.exist(res);
                    should.exist(res.body);
                    should.exist(res.body.uri);
                    let demouser2Uri = res.body.uri;
                    interactionsUtils.acceptDescriptorFromQuickList(true, agent, demouser2InteractionObj, function (err, res)
                    {
                        should.equal(err, null);
                        res.statusCode.should.equal(200);
                        //SHOULD ALSO BE IN THE MYSQL DATABASE
                        interactionsUtils.getNumberOfInteractionsInDB(function (err, info) {
                            should.equal(err, null);
                            should.exist(info);
                            info[0].nInteractions.should.equal(2);
                            interactionsUtils.getLatestInteractionInDB(function (err, info) {
                                should.equal(err, null);
                                should.exist(info);
                                info.length.should.equal(1);
                                demouser1InteractionObj.uri.should.not.equal(demouser2InteractionObj.uri);
                                info[0].executedOver.should.equal(demouser2InteractionObj.uri);
                                info[0].interactionType.should.equal(demouser2InteractionObj.interactionType);
                                info[0].originallyRecommendedFor.should.equal(demouser2InteractionObj.recommendedFor);
                                info[0].pageNumber.should.equal(demouser2InteractionObj.pageNumber);
                                info[0].performedBy.should.equal(demouser2Uri);
                                info[0].rankingPosition.should.equal(demouser2InteractionObj.rankingPosition);
                                info[0].recommendationCallId.should.equal(demouser2InteractionObj.recommendationCallId);
                                should.exist(info[0].uri);
                                info[0].uri.should.contain("interaction");
                                done();
                            });
                        });
                    });
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
