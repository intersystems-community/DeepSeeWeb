(function() {
    'use strict';

    function ConnectorSvc($http, $location, $rootScope) {
        var self = this;
        this.isSigned = true;
        this.username = "";
        this.namespace = "samples";
        this.url = "http://146.185.143.59/MDX2JSON/";
        //this.url = "http://37.139.4.54/MDX2JSON/";

        this.getDashboards = function() {
            return $http({
                method: 'GET',
                url: self.url + 'Dashboards?Namespace=' + this.namespace,
                withCredentials: true
            });
        };

        this.execMDX = function(mdx) {
            return $http({
                method: 'POST',
                url: self.url + 'MDX?Namespace=' + this.namespace,
                data: {MDX: mdx},
                timeout: 10000, //TODO: add to constant
                withCredentials: true/*,
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded"
                }*/
            });
        };

        this.getWidgets = function(dashboard) {
            return $http({
                method: 'POST',
                url: self.url + 'Widgets?Namespace=' + this.namespace,// + "&Debug",
                data: JSON.stringify({Dashboard: dashboard}),
                timeout: 10000, //TODO: add to constant
                withCredentials: true,
                headers: {'Content-Type': 'application/json'}
                /*headers: {
                    'Content-Type': "application/json"
                    //'Content-Type': "application/x-www-form-urlencoded"
                }*/
            });
            /*return {
                children: [{
                    "basemdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY [Discount].[H1].[Discount Type].Members ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Area Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 195030219,
                    "mdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY [Discount].[H1].[Discount Type].Members ON 1 FROM [HoleFoods]",
                    "title": "Area Chart",
                    "type": "areaChart"
                }, {
                    "basemdx": "SELECT NON EMPTY [Outlet].[H1].[Country].&[USA] ON 0,NON EMPTY [DateOfSale].[Actual].[YearSold].Members ON 1 FROM [HoleFoods] %FILTER [Measures].[Amount Sold]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Bar Chart2.pivot",
                    "drillDownDataSource": "",
                    "key": 476047807,
                    "mdx": "SELECT NON EMPTY [Outlet].[H1].[Country].&[USA] ON 0,NON EMPTY [DateOfSale].[Actual].[YearSold].Members ON 1 FROM [HoleFoods] %FILTER [Measures].[Amount Sold]",
                    "title": "Bar Chart",
                    "type": "barChart"
                }, {
                    "basemdx": "SELECT NON EMPTY {%LABEL([Measures].[Units Sold].AVG,\"Avg Units Sold\",\"\"),%LABEL([Measures].[Amount Sold].AVG,\"Avg Revenue\",\"\")} ON 0,NON EMPTY [Product].[P1].[Product Name].Members ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Bubble Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 239765083,
                    "mdx": "SELECT NON EMPTY {%LABEL([Measures].[Units Sold].AVG,\"Avg Units Sold\",\"\"),%LABEL([Measures].[Amount Sold].AVG,\"Avg Revenue\",\"\")} ON 0,NON EMPTY [Product].[P1].[Product Name].Members ON 1 FROM [HoleFoods]",
                    "title": "Bubble Chart",
                    "type": "bubbleChart"
                }, {
                    "basemdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY {%LABEL([Product].[All Product],\"All Products\",\"\"),[Product].[P1].[Product Name].&[SKU-203]} ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Bullseye Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 804887114,
                    "mdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY {%LABEL([Product].[All Product],\"All Products\",\"\"),[Product].[P1].[Product Name].&[SKU-203]} ON 1 FROM [HoleFoods]",
                    "title": "Bullseye Chart",
                    "type": "bullseyeChart"
                }, {
                    "basemdx": "SELECT NON EMPTY {[Measures].[Amount Sold],[Measures].[Units Sold]} ON 0,NON EMPTY [DateOfSale].[Actual].[YearSold].Members ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Combo Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 219731203,
                    "mdx": "SELECT NON EMPTY {[Measures].[Amount Sold],[Measures].[Units Sold]} ON 0,NON EMPTY [DateOfSale].[Actual].[YearSold].Members ON 1 FROM [HoleFoods]",
                    "title": "Line Chart with Markers",
                    "type": "lineChartMarkers"
                }, {
                    "basemdx": "SELECT NON EMPTY {%LABEL([Measures].[Amount Sold].MIN,\"Min Revenue\",\"\"),%LABEL([Measures].[Amount Sold].MAX,\"Max Revenue\",\"\")} ON 0,NON EMPTY [Product].[P1].[Product Category].Members ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/High Low Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 445495717,
                    "mdx": "SELECT NON EMPTY {%LABEL([Measures].[Amount Sold].MIN,\"Min Revenue\",\"\"),%LABEL([Measures].[Amount Sold].MAX,\"Max Revenue\",\"\")} ON 0,NON EMPTY [Product].[P1].[Product Category].Members ON 1 FROM [HoleFoods]",
                    "title": "High Low Chart",
                    "type": "hilowChart"
                }, {
                    "basemdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY [Discount].[H1].[Discount Type].Members ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Line Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 633808158,
                    "mdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY [Discount].[H1].[Discount Type].Members ON 1 FROM [HoleFoods]",
                    "title": "Line Chart",
                    "type": "lineChart"
                }, {
                    "basemdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY [Product].[P1].[Product Category].Members ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Pie Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 798482751,
                    "mdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY [Product].[P1].[Product Category].Members ON 1 FROM [HoleFoods]",
                    "title": "Pie Chart",
                    "type": "pieChart"
                }, {
                    "basemdx": "SELECT [Measures].[Amount Sold] ON 0,NON EMPTY [DateOfSale].[Actual].[DaySold].Members ON 1 FROM [HoleFoods] %FILTER [Measures].[Amount Sold]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Time Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 993750179,
                    "mdx": "SELECT [Measures].[Amount Sold] ON 0,NON EMPTY [DateOfSale].[Actual].[DaySold].Members ON 1 FROM [HoleFoods] %FILTER [Measures].[Amount Sold]",
                    "title": "Time Chart",
                    "type": "timeChart"
                }, {
                    "basemdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY [Product].[P1].[Product Category].Members ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/Tree Map Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 658380965,
                    "mdx": "SELECT NON EMPTY [Measures].[Amount Sold] ON 0,NON EMPTY [Product].[P1].[Product Category].Members ON 1 FROM [HoleFoods]",
                    "title": "Tree Map Chart",
                    "type": "treeMapChart"
                }, {
                    "basemdx": "SELECT NON EMPTY {[Measures].[Units Sold],[Measures].[Amount Sold]} ON 0,NON EMPTY ORDER([Product].[P1].[Product Name].Members,Measures.[Units Sold],BASC) ON 1 FROM [HoleFoods]",
                    "controls": [],
                    "cube": "HoleFoods",
                    "dataSource": "Chart Demos\/XY Chart.pivot",
                    "drillDownDataSource": "",
                    "key": 475687736,
                    "mdx": "SELECT NON EMPTY {[Measures].[Units Sold],[Measures].[Amount Sold]} ON 0,NON EMPTY ORDER([Product].[P1].[Product Name].Members,Measures.[Units Sold],BASC) ON 1 FROM [HoleFoods]",
                    "title": "X\/Y Chart",
                    "type": "xyChart"
                }
                ]
            }*/
        };

        this.signIn = function(login, password, namespace) {
            this.namespace = namespace;
            this.username = login;
            return $http({
                method: 'GET',
                url: this.url + 'Test?Namespace=' + this.namespace,
                timeout: 10000,
                headers: {
                    'Authorization': 'Basic ' + btoa(login + ":" + password)
                    //'X-Requested-With': "XMLHttpRequest"
                }
            });
        };

        this.signOut = function () {
            this.username = "";
            this.isSigned = false;
            $rootScope.$broadcast('signout', "");
            $location.path("/login");
        };

        this.checkSigned = function() {
            if (!this.isSigned) $location.path("/login");
        };
    }

    angular.module('app')
        .service('Connector', ['$http', '$location', '$rootScope', ConnectorSvc]);

})();
