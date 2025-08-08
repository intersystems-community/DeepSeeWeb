/** LightPivotTable
 ** A lightweight pivot table for MDX2JSON source for InterSystems Cache
 ** @author ZitRo
 ** @version 1.8.14
 ** @license Apache 2.0
 ** @see https://github.com/ZitRos/LightPivotTable
 **/
LightPivotTable = (function(){/**
 * @param {LightPivotTable} controller
 * @param {function} dataChangeTrigger
 * @constructor
 */
var DataController = function (controller, dataChangeTrigger) {

    if (dataChangeTrigger && typeof dataChangeTrigger !== "function") {
        throw new Error("dataChangeTrigger parameter must be a function");
    }

    this._dataStack = [];

    this.controller = controller;

    this.pushData();
    this.dataChangeTrigger = dataChangeTrigger;

    this.SUMMARY_SHOWN = false;

};

/**
 * Performs check if data is valid.
 *
 * @param {{ dimensions: Object[], dataArray: Array, info: Object }} data
 * @returns boolean
 */
DataController.prototype.isValidData = function (data) {

    // add null column to display measures
    if (
        data.dimensions instanceof Array
        && data.dimensions[0] instanceof Array
        && !data.dimensions[0].length
    )
        data.dimensions[0] = [{}];

    return data.dimensions instanceof Array
        && data.dimensions[0] instanceof Array
        //&& data.dimensions[0].length > 0
        //&& data.dimensions[1].length > 0
        //&& data.dimensions[0][0].hasOwnProperty("caption")
        //&& data.dimensions[1][0].hasOwnProperty("caption")
        && data.dataArray instanceof Array
        && typeof data["info"] === "object"
        && data["info"]["cubeName"];

};

DataController.prototype.pushData = function () {

    var d;

    this._dataStack.push(d = {
        data: null,
        SUMMARY_SHOWN: this.SUMMARY_SHOWN,
        SORT_STATE: {
            column: null,
            order: -1
        }
    });

    //this.data = d.data;
    this.SORT_STATE = d.SORT_STATE;

};

DataController.prototype.popData = function () {

    if (this._dataStack.length < 2) return;

    var d = this._dataStack[this._dataStack.length - 2];

    this._dataStack.pop();

    //this.data = d.data;
    this.SUMMARY_SHOWN = d.SUMMARY_SHOWN;
    this.SORT_STATE = d.SORT_STATE;

};

DataController.prototype.getData = function () {

    return this._dataStack[this._dataStack.length - 1].data || {};

};

DataController.prototype.setData = function (data) {

    if (!this.isValidData(data)) {
        console.error("Invalid data to set.", data);
        return;
    }

    this._dataStack[this._dataStack.length - 1].data = data;
    this.setLeftHeaderColumnsNumber(data); // required in resetDimensionProps()
    this.pivotDataProcess(data);
    this.resetDimensionProps();
    this.resetConditionalFormatting();
    this.resetRawData();
    this.modifyRawData(data);
    this.postDataProcessing(data);

    if (data.info.mdxType === "drillthrough") {
        this.setDrillThroughHandler(
            this.controller.pivotView.listingClickHandler.bind(this.controller.pivotView)
        );
    }
    // console.log(data);
    this._trigger();
    return data;

};

/**
 * Function that process pivot data.
 * @param [data]
 */
DataController.prototype.pivotDataProcess = function ( data ) {

    var totals = this.controller.getPivotProperty(["rowTotals"]);

    if (typeof totals === "boolean") {
        this.controller.CONFIG["showSummary"] = totals;
    }

};

/**
 * Handle drillThrough on current level.
 * If handler returns boolean false, drillThrough won't be performed.
 *
 * @param {function} handler
 */
DataController.prototype.setDrillThroughHandler = function (handler) {
    this._dataStack[this._dataStack.length - 1].data.info.drillThroughHandler = handler;
};

/**
 * Sets properties of rows/columns.
 */
DataController.prototype.resetDimensionProps = function () {

    var data, columnProps, rowProps;

    if (!(data = this._dataStack[this._dataStack.length - 1].data)) {
        console.error("Unable to get dimension props for given data set.");
        return;
    }

    columnProps = []; // fill left headers as empty
    rowProps = []; // fill left headers as empty

    var cloneObj = function (obj) {
        var i, newObj = {};
        for (i in obj) newObj[i] = obj[i];
        return newObj;
    };

    var parse = function (dimProps, obj, props) {
        var tObj, clonedProps, i;
        if (obj["children"] && obj["children"].length > 0) {
            for (i in obj.children) {
                clonedProps = cloneObj(props);
                tObj = obj.children[i];
                if (tObj["format"]) clonedProps["format"] = tObj["format"];
                if (tObj["style"]) clonedProps["style"] =
                    (clonedProps["style"] || "") + tObj["style"];
                if (tObj["summary"]) clonedProps["summary"] = tObj["summary"];
                // somehow "summary" were changed to "total" - reapplying
                if (tObj["total"]) clonedProps["summary"]
                    = (tObj["total"] || "").toLowerCase().replace(/:.*/, ""); // what is "max:Days"?
                if (tObj["type"]) clonedProps["type"] = tObj["type"];
                parse(dimProps, tObj, clonedProps);
            }
        } else {
            dimProps.push(cloneObj(props));
        }
    };

    parse(columnProps, { children: data.dimensions[0] }, {});
    parse(rowProps, { children: data.dimensions[1] }, {});

    data.columnProps = columnProps;
    data.rowProps = rowProps;

};

/**
 * Try to recognise type by given value.
 * @param {*} value
 */
DataController.prototype.getTypeByValue = function (value) {

    if (!isNaN(value)) {
        return { type: "number" };
    } else if ((value + "").match(/[0-9]{2}\.[0-9]{2}\.[0-9]{2,4}/)) { // local date (unique case for RU)
        return {
            type: "date",
            comparator: function (value) {
                var arr = value.split(".");
                return new Date(arr[2], arr[1], arr[0]); // day
            }
        };
    } else if (Date.parse(value)) { // standard date recognized by JS
        return {
            type: "date",
            comparator: function (value) {
                return new Date(value);
            }
        }
    } else {
        return { type: "string" };
    }

};

DataController.prototype.postDataProcessing = function (data) {

    var cell, col;

    if (!data || !data.rawData || !data.rawData[data.info.topHeaderRowsNumber]) return;
    if (!data.columnProps) data.columnProps = [];

    // Inserts pseudo-type to cell. If data.columnProps[col]["$FORMAT"].comparator is a function, then this function
    // will be used to sort value of columns. @see DataController.sortByColumn.
    for (col = data.info.leftHeaderColumnsNumber; cell = data.rawData[data.info.topHeaderRowsNumber][col]; col++) {
        if (!data.columnProps[col]) data.columnProps[col] = {};
        data.columnProps[col]["$FORMAT"] = this.getTypeByValue(cell.value);
    }

};

DataController.prototype.resetConditionalFormatting = function () {

    var data, cs, c1, c2, arr, min, max,
        cfArr = {/* "[y],[x]|<null>": Array[{style:"", operator: "", ...}] */},
        ocfArr;

    if (!(data = this._dataStack[this._dataStack.length - 1].data)) {
        console.error("Unable to get conditional formatting for given data set.");
        return;
    }
    if (!(this.controller.CONFIG.pivotProperties)) {
        data.conditionalFormatting = cfArr;
        return;
    }

    if (cs = this.controller.CONFIG.pivotProperties["colorScale"]) {
        if (cs.indexOf("custom:") > -1) {
            arr = cs.split(":")[1].split(",");
            c2 = { r: parseInt(arr[0]), g: parseInt(arr[1]), b: parseInt(arr[2]) };
            arr = cs.split(":")[2].split(",");
            c1 = { r: parseInt(arr[0]), g: parseInt(arr[1]), b: parseInt(arr[2]) };
        } else {
            arr = cs.split("-to-");
            c1 = this.controller.pivotView.colorNameToRGB(arr[0]);
            c2 = this.controller.pivotView.colorNameToRGB(arr[1]);
        }
        cfArr["colorScale"] = {
            from: c2,
            to: c1,
            min: min = Math.min.apply(Math, (data.dataArray || [])),
            max: max = Math.max.apply(Math, (data.dataArray || [])),
            diff: max - min,
            invert: (c2.r + c2.b + c2.g) / 3 < 128
        };
    }

    ocfArr = this.controller.CONFIG.pivotProperties["formatRules"] || [];
    if (ocfArr.length && typeof this.controller.CONFIG.conditionalFormattingOn === "undefined") {
        this.controller.CONFIG.conditionalFormattingOn = true;
    }
    for (var i in ocfArr) {
        // Warn: range ",2-3" is valid for standard pivot as ",2".
        // LPT will parse ",2-3" range as invalid.
        if (!cfArr[ocfArr[i]["range"]]) cfArr[ocfArr[i]["range"]] = [];
        cfArr[ocfArr[i]["range"]].push(ocfArr[i]);
    }
    data.conditionalFormatting = cfArr;

};

/**
 * Total functions definition. When adding new total function, also check getTotalFunction.
 * "this" in context of functions equals to TOTAL_FUNCTIONS object.
 *
 * @see getTotalFunction
 */
DataController.prototype.TOTAL_FUNCTIONS = {

    isNumber: function (a) {
        if (a == "") return false;
        return isFinite(a);
    },

    totalSUM: function (array, iStart, iEnd, column, xStart, row) {
        var sum = 0;
        for (var i = iStart; i < iEnd; i++) {
            var r = typeof row === "undefined" ? i : row,
                c = typeof column === "undefined" ? i : column;
            if (array[r] && array[r][c] && this.isNumber(array[r][c]["value"])) {
                sum += parseFloat(array[r][c]["value"]) || 0;
            }
        }
        return sum;
    },

    totalAVG: function (array, iStart, iEnd, column, xStart, row) {
        var sum = 0;
        for (var i = iStart; i < iEnd; i++) {
            var r = typeof row === "undefined" ? i : row,
                c = typeof column === "undefined" ? i : column;
            if (!this.isNumber(array[r][c]["value"])) {
                sum = 0;
                break;
            }
            sum += parseFloat(array[r][c]["value"]) || 0;
        }
        return sum/(iEnd - iStart) || "";
    },

    totalCOUNT: function (array, iStart, iEnd, column, xStart, row) {
        var count = 0;
        for (var i = iStart; i < iEnd; i++) {
            var r = typeof row === "undefined" ? i : row,
                c = typeof column === "undefined" ? i : column;
            if (array[r][c]["value"]) {
                count++;
            }
        }
        return count;
    },

    totalMIN: function (array, iStart, iEnd, column, xStart, row) {
        var min = Infinity;
        for (var i = iStart; i < iEnd; i++) {
            var r = typeof row === "undefined" ? i : row,
                c = typeof column === "undefined" ? i : column;
            if (this.isNumber(array[r][c]["value"]) && array[r][c]["value"] < min) {
                min = array[r][c]["value"];
            }
        }
        return min;
    },

    totalMAX: function (array, iStart, iEnd, column, xStart, row) {
        var max = -Infinity;
        for (var i = iStart; i < iEnd; i++) {
            var r = typeof row === "undefined" ? i : row,
                c = typeof column === "undefined" ? i : column;
            if (this.isNumber(array[r][c]["value"]) && array[r][c]["value"] > max) {
                max = array[r][c]["value"];
            }
        }
        return max;
    },

    totalPERCENTAGE: function (array, iStart, iEnd, column, xStart, row, bothTotals) {
        if (bothTotals && row === array.length - 1) {
          return '100%';
        }
        var averages = [], x, summ;
        var offset = bothTotals ? 1 : 0; // if totals are shown, then offset by 1
        for (x = xStart; x < ((typeof column === "undefined") ? (array.length - offset) : array[0].length); x++) {
            averages.push(this.totalSUM(array, iStart, iEnd,
                typeof column === "undefined" ? column : x, xStart,
                typeof row === "undefined" ? row : x));
        }
        summ = averages.reduce(function(a, b) { return a + b; });
        return (averages[(typeof row === "undefined" ? column : row) - xStart]
            / summ * 100 || 0).toFixed(2) + "%";
    },

    totalNONE: function () {
        return "";
    }

};

DataController.prototype.setLeftHeaderColumnsNumber = function (data) {

    function getLev (o, lev) {
        if (!(o.children instanceof Array)) return lev;
        var nextLev = lev + 1;
        for (var i = 0; i < o.children.length; i++) {
            lev = Math.max(getLev(o.children[i], nextLev), lev);
        }
        return lev;
    }

    data.info.leftHeaderColumnsNumber = getLev({ children: data.dimensions[1] || [] }, 0);

};

/**
 * Renders table data (pseudo-table object) from data retrieved from MDX2JSON source.
 *
 * @returns {Object}
 */
DataController.prototype.resetRawData = function () {

    var TOTALS_STYLE = "font-weight: bold;text-align: right;";

    var data, summary, y, x,
        dimCaption,
        _ = this;

    if (!(data = this._dataStack[this._dataStack.length - 1].data)) {
        console.error("Unable to create raw data for given data set.");
        return null;
    }

    var rd0 = [], rd1 = [], groupNum = 2, rawData = [];
    var MEASURES_HIDDEN = _.controller.CONFIG["pivotProperties"]
        && _.controller.CONFIG["pivotProperties"]["hideMeasures"] === 2;

    var transpose = function (a) {
        return Object.keys(a[0]).map(function (c) {
            return a.map(function (r) {
                return r[c];
            });
        });
    };

    var dim0raw = function (a, c, arr) {

        dim1raw(rd0, c, arr, true);

        var i, maxLen = 0;
        for (i in rd0) { if (rd0[i].length > maxLen) maxLen = rd0[i].length; }
        for (i in rd0) { for (var u = rd0[i].length; u < maxLen; u++) {
            rd0[i].push(rd0[i][rd0[i].length - 1]);
        }}

        rd0 = transpose(rd0);

    };

    var applyHeaderStyle = function (cellObject, isHorizontal) {
        if (!_.controller.CONFIG["pivotProperties"]) return;
        if (_.controller.CONFIG["pivotProperties"]["columnHeaderStyle"] && isHorizontal) {
            cellObject.style = _.controller.CONFIG["pivotProperties"]["columnHeaderStyle"];
        } else if (_.controller.CONFIG["pivotProperties"]["rowHeaderStyle"] && !isHorizontal) {
            cellObject.style = _.controller.CONFIG["pivotProperties"]["rowHeaderStyle"];
        }
    };

    var getMaxLevel = function (children, level) {

        if (typeof level === "undefined")
            level = 0;

        function maxLevel (node, level) {
            if (node.children) {
	            var max = 0;
	            for (var i in node.children) {
	                max = Math.max(max, maxLevel(node.children[i], level + 1));
                }
                return max;
            } else {
	            if (node["type"] === "msr" && MEASURES_HIDDEN)
	                return level - 1;
	            return level;
            }
        }

        return children.reduce(
            function (acc, node) { return Math.max(acc, maxLevel(node, 1)) },
            level
        );

    };

    var dim1raw = function (a, c, arr, hor, level, maxLevel) {

        var cnum, obj, sameGroup;

        if (!arr) {
            arr = [];
        }

        for (var i in c) {
            cnum = groupNum;
            if (level < maxLevel && !(c[i].children && c[i].children.length)) { // maxLevel is not reached, but no child
                c[i].children = [{}];
                sameGroup = true; // let the child cells join parent cell
            }
            if (c[i].children && c[i].children.length) {
                if (!sameGroup) groupNum++; else sameGroup = false;
                obj = {
                    group: cnum,
                    source: c[i],
                    isCaption: true,
                    value: c[i].caption || ""
                };
                applyHeaderStyle(obj, hor);
                dim1raw(a, c[i].children, arr.concat(obj), hor, level? level + 1 : level, maxLevel);
            } else {
                obj = {
                    group: groupNum,
                    source: c[i],
                    isCaption: true,
                    value: c[i].caption || ""
                };
                applyHeaderStyle(obj, hor);
                a.push(c[i]["type"] === "msr" && MEASURES_HIDDEN ? arr : arr.concat(obj));
                groupNum++;
            }
        }

    };

    var parseColumnFormatting = function (rawData) {
        if (!_.controller.CONFIG["pivotProperties"]) return rawData;
        var x, y, i, xEnd = rawData[0].length,
            colLevels = _.controller.getPivotProperty(["columnLevels"]),
            rowLevels = _.controller.getPivotProperty(["rowLevels"]),
            formatColumn = {
                // "<spec>": { style: "<style>" }
            },
            formatRow = {
                // "<spec>": { style: "<style>" } // unused
            };
        var fillLevels = function (temp, obj) {
            if (typeof obj === "undefined") return;
            for (var i in obj["childLevels"]) {
                if (obj["childLevels"][i] && obj["childLevels"][i]["spec"]) {
                    temp[(obj["childLevels"][i]["spec"] || "").replace(/[^.]*$/, "")] = {
                        style: obj["childLevels"][i]["levelStyle"] || "",
                        headStyle: obj["childLevels"][i]["levelHeaderStyle"] || ""
                    };
                }
                fillLevels(obj["childLevels"][i]);
            }
        };
        for (i in colLevels) {
            fillLevels(formatColumn, { childLevels: [colLevels[i]] });
            fillLevels(formatRow, { childLevels: [rowLevels[i]] });
        }
        for (y = 0; y < rawData.length; y++) {
            for (x = 0; x < xEnd; x++) {
                if (!rawData[y][x].isCaption) {
                    xEnd = x;
                    break;
                }
                if (rawData[y][x].source && rawData[y][x].source["path"]) {
                    var formatCR = data.info.topHeaderRowsNumber > y ? formatColumn : formatRow;
                    for (i in formatCR) {
                        if (rawData[y][x].source["path"].indexOf(i) >= 0) {
                            // var yy;
                            // for (yy = y; yy < rawData.length; yy++) {
                                if (!rawData[y][x].isCaption) {
                                    if (formatCR[i].style) rawData[y][x].style = (rawData[y][x].style || "")
                                        + formatCR[i].style || "";
                                } else {
                                    if (formatCR[i].headStyle) rawData[y][x].style = (rawData[y][x].style || "")
                                        + formatCR[i].headStyle || "";
                                }
                            // }
                            break;
                        }
                    }
                }
            }
        }
        return rawData;
    };

    if (data.dimensions[0].length) {
        dim0raw(rd0, data.dimensions[0]);
    }
    if (data.dimensions[1].length) {
        dim1raw(rd1, data.dimensions[1], undefined, undefined, 1, getMaxLevel(data.dimensions[1]));
    }
    if (rd1[0]) dimCaption = (rd1[0][rd1[0].length - 1] || { source: {} }).source["dimension"];

    var xw = (rd0[0] || []).length,
        yh = rd1.length || data.info.rowCount || 0,
        xh = rd0.length || data.info.colCount || 0,
        yw = (rd1[0] || []).length,
        attachTotals = !!this.controller.CONFIG["attachTotals"];

    // render columns, rows and data
    for (y = 0; y < xh + yh; y++) {
        if (!rawData[y]) rawData[y] = [];
        for (x = 0; x < yw + xw; x++) {
            if (x < yw) {
                if (y < xh) {
                    rawData[y][x] = {
                        group: 1,
                        isCaption: true,
                        value: this.controller.getPivotProperty(["showRowCaption"]) === false ? "" :
                            this.controller.CONFIG["caption"]
                            || dimCaption
                            || (data["info"] || {})["cubeName"]
                            || ""
                    };
                    applyHeaderStyle(rawData[y][x], false);
                } else {
                    rawData[y][x] = rd1[y-xh][x];
                }
            } else {
                if (y < xh) {
                    rawData[y][x] = rd0[y][x-yw];
                } else {
                    rawData[y][x] = {
                        value: data.dataArray[(xw)*(y - xh) + x - yw]
                    };
                }
            }
        }
    }

    data.info.topHeaderRowsNumber = xh;
    data.info.SUMMARY_SHOWN = false;
    data.info.leftHeaderColumnsNumber = yw;
    this.SUMMARY_SHOWN = false;
    this._dataStack[this._dataStack.length - 1].SUMMARY_SHOWN = false;

    for (i = 0; i < data.info.leftHeaderColumnsNumber; i++) { data.columnProps.unshift({}); }
    for (i = 0; i < data.info.topHeaderRowsNumber; i++) { data.rowProps.unshift({}); }

    /**
     * @param {number} columnIndex
     * @param {boolean=false} byColumns
     * @returns {Function}
     */
    var getTotalFunction = function (columnIndex, byColumns) {
        var pivotDefault = _.controller.getPivotProperty(["rowTotalAgg"]) || "sum",
            pivotDefaultCol = _.controller.getPivotProperty(["columnTotalAgg"]) || "sum",
            props = byColumns ? "rowProps" : "columnProps";
        if (!data[props][columnIndex] && !(byColumns ? pivotDefaultCol : pivotDefault))
            return _.TOTAL_FUNCTIONS.totalSUM;
        switch ((data[props][columnIndex] || {}).summary || (byColumns ? pivotDefaultCol : pivotDefault)) {
            case "count": return _.TOTAL_FUNCTIONS.totalSUM; // _.TOTAL_FUNCTIONS.totalCOUNT; https://github.com/intersystems-ru/LightPivotTable/issues/4
            case "avg": return _.TOTAL_FUNCTIONS.totalAVG;
            case "min": return _.TOTAL_FUNCTIONS.totalMIN;
            case "max": return _.TOTAL_FUNCTIONS.totalMAX;
            case "pct": return _.TOTAL_FUNCTIONS.totalPERCENTAGE;
            case "none": return _.TOTAL_FUNCTIONS.totalNONE;
            default: return _.TOTAL_FUNCTIONS.totalSUM;
        }
    };

    if (this.controller.CONFIG["showSummary"] && rawData.length - data.info.topHeaderRowsNumber > 1
        && (rawData[rawData.length - 1][0] || {})["isCaption"]) {
        data.info.SUMMARY_SHOWN = true;
        this.SUMMARY_SHOWN = true;
        this._dataStack[this._dataStack.length - 1].SUMMARY_SHOWN = true;
        summary = [];
        x = rawData.length - 2;
        for (var i in rawData[x]) {
            if (rawData[x][i].isCaption) {
                summary[i] = {
                    group: groupNum,
                    isCaption: true,
                    source: {},
                    noDrillDown: true,
                    value: pivotLocale.get(0)
                };
                applyHeaderStyle(summary[i], false);
            } else {
                summary[i] = {
                    value: getTotalFunction(parseInt(i)).call(
                        this.TOTAL_FUNCTIONS,
                        rawData, xh, rawData.length, i, data.info.leftHeaderColumnsNumber
                    ),
                    style: TOTALS_STYLE
                }
            }
        }
        groupNum++;
        if (attachTotals) {
            rawData.splice(data.info.topHeaderRowsNumber, 0, summary);
            data.info.topHeaderRowsNumber++;
        } else {
            rawData.push(summary);
        }
    }

    if (this.controller.getPivotProperty(["columnTotals"])
        && rawData.length - data.info.topHeaderRowsNumber > 1
        && data.info.leftHeaderColumnsNumber > 0) {
        var group = ++groupNum,
            row;
        for (row = 0; row < data.info.topHeaderRowsNumber; row++) {
            var totalFunction = getTotalFunction(row, true);
            var headerText = totalFunction === _.TOTAL_FUNCTIONS.totalPERCENTAGE ?
                pivotLocale.get(5) : pivotLocale.get(0);
            rawData[row].push({
                group: group,
                isCaption: true,
                value: headerText
            });
        }
        for (row = data.info.topHeaderRowsNumber; row < rawData.length; row++) {
            var rowTotalsExist = this.controller.getPivotProperty(["rowTotals"]);
            var columnTotalsExist = this.controller.getPivotProperty(["columnTotals"]);
            rawData[row].push({
                isCaption: true,
                value: getTotalFunction(row, true).call(
                    this.TOTAL_FUNCTIONS,
                    rawData, data.info.leftHeaderColumnsNumber, rawData[row].length, undefined,
                    data.info.leftHeaderColumnsNumber, row, rowTotalsExist && columnTotalsExist
                ),
                style: TOTALS_STYLE
            });
        }
    }

    rawData = parseColumnFormatting(rawData);

    data.rawData = data._rawDataOrigin = rawData;

    return data.rawData;

};

/**
 * Trigger the dataChangeTrigger.
 *
 * @private
 */
DataController.prototype._trigger = function () {

    if (this.dataChangeTrigger) this.dataChangeTrigger();

};

/**
 * Sort raw data by column.
 *
 * @param columnIndex
 */
DataController.prototype.sortByColumn = function (columnIndex) {

    var data = this._dataStack[this._dataStack.length - 1].data,
        totalsAttached = this.SUMMARY_SHOWN && this.controller.CONFIG["attachTotals"] ? 1 : 0,
        comparator;

    if (this.SORT_STATE.column !== columnIndex) {
        order = this.SORT_STATE.order = 0;
    }

    var newRawData = data._rawDataOrigin.slice(
            data.info.topHeaderRowsNumber,
            data._rawDataOrigin.length - (this.SUMMARY_SHOWN && !totalsAttached ? 1 : 0)
        ),
        xIndex = data.info.leftHeaderColumnsNumber + columnIndex,
        order = this.SORT_STATE.order === -1 ? 1 : this.SORT_STATE.order === 1 ? 0 : -1;

    this.SORT_STATE.order = order;
    this.SORT_STATE.column = columnIndex;

    for (var i in data.rawData[data.info.topHeaderRowsNumber - totalsAttached - 1]) {
        if (data.rawData[data.info.topHeaderRowsNumber - totalsAttached - 1][i].className) {
            delete data.rawData[data.info.topHeaderRowsNumber - totalsAttached - 1][i].className;
        }
    }

    if (order === 0) {
        data.rawData = data._rawDataOrigin;
        this.modifyRawData(data);
        this._trigger();
        return;
    }

    order = -order;

    if (typeof (comparator = ((data.columnProps[columnIndex] || {})["$FORMAT"] || {}).comparator) === "function") {
        newRawData.sort(function (a, b) { // sort using comparator function
            if (comparator(b[xIndex].value) > comparator(a[xIndex].value)) return order;
            if (comparator(b[xIndex].value) < comparator(a[xIndex].value)) return -order;
            return 0;
        });
    } else { // simple sort
        newRawData.sort(function (a, b) {
            if (b[xIndex].value > a[xIndex].value) return order;
            if (b[xIndex].value < a[xIndex].value) return -order;
            return 0;
        });
    }

    data.rawData = data._rawDataOrigin.slice(0, data.info.topHeaderRowsNumber)
        .concat(newRawData)
        .concat(this.SUMMARY_SHOWN && !totalsAttached
            ? [data._rawDataOrigin[data._rawDataOrigin.length - 1]]
            : []
        );
    data.rawData[data.info.topHeaderRowsNumber - totalsAttached - 1]
        [data.info.leftHeaderColumnsNumber + columnIndex]
        .className = order === 0 ? "" : order === 1 ? "lpt-sortDesc" : "lpt-sortAsc";

    this.modifyRawData(data);

    this._trigger();

};

/**
 * Filter raw data by part of value.
 *
 * @param {string} valuePart
 * @param {number} columnIndex
 */
DataController.prototype.filterByValue = function (valuePart, columnIndex) {

    var data = this._dataStack[this._dataStack.length - 1].data,
        totalsAttached = this.SUMMARY_SHOWN && this.controller.CONFIG["attachTotals"] ? 1 : 0,
        newRawData = data._rawDataOrigin.slice(
            data.info.topHeaderRowsNumber,
            data._rawDataOrigin.length - (this.SUMMARY_SHOWN && !totalsAttached ? 1 : 0)
        ),
        re = null;

    try {
        re = new RegExp(valuePart, "i");
    } catch (e) {
        try {
            re = new RegExp(valuePart.replace(/([()[{*+.$^\\|?])/g, "\\$1"), "i");
        } catch (e) {
            return;
        }
    }

    newRawData = newRawData.filter(function (row) {
        return (row[columnIndex].value || "").toString().match(re);
    });

    data.rawData = data._rawDataOrigin.slice(0, data.info.topHeaderRowsNumber)
        .concat(newRawData)
        .concat(this.SUMMARY_SHOWN && !totalsAttached
            ? [data._rawDataOrigin[data._rawDataOrigin.length - 1]]
            : []
    );

    this.modifyRawData(data);

    this._trigger();

};

/**
 * Modifies data if such settings are present.
 */
DataController.prototype.modifyRawData = function (data) {

    // modify data.rawData and original properties (such as width and height) if needed.

    var i = -1;

    if (this.controller.CONFIG.showRowNumbers && !data.info.leftHeaderColumnsNumber) { // listing
        if (data.rawData[0] && data.rawData[0][0].special) { // just update indices
            data.rawData.forEach(function (row) {
                row[0].value = ++i === 0 ? "#" : i;
                row[0].isCaption = i === 0;
            });
        } else { // re-create indexes
            data.rawData.forEach(function (row) {
                row.unshift({
                    value: ++i === 0 ? "#" : i,
                    isCaption: i === 0,
                    special: true,
                    noClick: true
                });
            });
            if (data.columnProps instanceof Array) {
                data.columnProps.unshift({});
            }
            data.info.colCount++;
        }
    }

    var y = data.info.topHeaderRowsNumber - 1;
    for (i = data.info.leftHeaderColumnsNumber; i < data.rawData[y].length; i++) {
        data.rawData[y][i].style = "min-width:"
            + (this.controller.getPivotProperty(["cellWidth"]) || 100) + "px;"
            + (data.rawData[y][i].style ? data.rawData[y][i].style : "");
    }

};
/**
 * Data source.
 *
 * Must implement methods.
 *
 * @param {Object} config
 * @param {Object} globalConfig
 * @param {LightPivotTable} lpt
 * @param {number=1} [drillLevel]
 * @constructor
 */
var DataSource = function (config, globalConfig, lpt, drillLevel) {

    this.SOURCE_URL = config.MDX2JSONSource ||
        location.host + ":" + location.port + "/" + (location.pathname.split("/") || [])[1];
    this.NAMESPACE = config["namespace"];
    this.USERNAME = config["username"];
    this.PASSWORD = config["password"];
    this.LPT = lpt;
    this.GLOBAL_CONFIG = globalConfig;
    this.SEND_COOKIES = config["sendCookies"] || false;
    this.DRILL_LEVEL = typeof drillLevel !== "number" ? 1 : drillLevel;

    this.BASIC_MDX = config.basicMDX;
    /**
     * Name of data source pivot.
     *
     * @type {string}
     */
    this.DATA_SOURCE_PIVOT = config["pivot"] || "";

    this.FILTERS = [];

};

/**
 * @param {string} url
 * @param {object} data
 * @param {function} callback
 * @private
 */
DataSource.prototype._post = function (url, data, callback) {
    var xhr = new XMLHttpRequest(),
        self = this;
    xhr.open("POST", url);
    if (this.SEND_COOKIES) xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        var handler;
        if (xhr.readyState === 4) {
            handler = self.LPT.CONFIG.triggers["responseHandler"];
            if (typeof handler === "function") {
                handler.call(self.LPT, {
                    url: url,
                    status: xhr.status,
                    xhr: xhr
                });
            }
        }
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback((function () {
                try {
                    return JSON.parse(xhr.responseText) || {}
                } catch (e) {
                    try {
                        var temp = null;
                        eval("temp=" + xhr.responseText);
                        return temp;
                    } catch (e) {
                        return {
                            error: "<h1>Unable to parse server response</h1><p>" + xhr.responseText
                            + "</p>"
                        };
                    }
                }
            })());
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            callback({
                error: xhr.responseText || pivotLocale.get(3) + "<br/>" +
                       xhr.status + ": " + xhr.statusText
            });
        }
    };
    if (this.USERNAME && this.PASSWORD) {
        xhr.setRequestHeader("Authorization", "Basic " + btoa(this.USERNAME + ":" + this.PASSWORD));
    }
    xhr.send(JSON.stringify(data));
};

/**
 * Converts data from MDX2JSON source to LightPivotTable representation.
 *
 * @param {object} data
 * @private
 */
DataSource.prototype._convert = function (data) {

    var o;

    if (typeof data !== "object" || data.error) return { error: data.error || true };

    try {
        o = {
            dimensions: [
                data["Cols"][0]["tuples"],
                data["Cols"][1] ? data["Cols"][1]["tuples"] : [{caption:""}]
            ],
            dataArray: data["Data"],
            info: data["Info"]
        };
        return o;
    } catch (e) {
        console.error("Error while parsing data:", e);
        return { error: data.error || true };
    }

};

/**
 * @param {string} spec - an MDX specification of the filter.
 */
DataSource.prototype.setFilter = function (spec) {

    this.FILTERS.push(spec);

};

DataSource.prototype.clearFilters = function () {

    this.FILTERS = [];

};

/**
 * @param {function} callback
 */
DataSource.prototype.getCurrentData = function (callback) {

    var _ = this,
        __ = this._convert,
        mdx = this.BASIC_MDX,
        mdxParser = new MDXParser(),
        mdxType = mdxParser.mdxType(mdx),
        ready = {
            state: 0,
            data: {},
            pivotData: {}
        };

    for (var i = 0; i < this.FILTERS.length; i++) {
        mdx = mdxParser.applyFilter(mdx, this.FILTERS[i]);
    }

    if (typeof this.GLOBAL_CONFIG.rowCount === "number") {
        mdx = mdxParser.applyRowCount(mdx, this.GLOBAL_CONFIG.rowCount);
    }

    var setupPivotOptions = function () {

        var data = ready.pivotData;

        _.GLOBAL_CONFIG["pivotProperties"] = ready.pivotData;

        if (data["rowAxisOptions"]) {
            if (data["rowAxisOptions"]["drilldownSpec"]) {
                _.GLOBAL_CONFIG["DrillDownExpression"] =
                    _.GLOBAL_CONFIG["DrillDownExpression"]
                    || data["rowAxisOptions"]["drilldownSpec"].split("^");
            }
            if (data["rowAxisOptions"]["levelFormat"]
                || data["columnAxisOptions"]
                && data["columnAxisOptions"]["levelFormat"]) {
                _.GLOBAL_CONFIG["formatNumbers"] =
                    _.GLOBAL_CONFIG["formatNumbers"]
                    || data["columnAxisOptions"]["levelFormat"]
                    || data["rowAxisOptions"]["levelFormat"];
            }
        }

    };

    var handleDataReady = function () {

        var data = ready.data;

        //console.log("Retrieved data:", ready);

        if (mdxType === "drillthrough") {
            callback((function (data) {

                var arr = data["children"] || [],
                    headers = [],
                    obj, i, u;

                if (!arr.length) return {
                    error: pivotLocale.get(4)
                };

                for (i in arr[0]) {
                    headers.push({ caption: i });
                }

                obj = {
                    Cols: [ { tuples: headers }, { tuples: [] } ],
                    Data: [],
                    Info: {
                        colCount: 8,
                        cubeClass: "No cube class",
                        cubeName: "No cube name",
                        leftHeaderColumnsNumber: 0,
                        rowCount: arr.length,
                        topHeaderRowsNumber: headers.length,
                        mdxType: mdxType
                    }
                };

                for (i in arr) {
                    for (u in arr[i]) {
                        obj.Data.push(arr[i][u]);
                    }
                }

                return __(obj);

            })(data));
        } else if (mdxType === "mdx") {
            if (
                !data || !data.Data || !data.Data.length || !data.Cols
                || (!data.Data.length && !((data.Cols[0]||{}).tuples||[]).length)
                && !((data.Cols[1]||{}).tuples||[]).length
            ) {
                return callback({
                    error: pivotLocale.get(4)
                });
            }
            callback(_._convert(data));
        } else {
            callback({ error: "Unrecognised MDX type: " + mdx || true });
        }

    };

    var requestData = function () {

        if (_.LPT.CONFIG["logs"]) console.log("LPT MDX request:", mdx);

        var setData = function (data) {
            _.LPT.pivotView.removeMessage();
            ready.data = data;
            ready.state++;
            handleDataReady();
        };

        // fill initial data first time and exit
        if (_.DRILL_LEVEL === 0 && _.LPT.CONFIG["initialData"]) {
            setData(_.LPT.CONFIG["initialData"]);
            return;
        }

        _._post(
            _.SOURCE_URL + "/" +
            (mdxType === "drillthrough" ? "MDXDrillthrough" : "MDX")
            + (_.NAMESPACE ? "?Namespace=" + _.NAMESPACE : ""
        ), {
            MDX: mdx
        }, setData);

    };

    _.LPT.pivotView.displayLoading();

    if (this.DATA_SOURCE_PIVOT) {
        this._post(this.SOURCE_URL + "/DataSource"
                       + (_.NAMESPACE ? "?Namespace=" + _.NAMESPACE : ""), {
            DataSource: this.DATA_SOURCE_PIVOT
        }, function (data) {
            ready.pivotData = data;
            ready.state++;
            setupPivotOptions();
            requestData();
        });
    } else {
        _.GLOBAL_CONFIG["pivotProperties"] = {};
        requestData();
    }

};

var ExcelExport = function () {



};

ExcelExport.prototype.exportTableHTML = (function () {
    var uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
    return function (tableHTML, name) {
        var ctx = { worksheet: name || 'Worksheet', table: tableHTML };
        console.log(uri + base64(format(template, ctx)));
        window.location.href = uri + base64(format(template, ctx))
    }
})();

ExcelExport.prototype.exportXLS = function () {

    var lpt = document.getElementsByClassName("lpt")[0],
        bodyHTML  = lpt.getElementsByClassName("lpt-tableBlock")[0]
            .getElementsByTagName("table")[0].innerHTML,
        topHTML = lpt.getElementsByClassName("lpt-topHeader")[0]
            .getElementsByTagName("table")[0].innerHTML.replace(/<tr>/, "<tr><th colspan='2'></th>"),
        leftHTML = lpt.getElementsByClassName("lpt-leftHeader")[0]
            .getElementsByTagName("thead")[0].innerHTML,
        trs = leftHTML.match("<tr>(.*)</tr>")[1].split("</tr><tr>"),
        i = 0;

    bodyHTML = bodyHTML.replace(/<tr>/g, function () {
        return "<tr>" + trs[i++];
    });

    console.log(topHTML + bodyHTML);

    this.exportTableHTML(topHTML + bodyHTML, "test");

};
/**
 * Light pivot table global object.
 *
 * @param {object} configuration
 * @constructor
 */
var LightPivotTable = function (configuration) {

    var _ = this;

    if (typeof configuration !== "object") configuration = {};
    this.normalizeConfiguration(configuration);

    this._dataSourcesStack = [];

    this.DRILL_LEVEL = -1;
    this.CONFIG = configuration;
    this.VERSION = "".concat("1.8.14") || "[NotBuilt]";

    /**
     * @see this.init
     * @type {object}
     */
    this.CONTROLS = {};

    this.mdxParser = new MDXParser();

    /**
     * @type {PivotView}
     */
    this.pivotView = new PivotView(this, configuration.container);
    this.dataSource = this.pushDataSource(configuration.dataSource);

    /**
     * @type {DataController}
     */
    this.dataController = new DataController(this, function () {
        _.dataIsChanged.call(_);
    });

    this.init();

};

/**
 * Load data again from actual data source and refresh table.
 */
LightPivotTable.prototype.refresh = function () {

    var _  = this,
        i;

    if (!this.dataSource.BASIC_MDX) {
        console.log("Unable to refresh: no basic MDX set.");
        return;
    }

    this.clearFilters();
    if (this.CONFIG["defaultFilterSpecs"] instanceof Array) {
        for (i in this.CONFIG["defaultFilterSpecs"]) {
            this.setFilter(this.CONFIG["defaultFilterSpecs"][i]);
        }
    }

    this.dataSource.getCurrentData(function (data) {
        if (_.dataController.isValidData(data)) {
            _.dataController.setData(data);
        } else {
            _.pivotView.displayMessage(data.error || pivotLocale.get(2));
        }
    });

};

/**
 * @param {string} mdx - New mdx.
 */
LightPivotTable.prototype.changeBasicMDX = function (mdx) {

    // return LPT to the first level
    for (var i = this._dataSourcesStack.length - 1; i > 0; i--) {
        this.popDataSource();
        this.pivotView.popTable();
        this.dataController.popData();
    }
    // change MDX
    this.CONFIG.dataSource.basicMDX = mdx;
    this.dataSource.BASIC_MDX = mdx;
    // do refresh
    this.refresh();

};

LightPivotTable.prototype.setRowCount = function (n) {

    this.CONFIG.rowCount = n;

};

/**
 * Returns current mdx including filters.
 * @returns {string}
 * @deprecated
 */
LightPivotTable.prototype.getActualMDX = function () {

    var mdx = this.dataSource.BASIC_MDX,
        mdxParser = new MDXParser(),
        filters = this.dataSource.FILTERS;

    for (var i in filters) {
        mdx = mdxParser.applyFilter(mdx, filters[i]);
    }

    if (typeof this.CONFIG.rowCount === "number") {
        mdx = mdxParser.applyRowCount(mdx, this.CONFIG.rowCount);
    }

    return mdx;

};

/**
 * Returns if current display is listing.
 */
LightPivotTable.prototype.isListing = function () {

    return (this.dataController.getData().info || {}).leftHeaderColumnsNumber === 0;

};

/**
 * Return array with selected rows indexes.
 */
LightPivotTable.prototype.getSelectedRows = function () {

    var arr = [], rows = this.pivotView.selectedRows, i;

    for (i in rows) {
        if (rows[i]) arr.push(+i);
    }

    return arr;

};

/**
 * Return array of passed rows values.
 * @param {Number[]} rows - Rows indices in the table. Index 1 points to the first row with data.
 * @returns {*[]}
 */
LightPivotTable.prototype.getRowsValues = function (rows) {
    if (typeof rows === "undefined")
        return [];
    if (!(rows instanceof Array))
        rows = [rows];
    if (rows.length === 0)
        return [];
    var d = this.dataController.getData(),
        arr = [];
    for (var i = 0; i < rows.length; i++) {
        arr.push(d.rawData[rows[i] - 1 + (d.info.topHeaderRowsNumber || 1)]);
    }
    return arr;
};

/**
 * Returns currently rendered model.
 */
LightPivotTable.prototype.getModel = function () {
    return this.dataController.getData();
};

/**
 * Performs resizing.
 */
LightPivotTable.prototype.updateSizes = function () {

    this.pivotView.updateSizes();

};

/**
 * Ability to set filter. Manual refresh is required.
 * Example: spec = "[DateOfSale].[Actual].[YearSold].&[2009]"; *.refresh();
 *
 * @param {string} spec - an MDX specification of the filter.
 */
LightPivotTable.prototype.setFilter = function (spec) {

    this.dataSource.setFilter(spec);

};

/**
 * Clear all filters that was set before.
 */
LightPivotTable.prototype.clearFilters = function () {

    this.dataSource.clearFilters();

};

/**
 * @param {object} config - part of dataSource configuration. Usually a part of config given to LPT.
 * @returns {DataSource}
 */
LightPivotTable.prototype.pushDataSource = function (config) {

    var newDataSource;

    this.DRILL_LEVEL++;
    this._dataSourcesStack.push(
        newDataSource = new DataSource(config || {}, this.CONFIG, this, this.DRILL_LEVEL)
    );
    this.dataSource = newDataSource;

    return newDataSource;

};

/**
 * @param {boolean} [popData = true] - Also pop data in dataSource.
 */
LightPivotTable.prototype.popDataSource = function (popData) {

    if (this._dataSourcesStack.length < 2) return;

    this.DRILL_LEVEL--;
    this._dataSourcesStack.pop();
    if (!popData) this.dataController.popData();

    this.dataSource = this._dataSourcesStack[this._dataSourcesStack.length - 1];

};

/**
 * Data change handler.
 */
LightPivotTable.prototype.dataIsChanged = function () {

    this.pivotView.dataChanged(this.dataController.getData());

};

/**
 * Try to DrillDown with given filter.
 *
 * @param {string} filter
 */
LightPivotTable.prototype.tryDrillDown = function (filter) {

    var _ = this,
        oldDataSource,
        ds = {};

    // clone dataSource config object
    for (var i in _.CONFIG.dataSource) { ds[i] = _.CONFIG.dataSource[i]; }

    if (this.CONFIG.DrillDownExpression && !(this.CONFIG.DrillDownExpression instanceof Array)) {
        this.CONFIG.DrillDownExpression = [this.CONFIG.DrillDownExpression];
    }

    if ((this.CONFIG.DrillDownExpression || [])[this.DRILL_LEVEL]) {
        ds.basicMDX = this.mdxParser.drillDown(
            this.dataSource.BASIC_MDX, filter, this.CONFIG.DrillDownExpression[this.DRILL_LEVEL]
        ) || this.dataSource.BASIC_MDX;
    } else {
        ds.basicMDX = this.mdxParser.drillDown(this.dataSource.BASIC_MDX, filter) || this.dataSource.BASIC_MDX;
    }

    oldDataSource = this.dataSource;

    this.pushDataSource(ds);

    this.dataSource.FILTERS = oldDataSource.FILTERS;

    this.dataSource.getCurrentData(function (data) {
        if (_.dataController.isValidData(data)
            && data.dataArray.length > 0
            && data.dimensions[1]
            && data.dimensions[1][0]
            && (data.dimensions[1][0]["caption"]
                || data.dimensions[1][0]["dimension"]
                || data.dimensions[1][0]["path"])) {
            _.pivotView.pushTable();
            _.dataController.pushData();
            _.dataController.setData(data);
            if (typeof _.CONFIG.triggers["drillDown"] === "function") {
                _.CONFIG.triggers["drillDown"].call(_, {
                    level: _.DRILL_LEVEL,
                    mdx: ds.basicMDX,
                    path: data.dimensions[1][0]["path"] || ""
                });
            }
        } else {
            _.popDataSource(true);
        }
    });

};

/**
 * Try to DrillThrough with given filters.
 *
 * @param {string[]} [filters]
 */
LightPivotTable.prototype.tryDrillThrough = function (filters) {

    var _ = this,
        oldDataSource,
        ds = {};

    // clone dataSource config object
    for (var i in _.CONFIG.dataSource) { ds[i] = _.CONFIG.dataSource[i]; }

    // get custom listing
    const customListing = this.CONFIG.controls?.find(c => c.action === 'showListing')?.targetProperty;

    ds.basicMDX = this.mdxParser.drillThrough(this.dataSource.BASIC_MDX, filters, customListing)
        || this.dataSource.basicMDX;

    oldDataSource = this.dataSource;
    this.pushDataSource(ds);
    this.dataSource.FILTERS = oldDataSource.FILTERS;

    this.dataSource.getCurrentData(function (data) {
        if (_.dataController.isValidData(data) && data.dataArray.length > 0) {
            _.pivotView.pushTable({
                disableConditionalFormatting: true
            });
            _.dataController.pushData();
            _.dataController.setData(data);
            if (typeof _.CONFIG.triggers["drillThrough"] === "function") {
                _.CONFIG.triggers["drillThrough"].call(_, {
                    level: _.DRILL_LEVEL,
                    mdx: ds.basicMDX
                });
            }
        } else {
            _.popDataSource(true);
        }
    });

};

/**
 * Crash-safe function to get properties of pivot.
 *
 * @param {string[]} path
 * @returns {*|undefined}
 */
LightPivotTable.prototype.getPivotProperty = function (path) {
    if (!this.CONFIG["pivotProperties"]) return undefined;
    if (!(path instanceof Array)) path = [];
    var obj = this.CONFIG["pivotProperties"]; path = path.reverse();
    while (path.length
           && typeof obj !== "undefined") {
        obj = obj[path.pop()];
    }
    return obj;
};

/**
 * Attaches the trigger during the runtime.
 * @param {string} triggerName
 * @param {function} trigger
 */
LightPivotTable.prototype.attachTrigger = function (triggerName, trigger) {
    if (typeof trigger !== "function") {
        console.warn("LPT.addTrigger: pass the trigger as a second argument.");
        return;
    }
    this.CONFIG.triggers[triggerName] = trigger;
};

/**
 * Fill up to normal config structure to avoid additional checks and issues.
 *
 * @param config
 */
LightPivotTable.prototype.normalizeConfiguration = function (config) {
    if (typeof config["columnResizing"] === "undefined") config.columnResizing = true;
    if (typeof config["pagination"] === "undefined") config.pagination = 200;
    if (typeof config["enableSearch"] === "undefined") config.enableSearch = true;
    if (typeof config["stretchColumns"] === "undefined") config.stretchColumns = true;
    if (typeof config["enableListingSelect"] === "undefined") config.enableListingSelect = true;
    if (typeof config["showListingRowsNumber"] === "undefined")
        config.showListingRowsNumber = true;
    if (!config["triggers"]) config.triggers = {};
    if (!config["dataSource"]) config.dataSource = {};
};

LightPivotTable.prototype.init = function () {

    var _ = this;

    this.CONTROLS.drillThrough = function () {
        _.pivotView._drillThroughClickHandler.call(_.pivotView);
    };

    this.CONTROLS.customDrillThrough = function (filters) {
        if (!(filters instanceof Array)) {
            console.error("Parameter \"filters\" must be array of strings.");
            return;
        }
        _.tryDrillThrough.call(_, filters);
    };

    this.CONTROLS.back = function () {
        _.pivotView._backClickHandler.call(_.pivotView);
    };

    if (this.CONFIG["locale"]) { pivotLocale.setLocale(this.CONFIG["locale"]); }

    this.refresh();

};

/**
 * MDX parser.
 *
 * @author ZitRo
 * @constructor
 */
var MDXParser = function () {};

/**
 * Debug method.
 *
 * @param {string} mdx
 * @param {string} [message]
 * @private
 */
MDXParser.prototype._warnMDX = function (mdx, message) {
    console.warn("MDX is not parsed:\n\n%s\n\n" + (message ? "(" + message + ")" : ""), mdx);
};

/**
 * Converts filter to setExpression that can be inserted to MDX.
 *
 * @param filterSpec
 */
MDXParser.prototype.makeSetExpressionFromFilter = function (filterSpec) {
    if (filterSpec.match(/^\([^\),]*,[^\)]*\)$/)) {
        return "NONEMPTYCROSSJOIN" + filterSpec.slice(0, filterSpec.length - 1) + ".children)";
    } else {
        return filterSpec + ".children";
    }
};

