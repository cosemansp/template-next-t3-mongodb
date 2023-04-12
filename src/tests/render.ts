import { render as defaultRender } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import type { Session } from 'next-auth';

export type DefaultParams = Parameters<typeof defaultRender>;
export type RenderUI = DefaultParams[0];

export type RenderOptions = DefaultParams[1] & {
  router?: Partial<NextRouter> | undefined;
  session?: Session | null;
};

import { wrapper } from './wrapper';

export * from '@testing-library/react'; // export rtl from here so we can override below

export const render = (ui: RenderUI, { router = {}, session = null, ...options }: RenderOptions = {}) => {
  return defaultRender(ui, {
    wrapper: wrapper({ router, session }),
    ...options,
  });
};
