"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Videohub = void 0;
var net = __importStar(require("net"));
var converter = __importStar(require("./lib/objectConverter"));
var rxjs_1 = require("rxjs");
var command_1 = require("./lib/models/command");
var stateStorage_1 = require("./lib/stateStorage");
var lockState_1 = require("./lib/models/lockState");
__exportStar(require("./lib/models/command"), exports);
var Videohub = /** @class */ (function () {
    function Videohub() {
        this.dataSubject = new rxjs_1.Subject();
        this.client = new net.Socket();
    }
    Videohub.prototype.connect = function (ip, port) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.client.connect(port, ip, function () {
                    setTimeout(function () {
                        resolve("connected");
                    }, 10);
                });
                _this.client.on("error", function (err) {
                    reject(err);
                });
                _this.client.on('data', function (data) {
                    var objs = [];
                    var messages = [];
                    if (data.toString().indexOf("\n\n") === -1) {
                        messages = data.toString().split(/\r\n\r\n/);
                    }
                    else {
                        messages = data.toString().split('\n\n');
                    }
                    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                        var dataObj = messages_1[_i];
                        if (dataObj) {
                            var obj = converter.convertToObject(dataObj);
                            if (obj.command === 'protocol') {
                                resolve("connected");
                            }
                            switch (obj.command) {
                                case "information":
                                    delete obj.command;
                                    stateStorage_1.StateStorage.deviceInfo = obj;
                                    objs.push(stateStorage_1.StateStorage.deviceInfo);
                                    break;
                                case command_1.Command.INPUT_LABELS:
                                    if (!stateStorage_1.StateStorage.inputLabelsStates) {
                                        stateStorage_1.StateStorage.inputLabelsStates = converter.convertObjectToLabels(obj, "input_label");
                                        objs.push(stateStorage_1.StateStorage.inputLabelsStates);
                                    }
                                    else {
                                        var labels = converter.convertObjectToLabels(obj, "input_label");
                                        var _loop_1 = function (label) {
                                            labelFound = stateStorage_1.StateStorage.inputLabelsStates.find(function (x) { return x.index == label.index; });
                                            if (labelFound) {
                                                labelFound.text = label.text;
                                            }
                                        };
                                        var labelFound;
                                        for (var _a = 0, labels_1 = labels; _a < labels_1.length; _a++) {
                                            var label = labels_1[_a];
                                            _loop_1(label);
                                        }
                                        objs.push(labels);
                                    }
                                    break;
                                case command_1.Command.OUTPUT_LABELS:
                                    if (!stateStorage_1.StateStorage.outputLabelStates) {
                                        stateStorage_1.StateStorage.outputLabelStates = converter.convertObjectToLabels(obj, "output_label");
                                        ;
                                        objs.push(stateStorage_1.StateStorage.outputLabelStates);
                                    }
                                    else {
                                        var labels = converter.convertObjectToLabels(obj, "output_label");
                                        var _loop_2 = function (label) {
                                            labelFound = stateStorage_1.StateStorage.outputLabelStates.find(function (x) { return x.index == label.index; });
                                            if (labelFound) {
                                                labelFound.text = label.text;
                                            }
                                        };
                                        var labelFound;
                                        for (var _b = 0, labels_2 = labels; _b < labels_2.length; _b++) {
                                            var label = labels_2[_b];
                                            _loop_2(label);
                                        }
                                        objs.push(labels);
                                    }
                                    break;
                                case command_1.Command.VIDEO_OUTPUT_ROUTING:
                                    if (!stateStorage_1.StateStorage.outputRouting) {
                                        stateStorage_1.StateStorage.outputRouting = converter.convertObjectToRoutes(obj);
                                        objs.push(stateStorage_1.StateStorage.outputRouting);
                                    }
                                    else {
                                        var routes = converter.convertObjectToRoutes(obj);
                                        var _loop_3 = function (route) {
                                            routeFound = stateStorage_1.StateStorage.outputRouting.find(function (x) { return x.output == route.output; });
                                            if (routeFound) {
                                                routeFound.input = route.input;
                                            }
                                        };
                                        var routeFound;
                                        for (var _c = 0, routes_1 = routes; _c < routes_1.length; _c++) {
                                            var route = routes_1[_c];
                                            _loop_3(route);
                                        }
                                        objs.push(routes);
                                    }
                                    break;
                                case command_1.Command.VIDEO_OUTPUT_LOCKS:
                                    if (stateStorage_1.StateStorage.outputRouting) {
                                        var lockStates = converter.convertObjectToLockStates(obj);
                                        var _loop_4 = function (state) {
                                            routeFound = stateStorage_1.StateStorage.outputRouting.find(function (x) { return x.output == state.output; });
                                            if (routeFound) {
                                                routeFound.locked = state.state;
                                            }
                                        };
                                        var routeFound;
                                        for (var _d = 0, lockStates_1 = lockStates; _d < lockStates_1.length; _d++) {
                                            var state = lockStates_1[_d];
                                            _loop_4(state);
                                        }
                                        objs.push(lockStates);
                                    }
                            }
                        }
                    }
                    _this.dataSubject.next(objs);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    };
    Videohub.prototype.disconnect = function () {
        this.client.destroy();
    };
    Videohub.prototype.getDeviceInfo = function () {
        return stateStorage_1.StateStorage.deviceInfo;
    };
    Videohub.prototype.sendDataCommand = function (command) {
        this.client.write(command + "\n\n");
    };
    Videohub.prototype.getInputLabels = function () {
        return stateStorage_1.StateStorage.inputLabelsStates;
    };
    Videohub.prototype.changeInputLabel = function (index, text) {
        var command = command_1.Command.INPUT_LABELS + "\n";
        command += "".concat(index, " ").concat(text);
        this.sendDataCommand(command);
    };
    Videohub.prototype.getOutputLabels = function () {
        return stateStorage_1.StateStorage.outputLabelStates;
    };
    Videohub.prototype.changeOutputLabel = function (index, text) {
        var command = command_1.Command.OUTPUT_LABELS + "\n";
        command += "".concat(index, " ").concat(text);
        this.sendDataCommand(command);
    };
    Videohub.prototype.getOutputRouting = function () {
        return stateStorage_1.StateStorage.outputRouting;
    };
    Videohub.prototype.changeOutputRoute = function (output, input) {
        var command = command_1.Command.VIDEO_OUTPUT_ROUTING + "\n";
        command += "".concat(output, " ").concat(input);
        this.sendDataCommand(command);
    };
    Videohub.prototype.lockOutput = function (output) {
        var command = command_1.Command.VIDEO_OUTPUT_LOCKS + "\n";
        command += "".concat(output, " ").concat(lockState_1.LockState.LOCKED_FROM_OTHER_DEVICE);
        this.sendDataCommand(command);
    };
    Videohub.prototype.unlockOutput = function (output) {
        var command = command_1.Command.VIDEO_OUTPUT_LOCKS + "\n";
        command += "".concat(output, " ").concat(lockState_1.LockState.UNLOCKED);
        this.sendDataCommand(command);
    };
    return Videohub;
}());
exports.Videohub = Videohub;