/**
 * If expression has no "NON EMPTY" it will be prepended.
 * @param expression
 */
MDXParser.prototype.prependNonEmpty = function (expression) {
    return expression.match(/^\s*non\s+empty/i) ? expression : "NON EMPTY " + expression;
};

/**
 * Applies Row Count to mdx.
 * Source: SELECT [Test].Members ON 0, NON EMPTY      [Test2].Members     ON 1 FROM [Tests] %FILTER
 * Out:    SELECT [Test].Members ON 0, NON EMPTY HEAD([Test2].Members, N) ON 1 FROM [Tests] %FILTER
 * @param {string} expression - MDX expression.
 * @param {number} n - Number of rows to return.
 * @returns {string}
 */
MDXParser.prototype.applyRowCount = function (expression, n) {
    return expression.replace(/\s*on\s*0\s*,\s*(?:non\s*empty\s*)?(.*)\s*on\s*1/i, function (a,b) {
        return typeof n !== "undefined" ? " ON 0, NON EMPTY HEAD(" + b + ", " + n + ") ON 1" : a;
    });
};

/**
 * Performs DrillDown on MDX query.
 * @param {string} mdx
 * @param {string} filter
 * @param {string} [expression] - if is set, "* ON 1" will be replaced with "{value} ON 1"
 * @returns {string} - new query.
 */
