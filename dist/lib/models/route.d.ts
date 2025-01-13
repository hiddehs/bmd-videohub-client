import { LockState } from "./lockState";
export declare class Route {
    output: number;
    input: number;
    locked: LockState;
    type: string;
    constructor(output: number, input: number, locked: LockState, type: string);
}
