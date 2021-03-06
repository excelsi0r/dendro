angular.module("dendroApp.controllers")
/**
 *  Avatar controller
 */
    .controller("dendroConfigurationController", function ($scope, $http, $filter, $window, $element, storageService, dendroConfigurationService)
    {
        $scope.storageNamespace = "dendro_admin_controller";

        $scope.clicked_tab = function (tabId)
        {
            $scope.active_tab = tabId;
            $scope.save_to_local_storage("active_tab", tabId, $scope.storageNamespace);
        };

        $scope.setReadOnly = function (_editor)
        {
            _editor.setReadOnly(true);
        };

        $scope.getConfiguration = function ()
        {
            dendroConfigurationService.getConfiguration()
                .then(function (configuration)
                {
                    $scope.serverConfiguration = JSON.stringify(configuration.deployment_configs, null, 4);
                    $scope.runningConfiguration = JSON.stringify(configuration.config, null, 4);
                    $scope.pm2Description = JSON.stringify(configuration.pm2_description, null, 4);
                });
        };

        $scope.nukeOrphanResources = function ()
        {
            $scope.orphanResources = null;
            $scope.nukedResources = null;
            bootbox.confirm("DO YOU REALLY WANT TO NUKE THE ORPHAN RESOURCES?", function (confirmed)
            {
                if (confirmed)
                {
                    dendroConfigurationService.nukeOrphanResources()
                        .then(function (data)
                        {
                            Utils.show_popup("success", "Nuked", data.message);
                            $scope.nukedResources = data;
                        })
                        .catch(function (error)
                        {
                            Utils.show_popup("error", "Error", "Error nuking orphan resources in gridfs");
                            Utils.show_popup("error", "Error", JSON.stringify(error));
                            $scope.nukedResources = JSON.stringify(error);
                        });
                }
            });
        };

        $scope.listOrphanResources = function ()
        {
            $scope.orphanResources = null;
            $scope.nukedResources = null;
            dendroConfigurationService.listOrphanResources()
                .then(function (data)
                {
                    Utils.show_popup("success", "Orphans:", data.message);
                    $scope.orphanResources = data;
                })
                .catch(function (error)
                {
                    Utils.show_popup("error", "Error", "Error Looking for orphan resources in gridfs");
                    Utils.show_popup("error", "Error", JSON.stringify(error));
                    $scope.orphanResources = JSON.stringify(error);
                });
        };

        $scope.getLogs = function ()
        {
            $scope.fetchingLogs = true;
            storageService.save_to_local_storage("nLinesOfLogToFetch", $scope.nLinesOfLogToFetch);
            storageService.save_to_local_storage("millisecsLogRefresh", $scope.millisecsLogRefresh);

            dendroConfigurationService.getLogs($scope.nLinesOfLogToFetch)
                .then(function (logs)
                {
                    $scope.fetchingLogs = false;
                    $scope.combinedLog = logs.combined;
                    $scope.errorLog = logs.error;
                })
                .catch(function (error)
                {
                    Utils.show_popup("error", "Error", error.data.message);
                    $scope.autoRefreshLogs = false;
                });
        };

        $scope.saveConfiguration = function ()
        {
            dendroConfigurationService.saveConfiguration($scope.serverConfiguration)
                .then(function (data)
                {
                    Utils.show_popup("success", "Saved", data.message);
                })
                .catch(function (error)
                {
                    Utils.show_popup("error", "Error", "Error saving configuration");
                    Utils.show_popup("error", "Error", JSON.stringify(error));
                });
        };

        $scope.restartServer = function ()
        {
            dendroConfigurationService.restartServer();
        };

        $scope.toggleAutoRefreshLogs = function ()
        {
            $scope.autoRefreshLogs = !$scope.autoRefreshLogs;
            storageService.save_to_local_storage("autoRefreshLogs", $scope.autoRefreshLogs);
        };

        $scope.periodicLogRefresh = function ()
        {
            setTimeout(function ()
            {
                if ($scope.autoRefreshLogs)
                {
                    $scope.getLogs();
                    $scope.periodicLogRefresh();
                }
            }, $scope.millisecsLogRefresh);
        };

        $scope.init = function ()
        {
            $scope.set_from_local_storage_and_then_from_value("nLinesOfLogToFetch", 30, $scope);
            $scope.set_from_local_storage_and_then_from_value("autoRefreshLogs", false, $scope);
            $scope.set_from_local_storage_and_then_from_value("millisecsLogRefresh", 10000, $scope);

            $scope.set_from_local_storage_and_then_from_value("active_tab", "logs", $scope, $scope.storageNamespace);
            $scope.active_tab = $scope[$scope.storageNamespace].active_tab;

            $scope.getConfiguration();
            $scope.getLogs();
            $scope.periodicLogRefresh();
        };
    });