MDXParser.prototype.drillDown = function (mdx, filter, expression) {

    if (!filter) {
        if (/]\s+ON\s+1/i.test(mdx)) {
            return mdx = mdx.replace(/]\s+ON\s+1/i, "].children ON 1");
        } else {
            this._warnMDX(mdx, "no filter specified");
            return "";
        }
    }

    var parts = mdx.split(/(select\s*)(.*?)(\s*from)/ig); // split by SELECT queries

    if (parts.length < 4) {
        this._warnMDX(mdx);
        return ""; // no select query matched
    }

    var selectBody = parts[parts.length - 3],
        dimensions = selectBody.split(/(\s*ON\s*[01]\s*,?\s*)/i);

    if (dimensions.length < 2) {
        this._warnMDX(mdx, "DrillDown is impossible");
        return ""; // no dimensions matched
    }

    var index = -1;
    dimensions.map(function(e,i){if(e.match(/\s*ON\s*[01]\s*,?\s*/i)) index=i-1; return e;});

    if (index === -1) {
        this._warnMDX(mdx, "DrillDown is impossible");
        return ""; // DrillDown is impossible (no "1" dimension)
    }

    let order = '';
    const orderMatch = dimensions[index].match(/ORDER\((.*?)\,/);

    if (orderMatch && orderMatch[0]) {
        order = orderMatch[0];
    }

    if (order) {
        dimensions[index] = (expression || dimensions[index]).replace(order, 'ORDER(' + this.makeSetExpressionFromFilter(filter) + ',');
    } else {
        dimensions[index] =
            this.prependNonEmpty(expression || this.makeSetExpressionFromFilter(filter));
    }
    for (var i in dimensions) {
        if (dimensions[i].length === 1) { // "0" || "1"
            dimensions[i](parseInt(i), 1);
        }
    }
    parts[parts.length - 3] = dimensions.join("");

    return this.applyFilter(parts.join(""), filter);

};

