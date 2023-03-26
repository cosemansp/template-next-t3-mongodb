import cache from "memory-cache";

type FetchOptions = {
  token: string;
  cacheTime?: number; // seconds
};

type ODataFetchOptions = FetchOptions & {
  select?: string;
  filter?: string;
  top?: number;
};

export const odataFetch = async <TResult = unknown>(
  url: string,
  options: ODataFetchOptions
): Promise<TResult> => {
  let combinedUrl = `${url}?$count=true`;
  combinedUrl += options.top ? `&$top=${options.top}` : `&$top=128`;
  if (options.select) {
    combinedUrl += `&$select=${options.select}`;
  }
  if (options.filter) {
    combinedUrl += `&$filter=${options.filter}`;
  }
  console.log("odataFetch", combinedUrl);
  return nFetch(combinedUrl, options);
};

const getFromCache = <TResult>(key: string): TResult => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return cache.get(key) as TResult;
};

export const nFetch = async <TResult = unknown>(
  url: string,
  options: FetchOptions
): Promise<TResult> => {
  // console.log("nFetch", url);
  const cachedData = cache.get(url) as TResult;
  if (cachedData) {
    return Promise.resolve(cachedData);
  }
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${options.token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    // strip 'error' prop when available
    let cause = data as object;
    if ("error" in data) {
      cause = data.error;
    }
    throw new Error(`nfetch request failed: ${response.status}`, {
      cause: { url, ...cause },
    });
  }
  if (options.cacheTime) {
    cache.put(url, data, options.cacheTime * 1000 /* ms */);
  }
  return data as TResult;
};

export default nFetch;
