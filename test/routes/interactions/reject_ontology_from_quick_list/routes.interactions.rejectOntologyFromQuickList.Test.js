const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
const md5 = require("md5");
const fs = require("fs");
const path = require("path");
chai.use(chaiHttp);

const rlequire = require("rlequire");
const Config = rlequire("dendro", "src/models/meta/config.js").Config;
const async = require("async");

const userUtils = rlequire("dendro", "test/utils/user/userUtils.js");
const fileUtils = rlequire("dendro", "test/utils/file/fileUtils.js");
const projectUtils = rlequire("dendro", "test/utils/project/projectUtils.js");
const itemUtils = rlequire("dendro", "test/utils/item/itemUtils.js");
const appUtils = rlequire("dendro", "test/utils/app/appUtils.js");
const descriptorUtils = rlequire("dendro", "test/utils/descriptor/descriptorUtils.js");
const interactionsUtils = rlequire("dendro", "test/utils/interactions/interactionsUtils.js");

const demouser1 = rlequire("dendro", "test/mockdata/users/demouser1.js");
const demouser2 = rlequire("dendro", "test/mockdata/users/demouser2.js");
const demouser3 = rlequire("dendro", "test/mockdata/users/demouser3.js");

const publicProject = rlequire("dendro", "test/mockdata/projects/public_project.js");

const createFilesUnit = rlequire("dendro", "test/units/files/createFiles.Unit.js");

/* let bodyObj = {
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
    "interactionType": "reject_ontology_from_quick_list",
    "recommendedFor": "/r/folder/403de121-d0fc-4329-a534-e87c997b5596"
};*/
let projectRootData = null;
let dctermsDescriptors = null;
let dctermsPrefix = "dcterms";
let foafPrefix = "foaf";

let demouser1InteractionObj = null;
let demouser2InteractionObj = null;
let acceptDescriptorFromQuickListInteractionObj = null;