/**
 * @param {string} basicMDX
 * @param {string[]} [filters]
 */
MDXParser.prototype.drillThrough = function (basicMDX, filters, customListing) {

    var cubeAndFilters = basicMDX.slice(basicMDX.lastIndexOf("FROM ")),
        query = "DRILLTHROUGH SELECT " + cubeAndFilters;

    for (var i in filters) {
        query = this.applyFilter(query, filters[i]);
    }

    if (customListing) {
        query += ` %LISTING [${customListing}]`;
    }

    return query;

};

/**
 * Returns type of MDX.
 *
 * @param {string} mdx
 */
MDXParser.prototype.mdxType = function (mdx) {

    var m = mdx.toLowerCase(),
        dt = m.indexOf("drillthrough"),
        dd = m.indexOf("select");

    if (dt > -1) {
        return "drillthrough";
    } else if (dd > -1) {
        return "mdx";
    } else {
        return "unknown";
    }

};

/**
 * @param {string} basicMDX
 * @param {string} filterSpec
 */
MDXParser.prototype.applyFilter = function (basicMDX, filterSpec) {

    return basicMDX + (filterSpec ? " %FILTER " + filterSpec : "");

};

/*!
 * numeral.js
 * version : 1.5.3
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */

var numeral = function () {

    /************************************
     Constants
     ************************************/

    var numeral,
        VERSION = '1.5.3',
    // internal storage for language config files
        languages = {},
        currentLanguage = 'en',
        zeroFormat = null,
        defaultFormat = '0,0';

    var NUMBER_GROUP_LENGTH = 3,
        NUMBER_GROUP_SEPARATOR = ",",
        DECIMAL_SEPARATOR = ".",
        NUM_REGEX = new RegExp("(\\d)(?=(\\d{" + NUMBER_GROUP_LENGTH + "})+(?!\\d))", "g");

    /************************************
     Constructors
     ************************************/


    // Numeral prototype object
    function Numeral (number) {
        this._value = number;
    }

    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
     * problems for accounting- and finance-related software.
     */
    function toFixed (value, precision, roundingFunction, optionals) {
        var power = Math.pow(10, precision),
            optionalsRegExp,
            output;

        //roundingFunction = (roundingFunction !== undefined ? roundingFunction : Math.round);
        // Multiply up by precision, round accurately, then divide and use native toFixed():
        output = (roundingFunction(value * power) / power).toFixed(precision);

        if (optionals) {
            optionalsRegExp = new RegExp('0{1,' + optionals + '}$');
            output = output.replace(optionalsRegExp, '');
        }

        return output;
    }

    /************************************
     Formatting
     ************************************/

    // determine what type of formatting we need to do
    function formatNumeral (n, format, roundingFunction) {
        var output;

        // figure out what kind of format we are dealing with
        if (format.indexOf('$') > -1) { // currency!!!!!
            output = formatCurrency(n, format, roundingFunction);
        } else if (format.indexOf('%') > -1) { // percentage
            output = formatPercentage(n, format, roundingFunction);
        } else if (format.indexOf(':') > -1) { // time
            output = formatTime(n, format);
        } else { // plain ol' numbers or bytes
            output = formatNumber(n._value, format, roundingFunction);
        }

        // return string
        return output;
    }

    // revert to number
    function unformatNumeral (n, string) {
        var stringOriginal = string,
            thousandRegExp,
            millionRegExp,
            billionRegExp,
            trillionRegExp,
            suffixes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            bytesMultiplier = false,
            power;

        if (string.indexOf(':') > -1) {
            n._value = unformatTime(string);
        } else {
            if (string === zeroFormat) {
                n._value = 0;
            } else {
                if (languages[currentLanguage].delimiters.decimal !== '.') {
                    string = string.replace(/\./g,'').replace(languages[currentLanguage].delimiters.decimal, '.');
                }

                // see if abbreviations are there so that we can multiply to the correct number
                thousandRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.thousand + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                millionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.million + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                billionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.billion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                trillionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.trillion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');

                // see if bytes are there so that we can multiply to the correct number
                for (power = 0; power <= suffixes.length; power++) {
                    bytesMultiplier = (string.indexOf(suffixes[power]) > -1) ? Math.pow(1024, power + 1) : false;

                    if (bytesMultiplier) {
                        break;
                    }
                }

                // do some math to create our number
                n._value = ((bytesMultiplier) ? bytesMultiplier : 1) * ((stringOriginal.match(thousandRegExp)) ? Math.pow(10, 3) : 1) * ((stringOriginal.match(millionRegExp)) ? Math.pow(10, 6) : 1) * ((stringOriginal.match(billionRegExp)) ? Math.pow(10, 9) : 1) * ((stringOriginal.match(trillionRegExp)) ? Math.pow(10, 12) : 1) * ((string.indexOf('%') > -1) ? 0.01 : 1) * (((string.split('-').length + Math.min(string.split('(').length-1, string.split(')').length-1)) % 2)? 1: -1) * Number(string.replace(/[^0-9\.]+/g, ''));

                // round if we are talking about bytes
                n._value = (bytesMultiplier) ? Math.ceil(n._value) : n._value;
            }
        }
        return n._value;
    }

    function formatCurrency (n, format, roundingFunction) {
        var symbolIndex = format.indexOf('$'),
            openParenIndex = format.indexOf('('),
            minusSignIndex = format.indexOf('-'),
            space = '',
            spliceIndex,
            output;

        // check for space before or after currency
        if (format.indexOf(' $') > -1) {
            space = ' ';
            format = format.replace(' $', '');
        } else if (format.indexOf('$ ') > -1) {
            space = ' ';
            format = format.replace('$ ', '');
        } else {
            format = format.replace('$', '');
        }

        // format the number
        output = formatNumber(n._value, format, roundingFunction);

        // position the symbol
        if (symbolIndex <= 1) {
            if (output.indexOf('(') > -1 || output.indexOf('-') > -1) {
                output = output.split('');
                spliceIndex = 1;
                if (symbolIndex < openParenIndex || symbolIndex < minusSignIndex){
                    // the symbol appears before the "(" or "-"
                    spliceIndex = 0;
                }
                output.splice(spliceIndex, 0, languages[currentLanguage].currency.symbol + space);
                output = output.join('');
            } else {
                output = languages[currentLanguage].currency.symbol + space + output;
            }
        } else {
            if (output.indexOf(')') > -1) {
                output = output.split('');
                output.splice(-1, 0, space + languages[currentLanguage].currency.symbol);
                output = output.join('');
            } else {
                output = output + space + languages[currentLanguage].currency.symbol;
            }
        }

        return output;
    }

    function formatPercentage (n, format, roundingFunction) {
        var space = '',
            output,
            value = n._value * 100;

        // check for space before %
        if (format.indexOf(' %') > -1) {
            space = ' ';
            format = format.replace(' %', '');
        } else {
            format = format.replace('%', '');
        }

        output = formatNumber(value, format, roundingFunction);

        if (output.indexOf(')') > -1 ) {
            output = output.split('');
            output.splice(-1, 0, space + '%');
            output = output.join('');
        } else {
            output = output + space + '%';
        }

        return output;
    }

    function formatTime (n) {
        var hours = Math.floor(n._value/60/60),
            minutes = Math.floor((n._value - (hours * 60 * 60))/60),
            seconds = Math.round(n._value - (hours * 60 * 60) - (minutes * 60));
        return hours + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
    }

    function unformatTime (string) {
        var timeArray = string.split(':'),
            seconds = 0;
        // turn hours and minutes into seconds and add them all up
        if (timeArray.length === 3) {
            // hours
            seconds = seconds + (Number(timeArray[0]) * 60 * 60);
            // minutes
            seconds = seconds + (Number(timeArray[1]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[2]);
        } else if (timeArray.length === 2) {
            // minutes
            seconds = seconds + (Number(timeArray[0]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[1]);
        }
        return Number(seconds);
    }

    function formatNumber (value, format, roundingFunction) {
        var negP = false,
            signed = false,
            optDec = false,
            abbr = '',
            abbrK = false, // force abbreviation to thousands
            abbrM = false, // force abbreviation to millions
            abbrB = false, // force abbreviation to billions
            abbrT = false, // force abbreviation to trillions
            abbrForce = false, // force abbreviation
            bytes = '',
            ord = '',
            abs = Math.abs(value),
            suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            min,
            max,
            power,
            w,
            precision,
            thousands,
            d = '',
            neg = false;

        // check if number is zero and a custom zero format has been set
        if (value === 0 && zeroFormat !== null) {
            return zeroFormat;
        } else {
            // see if we should use parentheses for negative number or if we should prefix with a sign
            // if both are present we default to parentheses
            if (format.indexOf('(') > -1) {
                negP = true;
                format = format.slice(1, -1);
            } else if (format.indexOf('+') > -1) {
                signed = true;
                format = format.replace(/\+/g, '');
            }

            // see if abbreviation is wanted
            if (format.indexOf('a') > -1) {
                // check if abbreviation is specified
                abbrK = format.indexOf('aK') >= 0;
                abbrM = format.indexOf('aM') >= 0;
                abbrB = format.indexOf('aB') >= 0;
                abbrT = format.indexOf('aT') >= 0;
                abbrForce = abbrK || abbrM || abbrB || abbrT;

                // check for space before abbreviation
                if (format.indexOf(' a') > -1) {
                    abbr = ' ';
                    format = format.replace(' a', '');
                } else {
                    format = format.replace('a', '');
                }

                if (abs >= Math.pow(10, 12) && !abbrForce || abbrT) {
                    // trillion
                    abbr = abbr + languages[currentLanguage].abbreviations.trillion;
                    value = value / Math.pow(10, 12);
                } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !abbrForce || abbrB) {
                    // billion
                    abbr = abbr + languages[currentLanguage].abbreviations.billion;
                    value = value / Math.pow(10, 9);
                } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !abbrForce || abbrM) {
                    // million
                    abbr = abbr + languages[currentLanguage].abbreviations.million;
                    value = value / Math.pow(10, 6);
                } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !abbrForce || abbrK) {
                    // thousand
                    abbr = abbr + languages[currentLanguage].abbreviations.thousand;
                    value = value / Math.pow(10, 3);
                }
            }

            // see if we are formatting bytes
            if (format.indexOf('b') > -1) {
                // check for space before
                if (format.indexOf(' b') > -1) {
                    bytes = ' ';
                    format = format.replace(' b', '');
                } else {
                    format = format.replace('b', '');
                }

                for (power = 0; power <= suffixes.length; power++) {
                    min = Math.pow(1024, power);
                    max = Math.pow(1024, power+1);

                    if (value >= min && value < max) {
                        bytes = bytes + suffixes[power];
                        if (min > 0) {
                            value = value / min;
                        }
                        break;
                    }
                }
            }

            // see if ordinal is wanted
            if (format.indexOf('o') > -1) {
                // check for space before
                if (format.indexOf(' o') > -1) {
                    ord = ' ';
                    format = format.replace(' o', '');
                } else {
                    format = format.replace('o', '');
                }

                ord = ord + languages[currentLanguage].ordinal(value);
            }

            if (format.indexOf('[.]') > -1) {
                optDec = true;
                format = format.replace('[.]', '.');
            }

            w = value.toString().split('.')[0];
            precision = format.split('.')[1];
            thousands = format.indexOf(',');

            if (precision) {
                if (precision.indexOf('[') > -1) {
                    precision = precision.replace(']', '');
                    precision = precision.split('[');
                    d = toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                } else {
                    d = toFixed(value, precision.length, roundingFunction);
                }

                w = d.split('.')[0];

                if (d.split('.')[1].length) {
                    d = (DECIMAL_SEPARATOR || languages[currentLanguage].delimiters.decimal) + d.split('.')[1];
                } else {
                    d = '';
                }

                if (optDec && Number(d.slice(1)) === 0) {
                    d = '';
                }
            } else {
                w = toFixed(value, null, roundingFunction);
            }

            // format number
            if (w.indexOf('-') > -1) {
                w = w.slice(1);
                neg = true;
            }

            if (thousands > -1) {
                w = w.toString().replace(NUM_REGEX, '$1'
                    + (NUMBER_GROUP_SEPARATOR || languages[currentLanguage].delimiters.thousands));
            }

            if (format.indexOf('.') === 0) {
                w = '';
            }

            return ((negP && neg) ? '(' : '') + ((!negP && neg) ? '-' : '') + ((!neg && signed) ? '+' : '') + w + d + ((ord) ? ord : '') + ((abbr) ? abbr : '') + ((bytes) ? bytes : '') + ((negP && neg) ? ')' : '');
        }
    }

    /************************************
     Top Level Functions
     ************************************/

    numeral = function (input) {
        if (numeral.isNumeral(input)) {
            input = input.value();
        } else if (input === 0 || typeof input === 'undefined') {
            input = 0;
        } else if (!Number(input)) {
            input = numeral.fn.unformat(input);
        }

        return new Numeral(Number(input));
    };

    // version number
    numeral.version = VERSION;

    // compare numeral object
    numeral.isNumeral = function (obj) {
        return obj instanceof Numeral;
    };

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    numeral.language = function (key, values) {
        if (!key) {
            return currentLanguage;
        }

        if (key && !values) {
            if(!languages[key]) {
                throw new Error('Unknown language : ' + key);
            }
            currentLanguage = key;
        }

        if (values || !languages[key]) {
            loadLanguage(key, values);
        }

        return numeral;
    };

    // This function provides access to the loaded language data.  If
    // no arguments are passed in, it will simply return the current
    // global language object.
    numeral.languageData = function (key) {
        if (!key) {
            return languages[currentLanguage];
        }

        if (!languages[key]) {
            throw new Error('Unknown language : ' + key);
        }

        return languages[key];
    };

    numeral.language('en', {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                        (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '$'
        }
    });

    numeral.zeroFormat = function (format) {
        zeroFormat = typeof(format) === 'string' ? format : null;
    };

    numeral.defaultFormat = function (format) {
        defaultFormat = typeof(format) === 'string' ? format : '0.0';
    };

    /************************************
     Helpers
     ************************************/

    function loadLanguage(key, values) {
        languages[key] = values;
    }

    /************************************
     Floating-point helpers
     ************************************/

    // The floating-point helper functions and implementation
    // borrows heavily from sinful.js: http://guipn.github.io/sinful.js/

    /**
     * Array.prototype.reduce for browsers that don't support it
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility
     */
    if ('function' !== typeof Array.prototype.reduce) {
        Array.prototype.reduce = function (callback, opt_initialValue) {
            'use strict';

            if (null === this || 'undefined' === typeof this) {
                // At the moment all modern browsers, that support strict mode, have
                // native implementation of Array.prototype.reduce. For instance, IE8
                // does not support strict mode, so this check is actually useless.
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }

            if ('function' !== typeof callback) {
                throw new TypeError(callback + ' is not a function');
            }

            var index,
                value,
                length = this.length >>> 0,
                isValueSet = false;

            if (1 < arguments.length) {
                value = opt_initialValue;
                isValueSet = true;
            }

            for (index = 0; length > index; ++index) {
                if (this.hasOwnProperty(index)) {
                    if (isValueSet) {
                        value = callback(value, this[index], index, this);
                    } else {
                        value = this[index];
                        isValueSet = true;
                    }
                }
            }

            if (!isValueSet) {
                throw new TypeError('Reduce of empty array with no initial value');
            }

            return value;
        };
    }


    /**
     * Computes the multiplier necessary to make x >= 1,
     * effectively eliminating miscalculations caused by
     * finite precision.
     */
    function multiplier(x) {
        var parts = x.toString().split('.');
        if (parts.length < 2) {
            return 1;
        }
        return Math.pow(10, parts[1].length);
    }

    /**
     * Given a variable number of arguments, returns the maximum
     * multiplier that must be used to normalize an operation involving
     * all of them.
     */
    function correctionFactor() {
        var args = Array.prototype.slice.call(arguments);
        return args.reduce(function (prev, next) {
            var mp = multiplier(prev),
                mn = multiplier(next);
            return mp > mn ? mp : mn;
        }, -Infinity);
    }


    /************************************
     Numeral Prototype
     ************************************/

    numeral.setup = function (decimalSeparator, numberGroupSeparator, numberGroupLength) {
        if (decimalSeparator !== DECIMAL_SEPARATOR) DECIMAL_SEPARATOR = decimalSeparator;
        if (numberGroupSeparator !== NUMBER_GROUP_SEPARATOR)
            NUMBER_GROUP_SEPARATOR = numberGroupSeparator;
        if (numberGroupLength !== NUMBER_GROUP_LENGTH) {
            NUMBER_GROUP_LENGTH = numberGroupLength;
            NUM_REGEX = new RegExp("(\\d)(?=(\\d{" + NUMBER_GROUP_LENGTH + "})+(?!\\d))", "g");
        }
    };

    numeral.fn = Numeral.prototype = {

        clone : function () {
            return numeral(this);
        },

        format : function (inputString, roundingFunction) {
            return formatNumeral(this,
                inputString ? inputString : defaultFormat,
                (roundingFunction !== undefined) ? roundingFunction : Math.round
            );
        },

        unformat : function (inputString) {
            if (Object.prototype.toString.call(inputString) === '[object Number]') {
                return inputString;
            }
            return unformatNumeral(this, inputString ? inputString : defaultFormat);
        },

        value : function () {
            return this._value;
        },

        valueOf : function () {
            return this._value;
        },

        set : function (value) {
            this._value = Number(value);
            return this;
        },

        add : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);
            function cback(accum, curr, currI, O) {
                return accum + corrFactor * curr;
            }
            this._value = [this._value, value].reduce(cback, 0) / corrFactor;
            return this;
        },

        subtract : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);
            function cback(accum, curr, currI, O) {
                return accum - corrFactor * curr;
            }
            this._value = [value].reduce(cback, this._value * corrFactor) / corrFactor;
            return this;
        },

        multiply : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) * (curr * corrFactor) /
                    (corrFactor * corrFactor);
            }
            this._value = [this._value, value].reduce(cback, 1);
            return this;
        },

        divide : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) / (curr * corrFactor);
            }
            this._value = [this._value, value].reduce(cback);
            return this;
        },

        difference : function (value) {
            return Math.abs(numeral(this._value).subtract(value).value());
        }

    };

    this.numeral = numeral;

};

