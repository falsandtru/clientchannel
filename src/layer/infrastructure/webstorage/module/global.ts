import { isStorageAvailable } from "../../environment/api";

export const localStorage: Storage | undefined = isStorageAvailable ? self.localStorage : void 0;
export const sessionStorage: Storage | undefined = isStorageAvailable ? self.sessionStorage : void 0;
