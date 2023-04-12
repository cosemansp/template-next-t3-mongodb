/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact, httpBatchLink, loggerLink } from '@trpc/react-query';
import fetch from 'node-fetch';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import superjson from 'superjson';

import { type AppRouter } from '@/server/api/root';

import type { RenderOptions } from './render';

// const logger = {
//   log: process.env.NEXT_PUBLIC_APP_ENV === "test" ? () => {} : console.log,
//   warn: process.env.NEXT_PUBLIC_APP_ENV === "test" ? () => {} : console.warn,
//   // ✅ no more errors on the console for tests
//   error: process.env.NEXT_PUBLIC_APP_ENV === "test" ? () => {} : console.error,
// };

const trpc = createTRPCReact<AppRouter>();

export const useClients = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );

  // just a hack to get around specific typing
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const rawFetch = (url: any, opts: any) => fetch(url, { ...opts });

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled() {
            return false; // disable auto logging for tests
          },
        }),
        httpBatchLink({
          url: `http://localhost:3001/api/trpc`,
          fetch(url, opts) {
            return rawFetch(url, opts);
          },
        }),
      ],
    }),
  );

  return { trpcClient, queryClient };
};

const ProviderPageProps = {
  cookies: 'string',
  session: null,
};

export const wrapper = (options: RenderOptions = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const { trpcClient, queryClient } = useClients();
    return (
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider session={options?.session ?? ProviderPageProps.session} refetchInterval={5 * 1000}>
            {children}
          </SessionProvider>
        </QueryClientProvider>
      </trpc.Provider>
    );
  };
  return Wrapper;
};