/**
 * Light pivot localization.
 *
 * @scope {pivotLocale} - Sets the pivotLocale scope variable.
 * @param {string} [locale] - Two-letter language code.
 * @constructor
 */
var PivotLocale = function (locale) {

    this.LOCALE = "";
    this.DEFAULT_LOCALE = "en";

    this.setLocale(locale
                   || (navigator.language || "").substr(0, 2)
                   || (navigator["browserLanguage"]
                   || this.DEFAULT_LOCALE).substring(0, 2));

};

/**
 * Editable locales.
 *
 * @type {{ru: string, en: string, de: string}[]}
 */
PivotLocale.prototype.LOCALES = [
 {
     "ru": "Всего",
     "en": "Total",
     "de": "Summe",
     "cs": "Celkem"
 },
 { // 1
     "ru": "Невозможно отобразить данные",
     "en": "Unable to render data",
     "de": "Daten können nicht rendern",
     "cs": "Nebylo možné zobrazit data"
 },
 { // 2
     "ru": "Неправильные данные для отображения.",
     "en": "Invalid data to display.",
     "de": "Nicht korrekt Informationen angezeigt werden soll.",
     "cs": "Nevhodná data k zobrazení"
 },
 { // 3
     "ru": "Возникла ошибка при получении данных с сервера.",
     "en": "Error while trying to retrieve data from server.",
     "de": "Beim Abrufen der Daten vom Server ist ein Fehler aufgetreten.",
     "cs": "Chyba při pokusu o získání dat ze serveru"
 },
 { // 4
     "ru": "Нет данных для отображения.",
     "en": "No data to display.",
     "de": "Keine Daten zum anzeigen.",
     "cs": "Žádná data k zobrazení"
 },
 { // 5
    "ru": "% от Всего",
    "en": "% of Total",
    "de": "% des Summe",
    "cs": "% z Celkem"
 }
];

/**
 * @param {string} locale - Two-letter code locale.
 */
PivotLocale.prototype.setLocale = function (locale) {

    var i, locales = [];

    locale = locale.toLowerCase();

    if (this.LOCALES[0].hasOwnProperty(locale)) {
        this.LOCALE = locale;
    } else {
        for (i in this.LOCALES[0]) { locales.push(i); }
        console.warn(
            "LightPivot: locale " + locale + " is not supported. Currently localized: "
            + locales.join(", ") + "."
        );
        this.LOCALE = "en";
    }

};

/**
 * Get the localized phrase.
 *
 * @param {number} index - Index of phrase.
 * @returns {string} - Localized string.
 */
PivotLocale.prototype.get = function (index) {

    return (this.LOCALES[index] || {})[this.LOCALE] || ("{not localized: " + index + "}");

};

var pivotLocale = new PivotLocale();

/**
 * @param {LightPivotTable} controller
 * @param container
 * @constructor
 */
var PivotView = function (controller, container) {

    if (!(container instanceof HTMLElement)) throw new Error("Please, provide HTMLElement " +
        "instance \"container\" into pivot table configuration.");

    this.tablesStack = [];
    this.selectedRows = {}; // rowNumber: 1

    numeral.call(this);

    this.elements = {
        container: container,
        base: document.createElement("div"),
        tableContainer: undefined,
        messageElement: undefined,
        searchSelect: undefined,
        searchInput: undefined
    };

    /**
     * Pagination object.
     * @see pushTable
     * @type {{on: boolean, page: number, pages: number, rows: number}}
     */
    this.pagination = null;

    /**
     * Saved scroll positions.
     * @type {{x: number, y: number}}
     */
    this.savedScroll = {
        x: 0,
        y: 0
    };

    /**
     * @type {number[]}
     */
    this.FIXED_COLUMN_SIZES = [];

    this.PAGINATION_BLOCK_HEIGHT = 20;
    this.ANIMATION_TIMEOUT = 500;

    this.SEARCH_ENABLED = false;
    this.SEARCHBOX_LEFT_MARGIN = 191;
    this.savedSearch = {
        restore: false,
        value: "",
        columnIndex: 0
    };

    /**
     * @type {LightPivotTable}
     */
    this.controller = controller;

    this.SCROLLBAR_WIDTH = (function () {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar";

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        outer.style.overflow = "scroll";

        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    })();

    this.init();

};

PivotView.prototype.init = function () {

    var _ = this,
        els = this.elements;

    els.base.className = "lpt";
    els.base.setAttribute("LPTVersion", this.controller.VERSION);
    els.container.appendChild(els.base);

    this.pushTable();

    this.displayLoading();

    window.addEventListener("resize", function () {
        _.updateSizes.call(_);
    });

    // easter time!
    this._ = function () {
        _.displayMessage("<a href=\"https://github.com/ZitRos/LightPivotTable\">LIGHT PIVOT TABLE" +
        " v" + _.controller.VERSION +
        "</a><br/>by <a href=\"https://plus.google.com/+NikitaSavchenko\">Nikita Savchenko</a>" +
        "<br/>for dear users of products of <a href=\"http://www.intersystems.com/\">InterSystems" +
        " Corporation</a><br/>Hope you enjoy it!", true);
    };

};

/**
 * Return cell element which contains table data.
 * @param {number} x
 * @param {number} y
 * @param {boolean} [considerHeaders] - With this flag origin will be set to actual table look
 *                                      origin. If false, only table body's first cell will become
 *                                      as origin.
 * @return {HTMLElement}
 */
PivotView.prototype.getCellElement = function (x, y, considerHeaders) {

    var element = this.tablesStack[this.tablesStack.length - 1].element,
        table, hh, hw, table2;

    var getTableCell = function (table, x, y) {
        var m = [], row, cell, xx, tx, ty, xxx, yyy;
        for(yyy = 0; yyy < table.rows.length; yyy++) {
            row = table.rows[yyy];
            for(xxx = 0; xxx < row.cells.length; xxx++) {
                cell = row.cells[xxx];
                xx = xxx;
                for(; m[yyy] && m[yyy][xx]; ++xx) {}
                for(tx = xx; tx < xx + cell.colSpan; ++tx) {
                    for(ty = yyy; ty < yyy + cell.rowSpan; ++ty) {
                        if (!m[ty])
                            m[ty] = [];
                        m[ty][tx] = true;
                    }
                }
                if (xx <= x && x < xx + cell.colSpan && yyy <= y && y < yyy + cell.rowSpan)
                    return cell;
            }
        }
        return null;
    };

    if (considerHeaders) {
        table = element.getElementsByClassName("lpt-topHeader")[0]; if (!table) return null;
        table = table.getElementsByTagName("table")[0]; if (!table) return null;
        hh = 0; [].slice.call(table.rows).forEach(function (e) {
            hh += e.rowSpan || 1;
        });
        table2 = element.getElementsByClassName("lpt-leftHeader")[0]; if (!table) return null;
        table2 = table2.getElementsByTagName("table")[0]; if (!table) return null;
        hw = 0; if (!(this.getCurrentTableData().element || {})["_listing"]) {
            [].slice.call((table2.rows[0] || { cells: [] }).cells).forEach(function (e) {
                hw += e.colSpan || 1;
            });
        }
        if (x < hw && y < hh)
            return element.getElementsByClassName("lpt-headerValue")[0] || null;
        if (x >= hw && y < hh)
            return (getTableCell(table, x - hw, y) || { childNodes: [null] }).childNodes[0];
        if (x < hw && y >= hh)
            return (getTableCell(table2, x, y - hh) || { childNodes: [null] }).childNodes[0];
        x -= hw; y -= hh;
    }

    table = element.getElementsByClassName("lpt-tableBlock")[0]; if (!table) return null;
    table = table.getElementsByTagName("table")[0]; if (!table) return null;
    return ((table.rows[y] || { cells: [] }).cells[x] || { childNodes: [null] }).childNodes[0];

};

/**
 * @see getCellElement
 * @param {boolean} [considerHeaders]
 */
PivotView.prototype.getTableSize = function (considerHeaders) {

    var table, hw = 0, hh = 0, element = this.tablesStack[this.tablesStack.length - 1].element;

    table = element.getElementsByClassName("lpt-tableBlock")[0]; if (!table) return 0;
    table = table.getElementsByTagName("table")[0]; if (!table) return 0;
    [].slice.call(table.rows).forEach(function (e) {
        hh += e.rowSpan || 1;
    });
    [].slice.call((table.rows[0] || { cells: [] }).cells).forEach(function (e) {
        hw += e.colSpan || 1;
    });

    if (!considerHeaders) return { width: hw, height: hh };

    table = element.getElementsByClassName("lpt-topHeader")[0]; if (!table) return 0;
    table = table.getElementsByTagName("table")[0]; if (!table) return 0;
    [].slice.call(table.rows).forEach(function (e) {
        hh += e.rowSpan || 1;
    });
    table = element.getElementsByClassName("lpt-leftHeader")[0]; if (!table) return 0;
    table = table.getElementsByTagName("table")[0]; if (!table) return 0;
    if (!(this.getCurrentTableData().element || {})["_listing"]) {
        [].slice.call((table.rows[0] || { cells: [] }).cells).forEach(function (e) {
            hw += e.colSpan || 1;
        });
    }

    return { width: hw, height: hh };

};

PivotView.prototype.displayLoading = function () {

    this.displayMessage(
        this.controller.CONFIG["loadingMessageHTML"]
        || "<div class=\"lpt-spinner\">" +
        "<div></div><div></div><div></div><div></div><div></div>" +
        "</div>"
    );

};

PivotView.prototype.updateSizes = function () {

    for (var i in this.tablesStack) {
        this.recalculateSizes(this.tablesStack[i].element);
    }

};

PivotView.prototype._updateTablesPosition = function (seek) {

    for (var i = 0; i < this.tablesStack.length; i++) {
        this.tablesStack[i].element.style.left =
            (1 + (seek || 0) + i - this.tablesStack.length)*100 + "%";
    }

};

