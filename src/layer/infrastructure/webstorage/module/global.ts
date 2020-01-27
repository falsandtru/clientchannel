import { verifyStorageAccess } from "../../environment/api";

const storable = verifyStorageAccess();

export const localStorage: Storage | undefined = storable ? self.localStorage : void 0;
export const sessionStorage: Storage | undefined = storable ? self.sessionStorage : void 0;
