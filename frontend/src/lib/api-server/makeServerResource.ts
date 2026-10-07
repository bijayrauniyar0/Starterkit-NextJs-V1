import { Config } from "@/lib/api-shared";

import { createPrefetchQuery, createRequest } from "./requests";

export const makeServerApiResource = <C extends Config>(config: C) => {
  const hooks = {
    request: createRequest(config),
    prefetch: createPrefetchQuery(config),
  };
  return hooks;
};

// Alias for consistency
export const makeServerResource = makeServerApiResource;