PivotView.prototype.getCurrentTableData = function () {
    return this.tablesStack[this.tablesStack.length - 1];
};

PivotView.prototype.pushTable = function (opts) {

    var _ = this,
        pg,
        tableElement = document.createElement("div");

    tableElement.className = "tableContainer";
    if (this.tablesStack.length) {
        this.tablesStack[this.tablesStack.length - 1].FIXED_COLUMN_SIZES = this.FIXED_COLUMN_SIZES;
        this.tablesStack[this.tablesStack.length - 1].savedSearch = this.savedSearch;
        this.tablesStack[this.tablesStack.length - 1].selectedRows = this.selectedRows;
        this.savedSearch = { restore: false, value: "", columnIndex: 0 };
        tableElement.style.left = "100%";
    }

    this.tablesStack.push({
        element: tableElement,
        opts: opts || {},
        pagination: pg = { // defaults copied to pushTable
            on: false,
            rows: Infinity, // rows by page including (headers + summary + rows from config)
            page: 0, // current page,
            pages: 0 // available pages
        }
    });

    this.FIXED_COLUMN_SIZES = [];
    this.selectedRows = {};
    this.elements.base.appendChild(tableElement);
    this.elements.tableContainer = tableElement;
    this.pagination = pg;

    setTimeout(function () {
        _._updateTablesPosition();
    }, 30);

};

PivotView.prototype.popTable = function () {

    var currentTable;

    if (this.tablesStack.length < 2) return;

    this.FIXED_COLUMN_SIZES = [];
    this._updateTablesPosition(1);
    var garbage = this.tablesStack.pop();

    this.pagination = (currentTable = this.tablesStack[this.tablesStack.length - 1]).pagination;
    if (currentTable.FIXED_COLUMN_SIZES) this.FIXED_COLUMN_SIZES = currentTable.FIXED_COLUMN_SIZES;
    if (currentTable.savedSearch) this.savedSearch = currentTable.savedSearch;
    if (currentTable.selectedRows) this.selectedRows = currentTable.selectedRows;

    setTimeout(function () {
        garbage.element.parentNode.removeChild(garbage.element);
    }, this.ANIMATION_TIMEOUT);
    this.elements.tableContainer = this.tablesStack[this.tablesStack.length - 1].element;

};

PivotView.prototype.saveScrollPosition = function () {

    var els;

    if (
        this.elements.tableContainer
        && (els = this.elements.tableContainer.getElementsByClassName("lpt-tableBlock"))
    ) {
        this.savedScroll.x = els[0].scrollLeft;
        this.savedScroll.y = els[0].scrollTop;
    }

};

PivotView.prototype.restoreScrollPosition = function () {

    var els;

    if (
        this.elements.tableContainer
        && (els = this.elements.tableContainer.getElementsByClassName("lpt-tableBlock"))
    ) {
        els[0].scrollLeft = this.savedScroll.x;
        els[0].scrollTop = this.savedScroll.y;
    }

};

/**
 * Data change handler.
 *
 * @param data
 */
PivotView.prototype.dataChanged = function (data) {

    var dataRows =
            data.rawData.length - data.info.topHeaderRowsNumber;// - (data.info.SUMMARY_SHOWN ? 1 : 0);

    if (this.controller.CONFIG.pagination) this.pagination.on = true;
    this.pagination.rows = this.controller.CONFIG.pagination || Infinity;
    this.selectedRows = {};
    this.pagination.page = 0;
    this.pagination.pages = Math.ceil(dataRows / this.pagination.rows);
    if (this.pagination.pages < 2) this.pagination.on = false;

    this.renderRawData(data);

};

PivotView.prototype._columnClickHandler = function (columnIndex) {

    this.saveScrollPosition();
    this.controller.dataController.sortByColumn(columnIndex);
    this.restoreScrollPosition();

};

PivotView.prototype._rowClickHandler = function (rowIndex, cellData) {

    var res = true;
    if (typeof this.controller.CONFIG.triggers["rowClick"] === "function") {
        var d = this.controller.getRowsValues([rowIndex])[0].slice(
            this.controller.dataController.getData().info.leftHeaderColumnsNumber
        );
        res = this.controller.CONFIG.triggers["rowClick"](rowIndex, d, cellData);
    }
    if (res !== false)
        this.controller.tryDrillDown(cellData.source.path);

};

PivotView.prototype._pageSwitcherHandler = function (pageIndex) {

    this.pagination.page = pageIndex;
    this.saveScrollPosition();
    this.renderRawData(this.controller.dataController.getData());
    this.restoreScrollPosition();

};

PivotView.prototype._backClickHandler = function (event) {

    if (event) {
        event.cancelBubble = true;
        event.stopPropagation();
    }

    this.removeMessage();
    this.popTable();
    this.controller.popDataSource();

    if (typeof this.controller.CONFIG.triggers["back"] === "function") {
        this.controller.CONFIG.triggers["back"].call(this.controller, {
            level: this.controller.DRILL_LEVEL
        });
    }

};

PivotView.prototype._drillThroughClickHandler = function (event) {

    this.controller.tryDrillThrough();

    if (event) {
        event.cancelBubble = true;
        event.stopPropagation();
    }

};

/**
 * Get selected text if selection was made.
 * @returns {string}
 * @private
 */
PivotView.prototype._getSelectedText = function () {

    var text = "";

    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }

    return text;

};

/**
 * @param {object} cell
 * @param {number} x
 * @param {number} y
 * @param {event} event
 * @param {function} [drillThroughHandler]
 */
PivotView.prototype._cellClickHandler = function (cell, x, y, event, drillThroughHandler) {

    var data = this.controller.dataController.getData(),
        f = [], f1, f2, callbackRes = true, result,
        ATTACH_TOTALS = this.controller.CONFIG["showSummary"]
            && this.controller.CONFIG["attachTotals"] ? 1 : 0;

    if (this._getSelectedText()) return; // exit if text in cell was selected

    if (typeof this.controller.CONFIG.triggers["cellSelected"] === "function") {
        result = this.controller.CONFIG.triggers["cellSelected"].call(this.controller, {
            x: x - data.info.leftHeaderColumnsNumber,
            y: y - data.info.topHeaderRowsNumber,
            leftHeaderColumnsNumber: data.info.leftHeaderColumnsNumber,
            topHeaderRowsNumber: data.info.topHeaderRowsNumber
        });
        if (result === false) return;
    }

    try {
        f1 = data.rawData[y][data.info.leftHeaderColumnsNumber - 1].source.path;
        f2 = data.rawData[data.info.topHeaderRowsNumber - 1 - ATTACH_TOTALS][x].source.path;
    } catch (e) {
        if (this.controller.CONFIG["logs"]) {
            console.warn("Unable to get filters for cell (%d, %d)", x, y);
        }
    }

    if (f1) f.push(f1);
    if (f2) f.push(f2);

    if (this.controller.CONFIG["drillDownTarget"]) {
        window.location = location.origin + location.pathname + "?DASHBOARD="
        + encodeURIComponent(this.controller.CONFIG["drillDownTarget"]) + "&SETTINGS=FILTER:"
        + encodeURIComponent(f.join("~")) + ";";
    } else {
        if (typeof this.controller.CONFIG.triggers["cellDrillThrough"] === "function") {
            callbackRes = this.controller.CONFIG.triggers["cellDrillThrough"]({
                event: event,
                filters: f,
                cellData: cell,
                x: x,
                y: y
            }, data);
        }
        if (typeof drillThroughHandler === "function") {
            callbackRes = !(!(false !== drillThroughHandler({
                event: event,
                filters: f,
                cellData: cell,
                x: x,
                y: y
            }, data)) || !(callbackRes !== false));
        }
        if (callbackRes !== false) this.controller.tryDrillThrough(f);
    }

};

PivotView.prototype.copyToClipboard = function (text) {

    var $temp = document.createElement("input");
    document.body.appendChild($temp);

    $temp.setAttribute("value", text);
    document.body.appendChild($temp);
    $temp.select();

    var result = false;
    try {
        result = document.execCommand("copy");
    } catch (err) {
        console.log("Copy error: " + err);
    }

    document.body.removeChild($temp);
    return result;

};

PivotView.prototype.listingClickHandler = function (params, data) {

    if (data.info.leftHeaderColumnsNumber !== 0) {
        console.warn("Listing handler called not for a listing!");
        return;
    }

    var CLICK_EVENT = this.controller.CONFIG["triggerEvent"] || "click",
        self = this,
        el = function (e) { return document.createElement(e); },
        d1 = el("div"),
        headers = data.rawData[0].map(function (v) {
            return v.value + (v.source && v.source.title ? "(" + v.source.title + ")" : "");
        }),
        values = data.rawData[params.y].map(function (v) { return v.value; });

    d1.className = "lpt-hoverMessage";
    d1.style.fontSize = "12pt";
    d1.style.opacity = 0;

    var h, val, hr, c, sp;
    for (var i = 0; i < headers.length; i++) {
        h = el("div"); sp = el("span"); val = el("div"); hr = el("hr"); c = el("div");
        c.className = "lpt-icon-copy";
        c.title = "Copy";
        c.style.marginRight = "6px";
        sp.className = "lpt-messageHead";
        sp.textContent = headers[i];
        val.className = "lpt-messageBody";
        h.style.marginBottom = ".3em";

        if (values[i] !== "")
            val.textContent = values[i];
        else
            val.innerHTML = "&nbsp;";

        h.appendChild(c);
        h.appendChild(sp);
        d1.appendChild(h);
        d1.appendChild(val);
        d1.appendChild(hr);
        c.addEventListener(CLICK_EVENT, (function (value) { return function (e) {
            if (self.copyToClipboard(value) === false) {
                alert("Your browser does not support dynamic content copying.");
            }
            e.preventDefault();
            e.cancelBubble = true;
            e.preventBubble = true;
        }})(values[i]));
    }

    this.elements.base.appendChild(d1);

    setTimeout(function () {
        if (d1) d1.style.opacity = 1;
    }, 1);
    d1.addEventListener(this.controller.CONFIG["triggerEvent"] || "click", function () {
        if (self._getSelectedText()) return;
        self.removeMessage();
    });

    return false;

};

/**
 * Display hovering message.
 *
 * @param {string} text
 * @param {boolean} [removeByClick] - Define whether user be able to remove message by clicking on
 *                                    it.
 */
PivotView.prototype.displayMessage = function (text, removeByClick) {

    this.removeMessage();

    var _ = this,
        d1 = document.createElement("div"),
        d2 = document.createElement("div"),
        d3 = document.createElement("div");

    d1.className = "central lpt-hoverMessage";
    d1.style.opacity = 0;
    d3.innerHTML = text;
    d2.appendChild(d3);
    d1.appendChild(d2);
    this.elements.base.appendChild(d1);
    setTimeout(function () {
        if (d1) d1.style.opacity = 1;
    }, 1);
    if (removeByClick) {
        d1.addEventListener(this.controller.CONFIG["triggerEvent"] || "click", function () {
            _.removeMessage();
        });
    }

};

PivotView.prototype.removeMessage = function () {

    var els, i;

    if ((els = this.elements.base.getElementsByClassName("lpt-hoverMessage")).length) {
        for (i in els) {
            if (els[i].parentNode) els[i].parentNode.removeChild(els[i]);
        }
    }

};

/**
 * @param {*} value
 * @param {string} operator
 * @param {*} value2 - fixed value
 * @private
 * @return {boolean}
 */
PivotView.prototype._matchCondition = function (value, operator, value2) {

    var value1 = parseFloat(value);
    switch (operator) {
        case "=": return value1 == value2;
        case "<>": return value1 != value2;
        case ">": return value1 > value2;
        case ">=": return value1 >= value2;
        case "<": return value1 < value2;
        case "<=": return value1 <= value2;
        case "IN": return value2.toString().indexOf(value1) !== -1; // how does it normally work?
        case "BETWEEN": return value1 >= value2.split(",")[0] && value1 <= value2.split(",")[1];
        case "IS NULL": return !value1;
        default: {
            console.error("Formatting error: unknown format operator \"" + operator + "\"");
            return false;
        }
    }

};

/**
 * Applies conditional formatting for element.
 *
 * @param {object} rules - Special object that contain formatting rules.
 * @param {string} key - Position y,x separated by comma or empty string for global.
 * @param {*} value - Original value to format (comparator).
 * @param {HTMLElement} element - element to format.
 */
PivotView.prototype.applyConditionalFormatting = function (rules, key, value, element) {

    var actualRules = rules[""] || [],
        p, i, rule, html, xs, num;
    actualRules = actualRules.concat(rules[key] || []);
    if ((xs = key.split(",")).length === 2) {
        actualRules = actualRules.concat(rules[xs[0]] || [], rules[xs[0] + ","] || [],
            rules["," + xs[1]] || []);
    }

    for (p in actualRules) {

        rule = actualRules[p];
        if (!this._matchCondition(value, rule["operator"], rule["value"])) continue;

        // apply formatting
        if (rule["style"])
            element.setAttribute("style", (element.getAttribute("style") || "") + rule["style"]);
        if (rule["icon"]) {
            element.textContent = ""; html = "<div style=\"overflow: hidden; height: 16px;\">";
            num = parseInt(rule["iconCount"]) || 1;
            for (i = 0; i < num; i++) {
                html += "<img alt=\"*\" style=\"padding-right:2px; height: 100%;\" " +
                "src=\"" + rule["icon"] + "\"/>";
            }
            // LPT won't change default format (f.e. text-align) for content.
            // element.className = (element.className || "") + " formatLeft";
            element.innerHTML = html + "</div>";
        }
        if (rule["text"]) element.textContent = rule["text"];

    }

};

/**
 * DeepSee-defined colors.
 *
 * @param {string} name - name of color. F.e. "red".
 * @returns {{ r: number, g: number, b: number }}
 */
PivotView.prototype.colorNameToRGB = function (name) {
    var c = function (r, g, b) { return { r: r, g: g, b: b } };
    switch (name) {
        case "red": return c(255, 0, 0);
        case "green": return c(0, 255, 0);
        case "blue": return c(0, 0, 255);
        case "purple": return c(102, 0, 153);
        case "salmon": return c(255, 140, 105);
        case "white": return c(255, 255, 255);
        case "black": return c(0, 0, 0);
        case "gray": return c(128, 128, 128);
        default: return c(255, 255, 255);
    }
};

/**
 * @param {boolean} select - select or not.
 * @param {number} rowNumber - row number start from 0.
 */
PivotView.prototype.selectRow = function (select, rowNumber) {

    if (select)
        this.selectedRows[rowNumber] = 1;
    else
        delete this.selectedRows[rowNumber];

    if (typeof this.controller.CONFIG.triggers["rowSelect"] === "function") {
        var rows = this.controller.getSelectedRows();
        this.controller.CONFIG.triggers["rowSelect"](
            rows,
            this.controller.getRowsValues(rows)
        );
    }

};

/**
 * Size updater for LPT.
 * Do not affect scroll positions in this function.
 *
 * @param container
 */
