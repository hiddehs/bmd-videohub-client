import {Command} from "./models/command";
import {Label} from "./models/label";
import {LockState} from "./models/lockState";
import {Route} from "./models/route";

export function convertToObject(data: string): any {
    var obj: any = {};
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
        case Command.INPUT_LABELS:
            obj.command = Command.INPUT_LABELS;
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var searchIndex = dataList[i].indexOf(" ");
                obj[dataList[i].slice(0, searchIndex)] = convertStringToObject(dataList[i].slice(searchIndex + 1).trim());
            }
            break;
        case Command.OUTPUT_LABELS:
            obj.command = Command.OUTPUT_LABELS;
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var searchIndex = dataList[i].indexOf(" ");
                obj[dataList[i].slice(0, searchIndex)] = convertStringToObject(dataList[i].slice(searchIndex + 1).trim());
            }
            break;
        case Command.VIDEO_OUTPUT_ROUTING:
            obj.command = Command.VIDEO_OUTPUT_ROUTING;
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var searchIndex = dataList[i].indexOf(" ");
                obj[dataList[i].slice(0, searchIndex)] = convertStringToObject(dataList[i].slice(searchIndex + 1).trim());
            }
            break;
        case Command.VIDEO_OUTPUT_LOCKS:
            obj.command = Command.VIDEO_OUTPUT_LOCKS;
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

export function convertObjectToLabels(obj: any, type: string): Label[] {
    var labels: Label[] = [];
    for (var key of Object.keys(obj)) {
        if (key && key != "command") {
            labels.push(new Label(+key, obj[key], type));
        }
    }
    return labels;
}

export function convertObjectToRoutes(obj: any): Route[] {
    var routes: Route[] = [];
    for (var key of Object.keys(obj)) {
        if (key && key != "command") {
            routes.push(new Route(+key, obj[key], LockState.UNLOCKED, "route"));
        }
    }
    return routes;
}

export function convertObjectToLockStates(obj: any): any {
    var lockStates: any[] = [];
    for (var key of Object.keys(obj)) {
        if (key && key != "command") {
            lockStates.push({"output": key, "state": obj[key], type: "lock_state"});
        }
    }
    return lockStates;
}

function convertStringToObject(toConvert: string): any {
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
