import { Command } from "./lib/models/command";
import { Label } from "./lib/models/label";
import { Route } from "./lib/models/route";
export * from './lib/models/command';
export declare class Videohub {
    private dataSubject;
    private client;
    private debug;
    constructor(debug?: boolean);
    connect(ip: string, port: number): Promise<string>;
    disconnect(): void;
    getDeviceInfo(): any;
    sendDataCommand(command: Command | string): void;
    getInputLabels(): Label[];
    changeInputLabel(index: number, text: string): void;
    getOutputLabels(): Label[];
    changeOutputLabel(index: number, text: string): void;
    getOutputRouting(): Route[];
    changeOutputRoute(output: number, input: number): void;
    lockOutput(output: number): void;
    unlockOutput(output: number): void;
}