PivotView.prototype.recalculateSizes = function (container) {

    var containerParent = container.parentNode,
        DEFAULT_CELL_HEIGHT = 22;

    try {

        var _ = this,
            CLICK_EVENT = this.controller.CONFIG["triggerEvent"] || "click",
            header = container.getElementsByClassName("lpt-headerValue")[0];

        if (!header) { return; } // pivot not ready - nothing to fix

        var headerContainer = container.getElementsByClassName("lpt-header")[0],
            topHeader = container.getElementsByClassName("lpt-topHeader")[0],
            topHeaderTable = container.getElementsByTagName("table")[0],
            topHeaderTableWidth = topHeaderTable.offsetWidth,
            tTableHead = topHeader.getElementsByTagName("thead")[0],
            leftHeader = container.getElementsByClassName("lpt-leftHeader")[0],
            lTableHead = leftHeader.getElementsByTagName("thead")[0],
            tableBlock = container.getElementsByClassName("lpt-tableBlock")[0],
            mainContentTable = tableBlock.getElementsByTagName("table")[0],
            pTableHead = tableBlock.getElementsByTagName("tbody")[0],
            searchInput = container.getElementsByClassName("lpt-searchInput")[0],
            searchInputSize = searchInput ? container.offsetWidth - this.SEARCHBOX_LEFT_MARGIN : 0,
            tableTr = tableBlock.getElementsByTagName("tr")[0],
            pageSwitcher = container.getElementsByClassName("lpt-pageSwitcher")[0];

        if (tTableHead.childNodes[0] && tTableHead.childNodes[0].lastChild["_extraCell"]) {
            tTableHead.childNodes[0].removeChild(tTableHead.childNodes[0].lastChild);
        }
        if (lTableHead.lastChild && lTableHead.lastChild["_extraTr"]) {
            lTableHead.removeChild(lTableHead.lastChild);
        }

        var pagedHeight = (pageSwitcher ? this.PAGINATION_BLOCK_HEIGHT : 0)
                + (this.SEARCH_ENABLED ? this.PAGINATION_BLOCK_HEIGHT : 0),
            headerW = Math.max(leftHeader.offsetWidth, headerContainer.offsetWidth),
            headerH = topHeader.offsetHeight;

        topHeader.style.marginLeft = headerW + "px";

        var containerHeight = container.offsetHeight,
            bodyHeight = containerHeight - headerH - pagedHeight,
            mainHeaderWidth = headerContainer.offsetWidth,
            IS_LISTING = lTableHead.offsetHeight === 0,
            hasVerticalScrollBar =
                Math.max(lTableHead.offsetHeight, pTableHead.offsetHeight) > bodyHeight
                && this.SCROLLBAR_WIDTH > 0,
            hasHorizontalScrollBar =
                tTableHead.offsetWidth >
                    topHeader.offsetWidth - (hasVerticalScrollBar ? this.SCROLLBAR_WIDTH : 0);

        // horizontal scroll bar may change vertical scroll bar, so we need recalculate
        if (!hasVerticalScrollBar && hasHorizontalScrollBar) {
            hasVerticalScrollBar =
                Math.max(lTableHead.offsetHeight, pTableHead.offsetHeight) > bodyHeight - this.SCROLLBAR_WIDTH
                && this.SCROLLBAR_WIDTH > 0;
        }

        var addEggs = hasVerticalScrollBar && !IS_LISTING,
            cell, tr, cellWidths = [], rowHeadersHeights = [], rowDataHeights = [], i,
            headerCellApplied = false;

        var applyExtraTopHeadCell = function () {
            if (!_.controller.CONFIG.stretchColumns &&
                hasVerticalScrollBar && !hasHorizontalScrollBar) return;
            headerCellApplied = true;
            tr = document.createElement("th");
            tr.className = "lpt-extraCell";
            tr.style.minWidth = _.SCROLLBAR_WIDTH + "px";
            tr.style.width = _.SCROLLBAR_WIDTH + "px";
            tr.rowSpan = tTableHead.childNodes.length;
            tr["_extraCell"] = true;
            tTableHead.childNodes[0].appendChild(tr);
        };

        //return;
        //console.log(lTableHead.offsetHeight, pTableHead.offsetHeight, bodyHeight, this.SCROLLBAR_WIDTH);
        if (hasVerticalScrollBar && tTableHead.childNodes[0]) {
            applyExtraTopHeadCell();
        }

        if (container["_primaryColumns"]) {
            for (i in container["_primaryColumns"]) {
                cellWidths.push(container["_primaryColumns"][i].offsetWidth);
            }
        } else {
            console.warn("No _primaryColumns property in container, cell sizes won't be fixed.");
        }
        if (container["_primaryRows"] && container["_primaryCells"]) {
            for (i in container["_primaryRows"]) {
                rowHeadersHeights.push(container["_primaryRows"][i].offsetHeight);
            }
            for (i in container["_primaryCells"]) {
                rowDataHeights.push(container["_primaryCells"][i].offsetHeight);
            }
        } else {
            console.warn("No _primaryRows property in container, cell sizes won't be fixed.");
        }

        /**
         * #keepSizes
         * This fixes FF/IE strange issue that assigns, for example, "12.05" instead of "12" to
         * the cell height and, as a result, row headers and rows are inconsistent.
         * @type {Array}
         */
        var keepSizes = [].slice.call(leftHeader.getElementsByTagName("th")).map(function (e) {
            return {
                el: e.getElementsByTagName("div")[0],
                height: e.getElementsByTagName("div")[0].offsetHeight
            };
        });

        container.parentNode.removeChild(container); // detach

        topHeader.style.marginLeft = headerW + "px";
        tableBlock.style.marginLeft = headerW + "px";
        leftHeader.style.height = containerHeight - headerH - pagedHeight + "px";
        leftHeader.style.width = headerW + "px";
        if (mainHeaderWidth > headerW) leftHeader.style.width = mainHeaderWidth + "px";
        tableBlock.style.height = containerHeight - headerH - pagedHeight - 1 + "px";
        headerContainer.style.height = headerH + "px";
        headerContainer.style.width = headerW + "px";
        if (!this.controller.CONFIG.stretchColumns) {
            topHeaderTable.style.width = "auto";
            mainContentTable.style.width =
                hasHorizontalScrollBar ? "100%" : topHeaderTableWidth + "px";
        }

        // @TEST beta.13
        //for (i in container["_primaryRows"]) {
        //    container["_primaryRows"][i].style.height = columnHeights[i] + "px";
        //}
        //for (i in container["_primaryColumns"]) {
        //    container["_primaryColumns"][i].style.width = cellWidths[i] + "px";
        //}

        //console.log(cellWidths);
        //containerParent.appendChild(container); // attach
        //return;

        if (addEggs) { // horScroll?
            tr = document.createElement("tr");
            tr.appendChild(cell = document.createElement("th"));
            lTableHead.appendChild(tr);
            cell["__i"] = 0;
            cell.addEventListener(CLICK_EVENT, function() {
                cell["__i"]++;
                cell.style.background = "#"+(Math.max(18-cell["__i"]*3,0)).toString(16)+"FF7D7";
                if (cell["__i"] > 5) _["_"]();
            });
            tr["_extraTr"] = true;
            cell.colSpan = lTableHead.childNodes.length;
            cell.style.height = (this.SCROLLBAR_WIDTH ? this.SCROLLBAR_WIDTH + 1 : 0) + "px";
        }

        if (searchInput) {
            searchInput.style.width = searchInputSize + "px";
        }

        //if (hasVerticalScrollBar) {
        //    leftHeader.className = leftHeader.className.replace(/\sbordered/, "") + " bordered";
        //}

        if (tableTr) for (i in tableTr.childNodes) {
            if (tableTr.childNodes[i].tagName !== "TD") continue;
            tableTr.childNodes[i].style.width = cellWidths[i] + "px";
        }
        //for (i in pTableHead.childNodes) {
        //    if (pTableHead.childNodes[i].tagName !== "TR") continue;
        //    if (pTableHead.childNodes[i].firstChild) {
        //        pTableHead.childNodes[i].firstChild.style.height =
        //            Math.max(
        //                (rowHeadersHeights[i] || rowHeadersHeights[i - 1] || DEFAULT_CELL_HEIGHT),
        //                (rowDataHeights[i] || rowDataHeights[i - 1] || DEFAULT_CELL_HEIGHT)
        //            ) + "px";
        //
        //    }
        //}
        container["_primaryRows"].forEach(function (val, i) {
            container["_primaryCells"][i].style.height =
                container["_primaryRows"][i].style.height = Math.max(
                        rowHeadersHeights[i] || rowHeadersHeights[i - 1] || DEFAULT_CELL_HEIGHT,
                        rowDataHeights[i] || rowDataHeights[i - 1] || DEFAULT_CELL_HEIGHT
                    ) + "px";
        });

        // #keepSizes
        keepSizes.forEach(function (o) {
            o.el.style.height = parseInt(o.height) + "px";
        });

        containerParent.appendChild(container); // attach

        /*
        * View in (listing) may have another size after attaching just because of applying
        * DEFAULT_CELL_HEIGHT to all of the rows. So if it is listing, we will check if
        * extra cell was actually added and if we need to add it now.
        **/
        if (/*IS_LISTING &&*/ Math.max(lTableHead.offsetHeight, pTableHead.offsetHeight) > bodyHeight
                && this.SCROLLBAR_WIDTH > 0 && !headerCellApplied) {
            applyExtraTopHeadCell();
        }

        // TEMPFIX: column sizes
        //var gg = 0;
        //if (tableTr && container["_primaryColumns"])
        //    for (i in tableTr.childNodes) {
        //        if (tableTr.childNodes[i].tagName !== "TD") continue;
        //        container["_primaryColumns"][gg++].style.width = tableTr.childNodes[i].offsetWidth + "px";
        //    }

    } catch (e) {
        console.error("Error when fixing sizes.", "ERROR:", e);
    }

};

/**
 * Converts retrieved from mdx2json date to JS date format.
 * @param {string} s Date as string
 * @returns {number} Date as number
 * @author Anton Gnibeda (https://github.com/gnibeda)
 */
PivotView.prototype.getUnixDateFromCacheFormat = function (s) {
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    }
    function getDate(str) {
        var months = [
            "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"
        ];

        var d = Date.parse(str);
        if (!isNaN(d)) return d;
        if (str.split("-").length == 2) {
            var parts = str.split("-");
            var idx = months.indexOf(parts[0].toLowerCase());
            if (idx != -1) {
                return Date.parse((idx+1).toString() + "/01/" + parts[1]);
            }
        } else
        if (str.split(" ").length == 2) {
            //like 2015-01-07 05
            var timeParts = str.split(" ")[1].split(":").length;
            if (timeParts === 0) str += ":00";
            d = Date.parse(str.replace(/-/g, "/"));
            if (!isNaN(d)) return d;
        }
        return 0;
    }
    if (s === "" && s === undefined || s === null) return null;
    var str = s.toString();
    if (str.length == 4) return getDate(s);
    if (str.indexOf("-") != -1) return getDate(s);
    if (str.indexOf(" ") != -1) return getDate(s);
    if (str.length == 6) {
        var y = str.substr(0, 4);
        var m = str.substr(4, 2);
        return Date.parse(new Date(parseInt(y), parseInt(m)-1, 1));
    }
    if (str.length == 5 && !isNaN(parseInt(str))) {
        var base = new Date(1840, 11, 31);
        var p = str.toString().split(",");
        var d = parseInt(p[0]);
        var t = null;
        if (p.length > 1) t = parseInt(p[1]);
        base = addDays(base, parseInt(d));
        if (t) base.setSeconds(t);
        return Date.parse(base);
    } else return getDate(s);
};

/**
 * Raw data - plain 2-dimensional array of data to render.
 *
 * group - makes able to group cells together. Cells with same group number will be gathered.
 * source - data source object with it's properties.
 * value - value of cell (will be stringified).
 *
 * @param {{ group: number, source: Object, value: *, isCaption: boolean }[][]} data
 */
