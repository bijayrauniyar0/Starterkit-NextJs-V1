import { AxiosError } from "axios";

import { QueryClient } from "@tanstack/react-query";

import { Config, GetPathKey, resolvePath } from "@/lib/api-shared";

import { serverApi } from "./client";

export const createRequest = <C extends Config>(config: C) => {
  return async <
    T = unknown,
    P extends Record<string, string | number> = Record<string, string | number>,
    Q extends Record<string, unknown> = Record<string, unknown>,
    K extends GetPathKey<C> = GetPathKey<C>,
  >({
    pathKey,
    pathParams,
    queryParams,
  }: {
    pathKey: K;
    pathParams?: P;
    queryParams?: Q;
  }): Promise<{ data?: T; error?: AxiosError }> => {
    const path = config.paths.get?.[pathKey as string];

    if (!path) {
      return {
        error: new Error(
          `GET path "${String(pathKey)}" is not defined`,
        ) as AxiosError,
      };
    }

    const resolvedPath = resolvePath(path, pathParams, config.rootPath);

    try {
      const res = await (
        await serverApi()
      ).get<T>(resolvedPath, {
        params: queryParams,
      });
      return { data: res.data };
    } catch (error) {
      return { error: error as AxiosError };
    }
  };
};

export const createPrefetchQuery = <C extends Config>(config: C) => {
  return async <
    T = unknown,
    P extends Record<string, string | number> = Record<string, string | number>,
    Q extends Record<string, unknown> = Record<string, unknown>,
    K extends GetPathKey<C> = GetPathKey<C>,
  >({
    pathKey,
    pathParams,
    queryParams,
    queryClient,
  }: {
    pathKey: K;
    pathParams?: P;
    queryParams?: Q;
    queryClient: QueryClient;
  }) => {
    if (!config.prefetch || !pathKey) {
      throw new Error(
        `GET path "${String(pathKey)}" is not defined`,
      ) as AxiosError;
    }
    const path = config.paths.get?.[pathKey as string];

    if (!path) {
      throw new Error(
        `GET path "${String(pathKey)}" is not defined`,
      ) as AxiosError;
    }

    const resolvedPath = resolvePath(path, pathParams, config.rootPath);
    return await queryClient.prefetchQuery({
      queryKey: [config.resource, pathKey, pathParams],
      queryFn: async () => {
        const response = await (
          await serverApi()
        ).get<T>(resolvedPath, {
          params: queryParams,
        });
        return response.data;
      },
    });
  };
};
