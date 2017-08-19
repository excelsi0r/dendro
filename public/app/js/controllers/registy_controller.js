angular.module('dendroApp.controllers')
/**
 *  Project administration controller
 */
    .controller('registryCtrl', function (
        $scope,
        $http,
        $filter,
        $q,
        $location,
        $log,
        $sce,
        focus,
        preview,
        $localStorage,
        $timeout,
        metadataService,
        windowService,
        projectsService,
        usersService
    )
    {
        $scope.active_tab = null;
        $scope.registries = [];

        $scope.hostUrl = window.location.protocol + "//" + window.location.host + "/user/";



        $scope.init = function(){

        };

        $scope.getPublicRegistry = function(){
            const url = "oi";
            $http({
                method: "GET",
                url: url,
                contentType: "application/json",
                headers: {"Accept": "application/json"}
            }).then(function(response){
                //TODO like this?????????????????
                $scope.registries = response;
            }).catch(function(error){

            });
        };

        $scope.getAuthorizedRegistry = function () {

        };

        $scope.get_project = function()
        {
            var url = $scope.get_current_url()+"?metadata&deep=true";

            $http({
                method: 'GET',
                url: url,
                data: JSON.stringify({}),
                contentType: "application/json",
                headers: {'Accept': "application/json"}
            }).then(function(response) {
                //console.log(data);
                $scope.project = response.data;

                for(var i = 0; i < $scope.project.descriptors.length; i++)
                {
                    var descriptor = $scope.project.descriptors[i];
                    if(descriptor.prefixedForm == "ddr:deleted" && descriptor.value == true)
                    {
                        project.deleted = true;
                    }
                }
            })
                .catch(function(error){
                    if(error.message != null && error.title != null)
                    {
                        Utils.show_popup("error", error.title, error.message);
                    }
                    else
                    {
                        Utils.show_popup("error", "Error occurred", JSON.stringify(error));
                    }
                });
        };




        $scope.get_contributors = function(contributors){
            if(contributors != "") {
                var names = contributors.split(",");
                projectsService.get_contributors(names)
                    .then(function(response){
                        var users = response.contributors;
                        $scope.contributors = [];
                        for (var i in users) {
                            $scope.contributors.push({"info": users[i], "remove": false});
                        }
                    });

            }
        };



        $scope.clicked_information_tab = function()
        {
            $scope.active_tab = 'information';
            $localStorage.active_tab = $scope.active_tab;
        };

        $scope.clicked_metadataquality_tab = function()
        {
            $scope.active_tab = 'metadataquality';
            $localStorage.active_tab = $scope.active_tab;
        };

        $scope.clicked_people_tab = function()
        {
            $scope.active_tab = 'people';
            $localStorage.active_tab = $scope.active_tab;
        };
    });