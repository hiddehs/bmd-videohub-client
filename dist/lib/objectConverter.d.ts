import { Label } from "./models/label";
import { Route } from "./models/route";
export declare function convertToObject(data: string): any;
export declare function convertObjectToLabels(obj: any, type: string): Label[];
export declare function convertObjectToRoutes(obj: any): Route[];
export declare function convertObjectToLockStates(obj: any): any;