describe("[" + publicProject.handle + "]" + "[INTERACTION TESTS] reject_ontology_from_quick_list", function ()
{
    this.timeout(Config.testsTimeout);
    // TODO save an interaction of type accept_descriptor_from_quick_list first
    // TODO THEN try the reject_ontology_from_quick_list interaction
    before(function (done)
    {
        createFilesUnit.setup(function (err, results)
        {
            should.equal(err, null);
            async.waterfall([
                function (callback)
                {
                    // creates the accept_descriptor_from_quick_list interaction object
                    userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
                    {
                        should.equal(err, null);
                        projectUtils.getProjectRootContent(true, agent, publicProject.handle, function (err, res)
                        {
                            should.equal(err, null);
                            should.exist(res);
                            projectRootData = res.body;
                            should.exist(projectRootData);
                            descriptorUtils.getDescriptorsFromOntology(true, agent, dctermsPrefix, function (err, res)
                            {
                                should.equal(err, null);
                                should.exist(res);
                                dctermsDescriptors = res.body.descriptors;
                                should.exist(dctermsDescriptors);
                                acceptDescriptorFromQuickListInteractionObj = dctermsDescriptors[0];
                                acceptDescriptorFromQuickListInteractionObj.just_added = true;
                                acceptDescriptorFromQuickListInteractionObj.added_from_quick_list = true;
                                acceptDescriptorFromQuickListInteractionObj.rankingPosition = 0;
                                acceptDescriptorFromQuickListInteractionObj.pageNumber = 2;
                                acceptDescriptorFromQuickListInteractionObj.interactionType = "accept_descriptor_from_quick_list";
                                acceptDescriptorFromQuickListInteractionObj.recommendedFor = projectRootData[0].uri;
                                callback(null);
                            });
                        });
                    });
                },
                function (callback)
                {
                    // creates the reject_ontology_from_quick_list interaction object
                    userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
                    {
                        should.equal(err, null);
                        projectUtils.getProjectRootContent(true, agent, publicProject.handle, function (err, res)
                        {
                            should.equal(err, null);
                            should.exist(res);
                            projectRootData = res.body;
                            should.exist(projectRootData);
                            descriptorUtils.getDescriptorsFromOntology(true, agent, dctermsPrefix, function (err, res)
                            {
                                should.equal(err, null);
                                should.exist(res);
                                dctermsDescriptors = res.body.descriptors;
                                should.exist(dctermsDescriptors);
                                demouser1InteractionObj = dctermsDescriptors[0];
                                demouser1InteractionObj.just_added = true;
                                demouser1InteractionObj.added_from_quick_list = true;
                                // demouser1InteractionObj.rankingPosition = index;
                                demouser1InteractionObj.rankingPosition = 0;
                                // demouser1InteractionObj.pageNumber = $scope.recommendations_page;
                                demouser1InteractionObj.pageNumber = 2;
                                demouser1InteractionObj.interactionType = "reject_ontology_from_quick_list";
                                demouser1InteractionObj.recommendedFor = projectRootData[0].uri;

                                demouser2InteractionObj = dctermsDescriptors[1];
                                demouser2InteractionObj.just_added = true;
                                demouser2InteractionObj.added_from_quick_list = true;
                                demouser2InteractionObj.rankingPosition = 0;
                                demouser2InteractionObj.pageNumber = 2;
                                demouser2InteractionObj.interactionType = "reject_ontology_from_quick_list";
                                demouser2InteractionObj.recommendedFor = projectRootData[0].uri;
                                callback(null);
                            });
                        });
                    });
                },
                function (callback)
                {
                    // register the accept_descriptor_from_quick_list interaction
                    userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
                    {
                        userUtils.getUserInfo(demouser1.username, true, agent, function (err, res)
                        {
                            should.equal(err, null);
                            should.exist(res);
                            should.exist(res.body);
                            should.exist(res.body.uri);
                            let demouser1Uri = res.body.uri;
                            interactionsUtils.acceptDescriptorFromQuickList(true, agent, acceptDescriptorFromQuickListInteractionObj, function (err, res)
                            {
                                should.equal(err, null);
                                res.statusCode.should.equal(200);
                                // SHOULD ALSO BE IN THE MYSQL DATABASE
                                interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                                {
                                    should.equal(err, null);
                                    should.exist(info);
                                    info[0].nInteractions.should.equal(1);
                                    interactionsUtils.getLatestInteractionInDB(function (err, info)
                                    {
                                        should.equal(err, null);
                                        should.exist(info);
                                        info.length.should.equal(1);
                                        info[0].executedOver.should.equal(acceptDescriptorFromQuickListInteractionObj.uri);
                                        info[0].interactionType.should.equal(acceptDescriptorFromQuickListInteractionObj.interactionType);
                                        info[0].originallyRecommendedFor.should.equal(acceptDescriptorFromQuickListInteractionObj.recommendedFor);
                                        info[0].pageNumber.should.equal(acceptDescriptorFromQuickListInteractionObj.pageNumber);
                                        info[0].performedBy.should.equal(demouser1Uri);
                                        info[0].rankingPosition.should.equal(acceptDescriptorFromQuickListInteractionObj.rankingPosition);
                                        info[0].recommendationCallId.should.equal(acceptDescriptorFromQuickListInteractionObj.recommendationCallId);
                                        should.exist(info[0].uri);
                                        info[0].uri.should.contain("interaction");
                                        callback(null);
                                    });
                                });
                            });
                        });
                    });
                }],
            function (err, results)
            {
                should.equal(err, null);
                done();
            });
        });
    });

    describe("[POST] [Invalid Cases] /interactions/reject_ontology_from_quick_list", function ()
    {
        it("Should give an error and not accept and register an interaction when an ontology is rejected from the quick list when unauthenticated", function (done)
        {
            const app = global.tests.app;
            let agent = chai.request.agent(app);
            interactionsUtils.rejectOntologyFromQuickList(true, agent, demouser1InteractionObj, function (err, res)
            {
                should.exist(err);
                res.statusCode.should.equal(401);
                // SHOULD NOT BE IN THE MYSQL DATABASE
                interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                {
                    should.equal(err, null);
                    should.exist(info);
                    info[0].nInteractions.should.equal(1);
                    done();
                });
            });
        });

        it("Should give an error and not accept and register an interaction when an ontology is rejected from the quick list when logged in as demouser3, who is not a creator or collaborator of the project where the current resource belongs to", function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                interactionsUtils.rejectOntologyFromQuickList(true, agent, demouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    res.statusCode.should.equal(400);
                    res.body.message.should.contain("Unable to record interactions for resources of projects of which you are not a creator or contributor.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the interaction type field is invalid, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.interactionType = "invalid_interaction_type";
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid interaction type in the request's body. It should be : reject_ontology_from_quick_list");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the interaction type field is missing, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                delete copyOfDemouser1InteractionObj.interactionType;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid interaction type in the request's body. It should be : reject_ontology_from_quick_list");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the interaction type field is null, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.interactionType = null;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid interaction type in the request's body. It should be : reject_ontology_from_quick_list");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the recommendedFor field is invalid, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.recommendedFor = "invalid_recomended_for";
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(404);
                    res.body.message.should.equal("Resource with uri invalid_recomended_for not found in this system.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the recommendedFor field is missing, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                delete copyOfDemouser1InteractionObj.recommendedFor;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(400);
                    res.body.message.should.equal("Request Body JSON is invalid since it has no 'recommendedFor' field, which should contain the current URL when the interaction took place. Either that, or the field is not a string as it should be.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the recommendedFor field is null, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.recommendedFor = null;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(400);
                    res.body.message.should.equal("Request Body JSON is invalid since it has no 'recommendedFor' field, which should contain the current URL when the interaction took place. Either that, or the field is not a string as it should be.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the executorOver(descriptor uri) field is invalid, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.uri = "invalid_executed_over";
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Requested Descriptor undefined is unknown / not parametrized in this Dendro instance.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the executorOver(descriptor uri) field is missing, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                delete copyOfDemouser1InteractionObj.uri;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Requested Descriptor undefined is unknown / not parametrized in this Dendro instance.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the executorOver(descriptor uri) field is null, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.uri = null;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Requested Descriptor undefined is unknown / not parametrized in this Dendro instance.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the rankingPosition field is invalid, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.rankingPosition = "invalid_ranking_position";
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid ranking position in the request's body. It should be an integer");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the rankingPosition field is missing, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                delete copyOfDemouser1InteractionObj.rankingPosition;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid ranking position in the request's body. It should be an integer");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the rankingPosition field is null, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.rankingPosition = null;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid ranking position in the request's body. It should be an integer");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        // pageNumber: req.body.pageNumber,

        it("Should give an error and not accept and register an interaction if the pageNumber field is invalid, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.pageNumber = "invalid_page_number";
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid page number in the request's body. It should be an integer");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the pageNumber field is missing, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                delete copyOfDemouser1InteractionObj.pageNumber;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid page number in the request's body. It should be an integer");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the pageNumber field is null, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.pageNumber = null;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid page number in the request's body. It should be an integer");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the recommendationCallId field is missing, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                delete copyOfDemouser1InteractionObj.recommendationCallId;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Interaction type reject_ontology_from_quick_list requires field recommendationCallId in the request's body.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the recommendationCallId field is null, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.recommendationCallId = null;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Interaction type reject_ontology_from_quick_list requires field recommendationCallId in the request's body.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the recommendationCallTimeStamp field is invalid, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.recommendationCallTimeStamp = "This is not a valid timestamp";
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid recommendationCallTimeStamp in the request's body. It should be an valid date.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the recommendationCallTimeStamp field is missing, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                delete copyOfDemouser1InteractionObj.recommendationCallTimeStamp;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid recommendationCallTimeStamp in the request's body. It should be an valid date.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the recommendationCallTimeStamp field is null, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                copyOfDemouser1InteractionObj.recommendationCallTimeStamp = null;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid recommendationCallTimeStamp in the request's body. It should be an valid date.");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if all the required fields are missing, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = JSON.parse(JSON.stringify(demouser1InteractionObj));
                delete copyOfDemouser1InteractionObj.recommendationCallTimeStamp;
                delete copyOfDemouser1InteractionObj.interactionType;
                delete copyOfDemouser1InteractionObj.uri;
                delete copyOfDemouser1InteractionObj.recommendedFor;
                delete copyOfDemouser1InteractionObj.rankingPosition;
                delete copyOfDemouser1InteractionObj.pageNumber;
                delete copyOfDemouser1InteractionObj.recommendationCallId;
                delete copyOfDemouser1InteractionObj.recommendationCallTimeStamp;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    // because it is the first validation that fails when checking on the server side, even if all fields are missing
                    res.body.message.should.equal("Invalid interaction type in the request's body. It should be : reject_ontology_from_quick_list");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("Should give an error and not accept and register an interaction if the body contents is null, even if logged in as demouser1 (creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                let copyOfDemouser1InteractionObj = null;
                interactionsUtils.rejectOntologyFromQuickList(true, agent, copyOfDemouser1InteractionObj, function (err, res)
                {
                    should.exist(err);
                    should.exist(res);
                    res.statusCode.should.equal(500);
                    // because it is the first validation that fails when checking on the server side, even if all fields are missing
                    res.body.message.should.equal("Invalid interaction type in the request's body. It should be : reject_ontology_from_quick_list");
                    // SHOULD NOT BE IN THE MYSQL DATABASE
                    interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                    {
                        should.equal(err, null);
                        should.exist(info);
                        info[0].nInteractions.should.equal(1);
                        done();
                    });
                });
            });
        });
    });

    describe("[POST] [Valid Cases] /interactions/reject_ontology_from_quick_list", function ()
    {
        it("Should accept and register an interaction when an ontology is rejected from the quick list when logged in as demouser1 (the creator of the current project)", function (done)
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
                    interactionsUtils.rejectOntologyFromQuickList(true, agent, demouser1InteractionObj, function (err, res)
                    {
                        should.equal(err, null);
                        res.statusCode.should.equal(200);
                        // SHOULD ALSO BE IN THE MYSQL DATABASE
                        interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                        {
                            should.equal(err, null);
                            should.exist(info);
                            info[0].nInteractions.should.equal(2);
                            interactionsUtils.getLatestInteractionInDB(function (err, info)
                            {
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

        it("Should accept and register an interaction when an ontology is rejected from the quick list when logged in as demouser2 (a collaborator on the current project)", function (done)
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
                    interactionsUtils.rejectOntologyFromQuickList(true, agent, demouser2InteractionObj, function (err, res)
                    {
                        should.equal(err, null);
                        res.statusCode.should.equal(200);
                        // SHOULD ALSO BE IN THE MYSQL DATABASE
                        interactionsUtils.getNumberOfInteractionsInDB(function (err, info)
                        {
                            should.equal(err, null);
                            should.exist(info);
                            info[0].nInteractions.should.equal(3);
                            interactionsUtils.getLatestInteractionInDB(function (err, info)
                            {
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