PivotView.prototype.renderRawData = function (data) {

    if (!data["rawData"] || !data["rawData"][0] || !data["rawData"][0][0]) {
        this.displayMessage("<h1>" + pivotLocale.get(1) + "</h1><p>" + JSON.stringify(data) + "</p>");
        return;
    }

    var _ = this,
        rawData = data["rawData"],
        info = data["info"],
        columnProps = data["columnProps"],
        rowProps = data["rowProps"],
        colorScale =
            data["conditionalFormatting"] ? data["conditionalFormatting"]["colorScale"] : undefined,

        CLICK_EVENT = this.controller.CONFIG["triggerEvent"] || "click",
        ATTACH_TOTALS = info.SUMMARY_SHOWN && this.controller.CONFIG["attachTotals"] ? 1 : 0,
        COLUMN_RESIZE_ON = !!this.controller.CONFIG.columnResizing,
        LISTING = info.leftHeaderColumnsNumber === 0,
        SEARCH_ENABLED = LISTING && this.controller.CONFIG["enableSearch"],
        LISTING_SELECT_ENABLED = this.controller.CONFIG["enableListingSelect"],
        RESIZE_ANIMATION = !!this.controller.CONFIG["columnResizeAnimation"],

        container = this.elements.tableContainer,
        pivotTopSection = document.createElement("div"),
        pivotBottomSection = document.createElement("div"),
        pivotHeader = document.createElement("div"),
        topHeader = document.createElement("div"),
        header = document.createElement("div"),
        leftHeader = document.createElement("div"),
        tableBlock = document.createElement("div"),
        THTable = document.createElement("table"),
        THTHead = document.createElement("thead"),
        LHTable = document.createElement("table"),
        LHTHead = document.createElement("thead"),
        mainTable = document.createElement("table"),
        mainTBody = document.createElement("tbody"),

        showBottomBar = this.pagination.on
            || (LISTING && this.controller.CONFIG["showListingRowsNumber"]),
        pageSwitcher = showBottomBar ? document.createElement("div") : null,
        pageNumbers = showBottomBar ? [] : null,
        pageSwitcherContainer = pageSwitcher ? document.createElement("div") : null,

        searchBlock = SEARCH_ENABLED ? document.createElement("div") : null,
        searchIcon = SEARCH_ENABLED ? document.createElement("span") : null,
        searchSelect = SEARCH_ENABLED ? document.createElement("select") : null,
        searchSelectOuter = SEARCH_ENABLED ? document.createElement("span") : null,
        searchInput = SEARCH_ENABLED ? document.createElement("input") : null,
        searchFields = SEARCH_ENABLED ? (function () {
            var arr = [],
                x = info.leftHeaderColumnsNumber,
                y = info.topHeaderRowsNumber - 1 - ATTACH_TOTALS;
            for (var i = x; i < rawData[y].length; i++) {
                arr.push({
                    value: rawData[y][i].value,
                    source: rawData[y][i].source,
                    columnIndex: i
                });
            }
            return arr;
        })() : null,

        renderedGroups = {}, // keys of rendered groups; key = group, value = { x, y, element }
        i, x, y, tr = null, th, td, primaryColumns = [], primaryRows = [], primaryCells = [],
        ratio, cellStyle, tempI, tempJ, div;

    this.SEARCH_ENABLED = SEARCH_ENABLED;

    this.numeral.setup(
        info["decimalSeparator"] || ".",
        info["numericGroupSeparator"] || ",",
        info["numericGroupSize"] || 3
    );

    var formatContent = function (value, element, format) {
        if (typeof(value) === 'string') {
            if (!(value[value.length - 1] === "%" && !isNaN(parseFloat(value)))) // string as %
                element.parentNode.className += " formatLeft";
            element.innerHTML = (value || "").replace(/(https?|ftp):\/\/[^\s]+/ig, function linkReplace (p) {
                return "<a href='" + p
                    + "' target='" + (_.controller.CONFIG["linksTarget"] || "_blank")
                    + "' onclick='var e=event||window.event;e.stopPropagation();e.cancelBubble=true;'>"
                    + p + "</a>";
            });
        } else if (!LISTING) { // number
            if (format === "%date%") { // Caché internal date
                var d = new Date(_.getUnixDateFromCacheFormat(value));
                if (isNaN(d.getTime())) { element.textContent = value; return; }
                element.textContent = d.getHours() + d.getMinutes() + d.getSeconds() === 0
                        ? d.toLocaleDateString() : d.toLocaleString();
            } else if (format) { // set format
                element.textContent = value ? _.numeral(value).format(format) : value;
            } else if (value) {
                element.textContent = _.numeral(value).format(
                    value % 1 === 0 ? "#,###" : "#,###.##"
                );
            } else {
                element.textContent = value;
            }
        } else {
            element.textContent = value;
        }
    };

    var setCaretPosition = function (elem, caretPos) {
        var range;
        if (elem.createTextRange) {
            range = elem.createTextRange();
            range.move("character", caretPos);
            range.select();
        } else {
            elem.setSelectionRange(caretPos, caretPos);
        }
    };

    var bindResize = function (element, column) {

        var baseWidth = 0,
            baseX = 0;

        var moveListener = function (e) {
            e.cancelBubble = true;
            e.preventDefault();
            element.style.width = element.style.minWidth =
                baseWidth - baseX + e.pageX + "px";
            if (RESIZE_ANIMATION) {
                _.saveScrollPosition();
                _.recalculateSizes(container);
                _.restoreScrollPosition();
            }
        };

        var upListener = function (e) {
            e.cancelBubble = true;
            e.preventDefault();
            element.style.width = element.style.minWidth =
                (_.FIXED_COLUMN_SIZES[column] = baseWidth - baseX + e.pageX) + "px";
            _.saveScrollPosition();
            _.recalculateSizes(container);
            _.restoreScrollPosition();
            document.removeEventListener("mousemove", moveListener);
            document.removeEventListener("mouseup", upListener);
        };

        element.addEventListener("mousedown", function (e) {
            if ((e.target || e.srcElement) !== element) return;
            e.cancelBubble = true;
            e.preventDefault();
            baseWidth = element.offsetWidth;
            baseX = e.pageX;
            document.addEventListener("mousemove", moveListener);
            document.addEventListener("mouseup", upListener);
        });

    };

    // clean previous content
    this.removeMessage();
    while (container.firstChild) { container.removeChild(container.firstChild); }

    var renderHeader = function (xFrom, xTo, yFrom, yTo, targetElement) {

        var vertical = targetElement === LHTHead,
            rendered, separatelyGrouped, tr, th, div, checkbox;

        function applySelect (element) { // checkbox element
            var checked = element.checked;
            while (element = element.parentNode) {
                if (element.tagName === "TR") {
                    element.classList[checked ? "add" : "remove"]("lpt-selectedRow");
                    _.elements.tableContainer.querySelector(".lpt-tableBlock table")
                        .rows[element.rowIndex]
                        .classList[checked ? "add" : "remove"]("lpt-selectedRow");
                    break;
                }
            }
        }

        if (xFrom === xTo && LISTING_SELECT_ENABLED) { // listing
            for (y = yFrom; y < yTo; y++) {
                tr = document.createElement("tr");
                th = document.createElement("td");
                checkbox = document.createElement("input");
                checkbox.setAttribute("type", "checkbox");
                checkbox.checked = !!_.selectedRows[y];
                if (checkbox.checked) (function (checkbox) {
                    setTimeout(function () { // highlight the rows after html generated
                        applySelect(checkbox);
                    }, 1);
                })(checkbox);
                th.setAttribute("style", "padding: 0 !important;");
                checkbox.addEventListener("click", (function (y) { return function (e) {
                    var element = e.srcElement || e.target;
                    e.preventDefault();
                    e.cancelBubble = true;
                    setTimeout(function () { // bad, but the only working workaround for ISC DeepSee
                        element.checked = !element.checked;
                        _.selectRow.call(_, element.checked, y);
                        applySelect(element);
                    }, 1);
                }})(y));
                th.appendChild(checkbox);
                tr.appendChild(th);
                primaryRows.push(th);
                targetElement.appendChild(tr);
            }
            return;
        }

        for (y = yFrom; y < yTo; y++) {
            for (x = xFrom; x < xTo; x++) {

                separatelyGrouped = true;

                // setup th
                if (rendered = renderedGroups.hasOwnProperty(rawData[y][x].group)) {
                    if (x > 0 && rawData[y][x - 1].group === rawData[y][x].group) {
                        separatelyGrouped = false;
                        renderedGroups[rawData[y][x].group].element.colSpan =
                            x - renderedGroups[rawData[y][x].group].x + 1;
                    }
                    if (y > 0 && rawData[y - 1][x].group === rawData[y][x].group) {
                        separatelyGrouped = false;
                        renderedGroups[rawData[y][x].group].element.rowSpan =
                            y - renderedGroups[rawData[y][x].group].y + 1;
                    }
                    th = renderedGroups[rawData[y][x].group].element;
                }

                if (!rendered || separatelyGrouped) { // create element
                    if (!tr) tr = document.createElement("tr");
                    tr.appendChild(
                        th = document.createElement(rawData[y][x].isCaption ? "th" : "td")
                    );
                    if (rawData[y][x].source && rawData[y][x].source.title) {
                        th.setAttribute("title", rawData[y][x].source.title);
                    }
                    div = document.createElement("div");
                    if (rawData[y][x].value) {
                        div.textContent = rawData[y][x].value;
                    } else div.innerHTML = "&nbsp;";
                    th.appendChild(div);
                    if (rawData[y][x].style) th.setAttribute("style", rawData[y][x].style);
                    if (info.leftHeaderColumnsNumber === 0
                        && _.controller.CONFIG["listingColumnMinWidth"]) { // if listing
                        th.style.minWidth = _.controller.CONFIG["listingColumnMinWidth"] + "px";
                    }
                    if (info.leftHeaderColumnsNumber > 0
                        && _.controller.CONFIG["maxHeaderWidth"]) {
                        th.style.maxWidth = _.controller.CONFIG["maxHeaderWidth"] + "px";
                        th.style.whiteSpace = "normal";
                        th.style.wordWrap = "normal";
                    }
                    if (rawData[y][x].className) th.className = rawData[y][x].className;
                    if (rawData[y][x].group) renderedGroups[rawData[y][x].group] = {
                        x: x,
                        y: y,
                        element: th
                    };
                    if (!rawData[y][x].isCaption) formatContent(
                        rawData[y][x].value,
                        th,
                        rowProps[y].format || columnProps[x].format
                    );
                }

                // add listeners
                if (vertical && x === xTo - 1) {
                    primaryRows.push(th);
                    th.addEventListener(CLICK_EVENT, (function (index, data) {
                        return function () {
                            _._rowClickHandler.call(_, index, data);
                        };
                    })(y, rawData[y][x]));
                }
                if (!vertical && y === yTo - 1 - ATTACH_TOTALS && !th["_hasSortingListener"]) {
                    th["_hasSortingListener"] = false; // why false?
                    //console.log("Click bind to", th);
                    if (!rawData[y][x].noClick) th.addEventListener(CLICK_EVENT, (function (i) {
                        return function () {
                            //if (th._CANCEL_CLICK_EVENT) return;
                            _._columnClickHandler.call(_, i);
                        };
                    })(x - info.leftHeaderColumnsNumber));
                    th.className = (th.className || "") + " lpt-clickable";
                }
                if (!vertical && y === yTo - 1) {
                    if (_.FIXED_COLUMN_SIZES[x]) {
                        th.style.minWidth = th.style.width = _.FIXED_COLUMN_SIZES[x] + "px";
                    }
                    if (COLUMN_RESIZE_ON) {
                        bindResize(th, x);
                        th.className += " lpt-resizableColumn";
                    }
                    primaryColumns.push(th);
                }

            }
            if (tr) targetElement.appendChild(tr);
            tr = null;
        }
    };

    // top left header setup
    // Request by Shvarov, make top left cell empty (DSW repo #391)
    header.textContent = '';
    if (rawData[0][0].style && !LISTING) header.setAttribute("style", rawData[0][0].style);
    if (this.tablesStack.length > 1 && !this.controller.CONFIG["hideButtons"]) {
        header.className += "back ";
        header.addEventListener(CLICK_EVENT, function (e) {
            _._backClickHandler.call(_, e);
        });
    }
    if (info.leftHeaderColumnsNumber > 0 && _.controller.CONFIG["maxHeaderWidth"]) {
        pivotHeader.style.maxWidth =
            _.controller.CONFIG["maxHeaderWidth"] * info.leftHeaderColumnsNumber + "px";
        pivotHeader.style.whiteSpace = "normal";
        pivotHeader.style.wordWrap = "normal";
    }
    if ( // hide unnecessary column
        (this.controller.CONFIG["hideButtons"] || this.tablesStack.length < 2)
        && info.leftHeaderColumnsNumber === 0
    ) {
        header.style.display = "none";
    }

    // render topHeader
    renderHeader(
        info.leftHeaderColumnsNumber,
        rawData[0].length,
        0,
        info.topHeaderRowsNumber,
        THTHead
    );

    // render leftHeader
    renderHeader(
        0,
        info.leftHeaderColumnsNumber,
        tempI = info.topHeaderRowsNumber + (this.pagination.page*this.pagination.rows || 0),
        tempJ = this.pagination.on
            ? Math.min(tempI + this.pagination.rows, rawData.length)
            : rawData.length,
        LHTHead
    );

    // render table
    for (y = tempI; y < tempJ; y++) {
        tr = document.createElement("tr");
        for (x = info.leftHeaderColumnsNumber; x < rawData[0].length; x++) {

            cellStyle = this.controller.getPivotProperty(["cellStyle"]) || "";
            tr.appendChild(td = document.createElement("td"));
            td.appendChild(div = document.createElement("div"));
            if (x === info.leftHeaderColumnsNumber) primaryCells.push(td);
            formatContent(
                rawData[y][x].value,
                div,
                (rowProps[y] && rowProps[y].format) || columnProps[x].format
            );
            if (
                colorScale
                && !(info.SUMMARY_SHOWN && rawData.length - 1 === y) // exclude totals formatting
            ) {
                ratio = (parseFloat(rawData[y][x].value) - colorScale.min) / colorScale.diff;
                cellStyle += "background:rgb(" +
                + Math.round((colorScale.to.r - colorScale.from.r)*ratio + colorScale.from.r)
                + "," + Math.round((colorScale.to.g - colorScale.from.g)*ratio + colorScale.from.g)
                + "," + Math.round((colorScale.to.b - colorScale.from.b)*ratio + colorScale.from.b)
                + ");" + (colorScale.invert ? "color: white;" : "");
            }
            if (columnProps[x].style || (rowProps[y] && rowProps[y].style)) {
                cellStyle += ((rowProps[y] && rowProps[y].style) || "") +
                    ((rowProps[y] && rowProps[y].style) ? " " : "") + (columnProps[x].style || "");
            }
            if (rawData[y][x].style) {
                cellStyle += rawData[y][x].style;
            }
            if (
                this.controller.CONFIG.conditionalFormattingOn // totals formatting present
                && !(info.SUMMARY_SHOWN && rawData.length - 1 === y) // exclude totals formatting
                && !this.getCurrentTableData().opts.disableConditionalFormatting
            ) {
                this.applyConditionalFormatting(
                    data["conditionalFormatting"],
                    (y - info.topHeaderRowsNumber + 1) + "," + (x - info.leftHeaderColumnsNumber + 1),
                    rawData[y][x].value,
                    td
                );
            }

            // apply style
            if (cellStyle) td.setAttribute("style", (td.getAttribute("style") || "") + cellStyle);
            // add handlers
            td.addEventListener(CLICK_EVENT, (function (x, y, cell) {
                return function (event) {
                    _._cellClickHandler.call(_, cell, x, y, event, info.drillThroughHandler);
                };
            })(x, y, rawData[y][x]));

        }
        mainTBody.appendChild(tr);
    }

    tableBlock.addEventListener("scroll", function () {
        if (tableBlock._ISE) { tableBlock._ISE = false; return; }
        topHeader.scrollLeft = tableBlock.scrollLeft;
        leftHeader.scrollTop = tableBlock.scrollTop;
        topHeader._ISE = true; leftHeader._ISE = true; // ignore scroll event
    });

    leftHeader.className = "lpt-leftHeader";
    topHeader.className = "lpt-topHeader";
    if (this.controller.CONFIG["enableHeadersScrolling"]) {
        leftHeader.className = leftHeader.className + " lpt-scrollable-y";
        topHeader.className = topHeader.className + " lpt-scrollable-x";
        leftHeader.addEventListener("scroll", function () {
            if (leftHeader._ISE) { leftHeader._ISE = false; return; }
            tableBlock.scrollTop = leftHeader.scrollTop;
            tableBlock._ISE = true;
        });
        topHeader.addEventListener("scroll", function () {
            if (topHeader._ISE) { topHeader._ISE = false; return; }
            tableBlock.scrollLeft = topHeader.scrollLeft;
            tableBlock._ISE = true;
        });
    }
    tableBlock.className = "lpt-tableBlock";
    pivotHeader.className = "lpt-header";
    pivotTopSection.className = "lpt-topSection";
    pivotBottomSection.className = "lpt-bottomSection";
    header.className += "lpt-headerValue";
    mainTable.appendChild(mainTBody);
    tableBlock.appendChild(mainTable);
    LHTable.appendChild(LHTHead);
    leftHeader.appendChild(LHTable);
    THTable.appendChild(THTHead);
    topHeader.appendChild(THTable);
    pivotHeader.appendChild(header);
    pivotTopSection.appendChild(pivotHeader);
    pivotTopSection.appendChild(topHeader);
    pivotBottomSection.appendChild(leftHeader);
    pivotBottomSection.appendChild(tableBlock);
    container.appendChild(pivotTopSection);
    container.appendChild(pivotBottomSection);
    if (!this.controller.CONFIG.stretchColumns) {
        THTable.style.width = "auto"; // required for correct 1st resizing
    }

    if (pageSwitcher) {
        pageSwitcher.className = "lpt-pageSwitcher";
        pageNumbers = (function getPageNumbersArray (currentPage, pages) { // minPage = 1

            var step = 0,
                pagesArr = [currentPage];
            while (currentPage > 1) {
                currentPage = Math.max(1, currentPage - (step || 1));
                pagesArr.unshift(currentPage);
                step = step*step + 1;
            }
            step = 0;
            currentPage = pagesArr[pagesArr.length - 1];
            while (currentPage < pages) {
                currentPage = Math.min(pages, currentPage + (step || 1));
                pagesArr.push(currentPage);
                step = step*step + 1;
            }
            return pagesArr;

        })(this.pagination.page + 1, this.pagination.pages);
        if (this.controller.CONFIG.showListingRowsNumber) {
            td = document.createElement("div");
            tr = document.createElement("span");
            tr.className = "lpt-icon-rows";
            td.className = "lpt-bottomInfo";
            td.appendChild(tr);
            tr = document.createElement("span");
            tr.textContent = data["rawData"].length - (data["info"].topHeaderRowsNumber || 0)
                - (data["info"].SUMMARY_SHOWN ? 1 : 0);
            td.appendChild(tr);
            pageSwitcherContainer.appendChild(td);
        }
        for (i in pageNumbers) {
            i = parseInt(i);
            td = document.createElement("span");
            if (pageNumbers[i] === this.pagination.page + 1) { td.className = "lpt-active"; }
            td.textContent = pageNumbers[i];
            (function (page) {td.addEventListener(CLICK_EVENT, function () { // add handler
                _._pageSwitcherHandler.call(_, page - 1);
            })})(pageNumbers[i]);
            pageSwitcherContainer.appendChild(td);
            if (pageNumbers[i + 1] && pageNumbers[i] + 1 !== pageNumbers[i + 1]) {
                td = document.createElement("span");
                td.className = "lpt-pageSpacer";
                pageSwitcherContainer.appendChild(td);
            }
        }
        pageSwitcher.appendChild(pageSwitcherContainer);
        container.appendChild(pageSwitcher);
    }

    if (SEARCH_ENABLED) {
        searchIcon.className = "lpt-searchIcon";
        searchSelectOuter.className = "lpt-searchSelectOuter";
        searchBlock.className = "lpt-searchBlock";
        searchInput.className = "lpt-searchInput";
        searchSelect.className = "lpt-searchSelect";
        //if (pageSwitcher) {
        //    pageSwitcher.style.borderBottom = "none";
        //    pageSwitcher.style.bottom = "20px";
        //}
        for (i in searchFields) {
            td = document.createElement("option");
            td.setAttribute("value", searchFields[i].columnIndex.toString());
            td.textContent = searchFields[i].value;
            searchSelect.appendChild(td);
        }
        searchInput.addEventListener("input", function () {
            var colIndex = parseInt(searchSelect.options[searchSelect.selectedIndex].value),
                value = searchInput.value;
            _.saveScrollPosition();
            _.savedSearch.value = value;
            _.savedSearch.columnIndex = colIndex;
            _.savedSearch.restore = true;
            _.controller.dataController.filterByValue(value, colIndex);
            _.restoreScrollPosition();
        });
        searchBlock.appendChild(searchIcon);
        searchSelectOuter.appendChild(searchSelect);
        searchBlock.appendChild(searchSelectOuter);
        searchBlock.appendChild(searchInput);
        container.insertBefore(searchBlock, pivotTopSection);
        this.elements.searchInput = searchInput;
        this.elements.searchSelect = searchSelect;
        if (this.savedSearch.restore) {
            this.elements.searchInput.value = this.savedSearch.value;
            this.elements.searchSelect.value = this.savedSearch.columnIndex;
        }
    } else {
        this.elements.searchInput = undefined;
        this.elements.searchSelect = undefined;
    }

    container["_primaryColumns"] = primaryColumns;
    container["_primaryRows"] = primaryRows;
    container["_primaryCells"] = primaryCells;
    container["_listing"] = LISTING;

    this.recalculateSizes(container);

    if (this.savedSearch.restore) {
        this.elements.searchInput.focus();
        setCaretPosition(this.elements.searchInput, this.savedSearch.value.length);
    }

    if (typeof this.controller.CONFIG.triggers.contentRendered === "function") {
        this.controller.CONFIG.triggers.contentRendered(this.controller);
    }

};
 return LightPivotTable;}());
