import { verifyStorageAccess } from "../../environment/api";

const storable = verifyStorageAccess();

export const localStorage: Storage | undefined = storable ? self.localStorage : undefined;
export const sessionStorage: Storage | undefined = storable ? self.sessionStorage : undefined;
