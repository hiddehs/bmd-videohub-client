import * as net from "net";
import * as converter from "./lib/objectConverter";
import {Subject} from "rxjs";
import {Command} from "./lib/models/command";
import {StateStorage} from "./lib/stateStorage";
import {Label} from "./lib/models/label";
import {Route} from "./lib/models/route";
import {LockState} from "./lib/models/lockState";

export * from './lib/models/command';

export class Videohub {

    private dataSubject = new Subject();
    private client: net.Socket
    private debug: boolean;

    constructor(debug = false) {
        this.client = new net.Socket();
        this.debug = debug;
    }

    connect(ip: string, port: number): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this.client.connect(port, ip, () => {
                    setTimeout(() => {
                        resolve("connected");
                    }, 1000); // time to get all preamble messages
                });
                this.client.on("error", (err) => {
                    reject(err);
                });


                this.client.on('data', (data) => {
                    var objs: any[] = [];
                    var messages: string[] = []
                    if(this.debug) console.debug([data.toString()])
                    if (data.toString().indexOf("\n\n") === -1) {
                        messages = data.toString().split(/\r\n\r\n/)
                    } else {
                        messages = data.toString().split('\n\n')
                    }
                    for (let dataObj of messages) {
                        if (dataObj) {
                            var obj = converter.convertToObject(dataObj);
                            switch (obj.command) {
                                case "information":
                                    delete obj.command;
                                    StateStorage.deviceInfo = obj;
                                    objs.push(StateStorage.deviceInfo);
                                    break;
                                case Command.INPUT_LABELS:
                                    if (!StateStorage.inputLabelsStates) {
                                        StateStorage.inputLabelsStates = converter.convertObjectToLabels(obj, "input_label");
                                        objs.push(StateStorage.inputLabelsStates);
                                    } else {
                                        var labels = converter.convertObjectToLabels(obj, "input_label");
                                        for (let label of labels) {
                                            var labelFound = StateStorage.inputLabelsStates.find(x => x.index == label.index);
                                            if (labelFound) {
                                                labelFound.text = label.text;
                                            }
                                        }
                                        objs.push(labels);
                                    }
                                    break;
                                case Command.OUTPUT_LABELS:
                                    if (!StateStorage.outputLabelStates) {
                                        StateStorage.outputLabelStates = converter.convertObjectToLabels(obj, "output_label");
                                        ;
                                        objs.push(StateStorage.outputLabelStates);
                                    } else {
                                        var labels = converter.convertObjectToLabels(obj, "output_label");
                                        for (let label of labels) {
                                            var labelFound = StateStorage.outputLabelStates.find(x => x.index == label.index);
                                            if (labelFound) {
                                                labelFound.text = label.text;
                                            }
                                        }
                                        objs.push(labels);
                                    }
                                    break;
                                case Command.VIDEO_OUTPUT_ROUTING:
                                    if (!StateStorage.outputRouting) {
                                        StateStorage.outputRouting = converter.convertObjectToRoutes(obj);
                                        objs.push(StateStorage.outputRouting);
                                    } else {
                                        var routes = converter.convertObjectToRoutes(obj);
                                        for (let route of routes) {
                                            var routeFound = StateStorage.outputRouting.find(x => x.output == route.output);
                                            if (routeFound) {
                                                routeFound.input = route.input;
                                            }
                                        }
                                        objs.push(routes);
                                    }
                                    break;
                                case Command.VIDEO_OUTPUT_LOCKS:
                                    if (StateStorage.outputRouting) {
                                        var lockStates = converter.convertObjectToLockStates(obj);
                                        for (let state of lockStates) {
                                            var routeFound = StateStorage.outputRouting.find(x => x.output == state.output);
                                            if (routeFound) {
                                                routeFound.locked = state.state as LockState;
                                            }
                                        }
                                        objs.push(lockStates);
                                    }
                            }
                        }
                    }
                    this.dataSubject.next(objs);
                });

            } catch (err) {
                reject(err);
            }
        });
    }

    disconnect() {
        this.client.destroy();
    }

    getDeviceInfo() {
        return StateStorage.deviceInfo;
    }

    sendDataCommand(command: Command | string) {
        this.client.write(command + "\n\n");
    }

    getInputLabels(): Label[] {
        return StateStorage.inputLabelsStates;
    }

    changeInputLabel(index: number, text: string) {
        var command = Command.INPUT_LABELS + "\n";
        command += `${index} ${text}`;
        this.sendDataCommand(command);
    }

    getOutputLabels(): Label[] {
        return StateStorage.outputLabelStates;
    }

    changeOutputLabel(index: number, text: string) {
        var command = Command.OUTPUT_LABELS + "\n";
        command += `${index} ${text}`;
        this.sendDataCommand(command);
    }

    getOutputRouting(): Route[] {
        return StateStorage.outputRouting;
    }

    changeOutputRoute(output: number, input: number) {
        var command = Command.VIDEO_OUTPUT_ROUTING + "\n";
        command += `${output} ${input}`;
        this.sendDataCommand(command);
    }

    lockOutput(output: number) {
        var command = Command.VIDEO_OUTPUT_LOCKS + "\n";
        command += `${output} ${LockState.LOCKED_FROM_OTHER_DEVICE}`;
        this.sendDataCommand(command);
    }

    unlockOutput(output: number) {
        var command = Command.VIDEO_OUTPUT_LOCKS + "\n";
        command += `${output} ${LockState.UNLOCKED}`;
        this.sendDataCommand(command);
    }
}
