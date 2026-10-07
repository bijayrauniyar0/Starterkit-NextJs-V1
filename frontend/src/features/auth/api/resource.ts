import { makeClientApiResource } from "@/lib/api-client/makeClientResource";

import { authConfig } from "./config";

export const authResource = makeClientApiResource(authConfig);
