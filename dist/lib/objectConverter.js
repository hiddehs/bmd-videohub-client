"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertObjectToLockStates = exports.convertObjectToRoutes = exports.convertObjectToLabels = exports.convertToObject = void 0;
var command_1 = require("./models/command");
var label_1 = require("./models/label");
var lockState_1 = require("./models/lockState");
var route_1 = require("./models/route");
function convertToObject(data) {
    var obj = {};
    switch (data.split("\n", 1)[0].trim()) {
        case "PROTOCOL PREAMBLE:":
            obj.command = "protocol";
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var rowPropertyValue = dataList[i].split(":");
                if (rowPropertyValue.length > 1) {
                    obj[rowPropertyValue[0]] = convertStringToObject(rowPropertyValue[1].trim());
                }
            }
            break;
        case "VIDEOHUB DEVICE:":
            obj.command = "information";
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var rowPropertyValue = dataList[i].split(":");
                obj[rowPropertyValue[0].trim()] = convertStringToObject(rowPropertyValue[1].trim());
            }
            break;
        case command_1.Command.INPUT_LABELS:
            obj.command = command_1.Command.INPUT_LABELS;
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var searchIndex = dataList[i].indexOf(" ");
                obj[dataList[i].slice(0, searchIndex)] = convertStringToObject(dataList[i].slice(searchIndex + 1).trim());
            }
            break;
        case command_1.Command.OUTPUT_LABELS:
            obj.command = command_1.Command.OUTPUT_LABELS;
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var searchIndex = dataList[i].indexOf(" ");
                obj[dataList[i].slice(0, searchIndex)] = convertStringToObject(dataList[i].slice(searchIndex + 1).trim());
            }
            break;
        case command_1.Command.VIDEO_OUTPUT_ROUTING:
            obj.command = command_1.Command.VIDEO_OUTPUT_ROUTING;
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var searchIndex = dataList[i].indexOf(" ");
                obj[dataList[i].slice(0, searchIndex)] = convertStringToObject(dataList[i].slice(searchIndex + 1).trim());
            }
            break;
        case command_1.Command.VIDEO_OUTPUT_LOCKS:
            obj.command = command_1.Command.VIDEO_OUTPUT_LOCKS;
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var searchIndex = dataList[i].indexOf(" ");
                obj[dataList[i].slice(0, searchIndex)] = convertStringToObject(dataList[i].slice(searchIndex + 1).trim());
            }
            break;
    }
    if (!obj.type && !obj.command && data) {
        obj.data = data;
    }
    return obj;
}
exports.convertToObject = convertToObject;
function convertObjectToLabels(obj, type) {
    var labels = [];
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        if (key && key != "command") {
            labels.push(new label_1.Label(+key, obj[key], type));
        }
    }
    return labels;
}
exports.convertObjectToLabels = convertObjectToLabels;
function convertObjectToRoutes(obj) {
    var routes = [];
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        if (key && key != "command") {
            routes.push(new route_1.Route(+key, obj[key], lockState_1.LockState.UNLOCKED, "route"));
        }
    }
    return routes;
}
exports.convertObjectToRoutes = convertObjectToRoutes;
function convertObjectToLockStates(obj) {
    var lockStates = [];
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        if (key && key != "command") {
            lockStates.push({ "output": key, "state": obj[key], type: "lock_state" });
        }
    }
    return lockStates;
}
exports.convertObjectToLockStates = convertObjectToLockStates;
function convertStringToObject(toConvert) {
    var num = +toConvert;
    if (!isNaN(num)) {
        return num;
    }
    switch (toConvert) {
        case "true":
            return true;
        case "false":
            return false;
    }
    return toConvert;
}
