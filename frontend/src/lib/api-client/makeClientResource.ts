"use client";

import { Config } from "@/lib/api-shared";

import {
  createUseApiInfiniteQuery,
  createUseApiMutation,
  createUseApiQuery,
  createUseInvalidateAll,
} from "./hooks";

export const makeClientApiResource = <C extends Config>(config: C) => {
  const hooks = {
    useApiQuery: createUseApiQuery(config),
    useApiMutation: createUseApiMutation(config),
    useInvalidateAll: createUseInvalidateAll(config),
    useInfiniteApiQuery: createUseApiInfiniteQuery(config),
  };
  return hooks;
};

// Alias for consistency
export const makeClientResource = makeClientApiResource;
