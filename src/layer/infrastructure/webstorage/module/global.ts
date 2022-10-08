import { isStorageAvailable } from "../../environment/api";

export const localStorage: Storage | undefined = isStorageAvailable ? self.localStorage : undefined;
export const sessionStorage: Storage | undefined = isStorageAvailable ? self.sessionStorage : undefined;
