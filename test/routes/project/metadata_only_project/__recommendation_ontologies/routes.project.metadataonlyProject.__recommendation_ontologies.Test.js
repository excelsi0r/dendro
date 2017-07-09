const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const _ = require('underscore');
chai.use(chaiHttp);

const Config = global.Config;

const userUtils = require(Config.absPathInTestsFolder("utils/user/userUtils.js"));
const itemUtils = require(Config.absPathInTestsFolder("utils/item/itemUtils.js"));
const projectUtils = require(Config.absPathInTestsFolder("utils/project/projectUtils.js"));
const repositoryUtils = require(Config.absPathInTestsFolder("utils/repository/repositoryUtils.js"));
const appUtils = require(Config.absPathInTestsFolder("utils/app/appUtils.js"));

const demouser1 = require(Config.absPathInTestsFolder("mockdata/users/demouser1.js"));
const demouser2 = require(Config.absPathInTestsFolder("mockdata/users/demouser2.js"));
const demouser3 = require(Config.absPathInTestsFolder("mockdata/users/demouser3.js"));

const metadataProject = require(Config.absPathInTestsFolder("mockdata/projects/metadata_only_project.js"));
const invalidProject = require(Config.absPathInTestsFolder("mockdata/projects/invalidProject.js"));

const addMetadataToFoldersUnit = appUtils.requireUncached(Config.absPathInTestsFolder("units/metadata/addMetadataToFolders.Unit.js"));
const db = appUtils.requireUncached(Config.absPathInTestsFolder("utils/db/db.Test.js"));

describe("Metadata only project level recommendation_ontologies", function () {
    before(function (done) {
        this.timeout(60000);
        addMetadataToFoldersUnit.setup(function (err, results) {
            should.equal(err, null);
            done();
        });
    });

    /**
     * Project-level recommendation of descriptors
     */
    describe(metadataProject.handle + "?recommendation_ontologies", function ()
    {
        it('[HTML] should refuse the request if "application/json" Accept header is absent', function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                projectUtils.getRecommendationOntologiesForProject(false, agent, metadataProject.handle, function (err, res) {
                    res.statusCode.should.equal(400);
                    res.body.should.not.be.instanceof(Array);
                    done();
                });
            });
        });

        it('[JSON] should forbid ontology recommendation requests for ontologies in project '+ metadataProject.handle +' if no user is authenticated.', function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);
            projectUtils.getRecommendationOntologiesForProject(true, agent, metadataProject.handle, function (err, res) {
                res.statusCode.should.equal(401);
                res.body.should.not.be.instanceof(Array);
                done();
            });
        });

        it('[JSON] should allow ontology recommendation requests for ontologies in project '+ metadataProject.handle +' if user ' +demouser1.username+ ' is authenticated (creator).', function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                projectUtils.getRecommendationOntologiesForProject(true, agent, metadataProject.handle, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.body.should.be.instanceof(Array);
                    done();
                });
            });
        });

        it('[JSON] should forbid ontology recommendation requests in project '+ metadataProject.handle +' if user ' +demouser3.username+ ' is authenticated (not contributor nor creator).', function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent) {
                projectUtils.getRecommendationOntologiesForProject(true, agent, metadataProject.handle, function (err, res) {
                    res.statusCode.should.equal(401);
                    res.body.should.not.be.instanceof(Array);
                    done();
                });
            });
        });

        it('[JSON] should allow ontology recommendation requests in project '+ metadataProject.handle +' if user ' +demouser2.username+ ' is authenticated (contributor).', function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                projectUtils.getRecommendationOntologiesForProject(true, agent, metadataProject.handle, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.body.should.be.instanceof(Array);
                    done();
                });
            });
        });
    });

    describe(invalidProject.handle+"?recommendation_ontologies", function ()
    {
        it('[HTML] should refuse the request if "application/json" Accept header is absent', function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                projectUtils.getRecommendationOntologiesForProject(false, agent, invalidProject.handle, function (err, res) {
                    res.statusCode.should.equal(400);
                    res.body.should.not.be.instanceof(Array);
                    done();
                });
            });
        });

        it('[JSON] should forbid requests for recommendations in folder '+ invalidProject.handle +' if no user is authenticated.', function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);
            projectUtils.getRecommendationOntologiesForProject(true, agent, invalidProject.handle, function (err, res) {
                res.statusCode.should.equal(401);
                res.body.should.not.be.instanceof(Array);
                done();
            });
        });

        it('[JSON] should give a not found error for requests for recommendations in project '+ invalidProject.handle +' if user ' +demouser1.username+ ' is authenticated.', function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                projectUtils.getRecommendationOntologiesForProject(true, agent, invalidProject.handle, function (err, res) {
                    res.statusCode.should.equal(404);
                    res.body.should.not.be.instanceof(Array);
                    done();
                });
            });
        });

        it('[JSON] should give a not found error for requests for recommendations in project '+ invalidProject.handle +' if user ' +demouser3.username+ ' is authenticated.', function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent) {
                projectUtils.getRecommendationOntologiesForProject(true, agent, invalidProject.handle, function (err, res) {
                    res.statusCode.should.equal(404);
                    res.body.should.not.be.instanceof(Array);
                    done();
                });
            });
        });

        it('[JSON] should give a not found error for requests for recommendations in project '+ invalidProject.handle +' if user ' +demouser2.username+ ' is authenticated.', function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                projectUtils.getRecommendationOntologiesForProject(true, agent, invalidProject.handle, function (err, res) {
                    res.statusCode.should.equal(404);
                    res.body.should.not.be.instanceof(Array);
                    done();
                });
            });
        });
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