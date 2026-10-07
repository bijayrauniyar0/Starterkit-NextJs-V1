"use client";

import { AxiosError, RawAxiosRequestHeaders } from "axios";
import { useEffect, useMemo, useRef } from "react";

import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Config,
  CustomOptions,
  GetPathKey,
  MutationMethod,
  MutationPathKey,
  PaginatedResponse,
  resolvePath,
} from "@/lib/api-shared";

import { api } from "./client";

/**
 * Generic query hook creator
 */
export const createUseApiQuery = <C extends Config>(config: C) => {
  return <
    TData = unknown,
    TSelect = TData,
    P extends Record<string, string | number> = Record<string, string | number>,
    Q extends Record<string, unknown> = Record<string, unknown>,
    K extends GetPathKey<C> = GetPathKey<C>,
  >({
    pathParams,
    queryParams,
    options,
    pathKey,
  }: {
    pathParams?: P;
    queryParams?: Q;
    options?: CustomOptions<TData, AxiosError, TSelect>;
    pathKey: K;
  }) => {
    const path = config.paths?.get?.[pathKey as string];
    if (!path) {
      throw new Error(`GET path "${String(pathKey)}" is not defined in config`);
    }
    const resolvedPath = resolvePath(path, pathParams, config.rootPath);
    return useQuery<TData, AxiosError, TSelect>({
      queryKey: [config.resource, pathKey, pathParams],
      queryFn: async () => {
        const response = await api.get<TData>(resolvedPath, {
          params: queryParams,
        });
        return response.data;
      },
      ...options,
    });
  };
};

export const createUseApiInfiniteQuery = <C extends Config>(config: C) => {
  return <
    TData,
    P extends Record<string, string | number> = Record<string, string | number>,
    Q extends Record<string, unknown> = Record<string, unknown>,
    K extends GetPathKey<C> = GetPathKey<C>,
  >({
    pathKey,
    pathParams,
    queryParams,
    options,
    initialData,
  }: {
    pathKey: K;
    pathParams?: P;
    queryParams?: Q;
    options?: Omit<
      UseInfiniteQueryOptions<
        PaginatedResponse<TData>,
        AxiosError,
        InfiniteData<PaginatedResponse<TData>>
      >,
      | "queryKey"
      | "queryFn"
      | "getNextPageParam"
      | "initialPageParam"
      | "initialData"
    > & { queryKey?: QueryKey };
    initialData?: PaginatedResponse<TData>;
  }) => {
    const path = config.paths?.get?.[pathKey as string];
    if (!path) {
      throw new Error(`GET path "${String(pathKey)}" is not defined in config`);
    }
    const resolvedPath = resolvePath(path, pathParams, config.rootPath);

    const { data, ...query } = useInfiniteQuery<
      PaginatedResponse<TData>,
      AxiosError,
      InfiniteData<PaginatedResponse<TData>>
    >({
      queryKey: [config.resource, "infinite", pathParams, queryParams],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await api.get<PaginatedResponse<TData>>(resolvedPath, {
          params: { ...queryParams, page: pageParam },
        });
        return res.data;
      },
      getNextPageParam: (lastPage) => {
        const nextUrl = lastPage.links.next;
        if (!nextUrl) return undefined;

        try {
          const url = new URL(nextUrl);
          const nextPage = url.searchParams.get("page");
          return nextPage ? Number(nextPage) : undefined;
        } catch {
          return undefined;
        }
      },
      initialData: initialData
        ? { pages: [initialData], pageParams: [1] }
        : undefined,
      initialPageParam: 1,
      ...options,
    });
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!loadMoreRef.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              query.hasNextPage &&
              !query.isFetchingNextPage
            ) {
              query.fetchNextPage();
            }
          });
        },
        { rootMargin: "100px" },
      );
      observer.observe(loadMoreRef.current);
      return () => observer.disconnect();
    }, [query.hasNextPage, query.isFetchingNextPage]);

    const flatData = useMemo(() => {
      return data?.pages.flatMap((page) => page.results) ?? [];
    }, [data]);

    return { ...query, data, loadMoreRef, flatData };
  };
};

export const createUseApiMutation = <C extends Config>(config: C) => {
  return <
    Payload = unknown,
    T = unknown,
    M extends MutationMethod = "post",
    P extends Record<string, string | number> = Record<string, string | number>,
    Q extends Record<string, unknown> = Record<string, unknown>,
    K extends MutationPathKey<C, M> = MutationPathKey<C, M>,
  >({
    method = "post" as M,
    pathParams,
    queryParams,
    options,
    pathKey,
    headers,
  }: {
    method?: M;
    pathParams?: P;
    queryParams?: Q;
    options?: UseMutationOptions<T, AxiosError, Payload>;
    pathKey: K;
    headers?: RawAxiosRequestHeaders;
  }) => {
    const path = config.paths?.[method]?.[pathKey as string];

    if (!path) {
      throw new Error(
        `${method.toUpperCase()} path "${String(pathKey)}" is not defined in config`,
      );
    }

    const resolvedPath = resolvePath(path, pathParams, config.rootPath);

    return useMutation<T, AxiosError, Payload>({
      mutationFn: async (payload?: Payload) => {
        const axiosConfig = {
          params: queryParams,
          headers,
        };

        if (method === "delete") {
          const response = await api[method]<T>(resolvedPath, axiosConfig);
          return response.data;
        }

        const response = await api[method]<T>(
          resolvedPath,
          payload,
          axiosConfig,
        );
        return response.data;
      },
      ...options,
    });
  };
};

export const createUseInvalidateAll = (config: Config) => {
  return () => {
    const queryClient = useQueryClient();
    return () => {
      queryClient.invalidateQueries({ queryKey: [config.resource] });
    };
  };
};
