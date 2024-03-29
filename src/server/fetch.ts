import { QueryClient } from "@tanstack/query-core";
import { ofetch, FetchError } from "ofetch";
import type { FetchOptions } from "ofetch";

import type { NextApiRequest } from "next";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

type QueryKey = readonly unknown[];
type QueryFunction<TData = unknown> = () => TData | Promise<TData>;

/**
 * Simple wrapper around queryClient.fetchQuery
 * @param keys
 * @param queryFn
 * @returns query result or cached version
 */
export const fetchQuery = <TData = unknown>(
  keys: QueryKey,
  queryFn: QueryFunction<TData>
): Promise<TData> => {
  return queryClient.fetchQuery(keys, queryFn);
};

interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}
type ResponseType = keyof ResponseMap | "json";

/**
 * Returns a fetch function that adds the access token to the Authorization header
 * and improves the error handling
 * @param {NextApiRequest} req - the request object with the access token
 * @param {string}  accessToken - optional access token, when not provided by req object
 * @returns {function} fetch function
 */
export const getSecureFetch = (req: NextApiRequest, accessToken?: string) => {
  return <TData = unknown, R extends ResponseType = "json">(
    url: string,
    options: FetchOptions<R> = { headers: {} }
  ) => {
    return ofetch<TData>(url, {
      headers: {
        ...options.headers,
        Authorization: `Bearer ${
          accessToken || req.nextauth.token.accessToken
        }`,
      },
    }).catch((err) => {
      if (err instanceof FetchError) {
        // improve error by adding error payload as cause
        // when err.data contains an 'error' prop, use content of error prop
        let cause = err.data;
        if ("error" in err.data) {
          cause = err.data.error;
        }
        const newError = new FetchError(err.message, { cause });
        newError.status = err.status;
        newError.statusText = err.statusText;
        throw newError;
      }
      // some other error, rethrow
      throw err;
    });
  };
};

/**
 * Alias for ofetch
 */
export const fetch = ofetch;
