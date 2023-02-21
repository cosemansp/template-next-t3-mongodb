import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';
import { server } from './msw';
import { cleanup } from './test-utils';

expect.extend(matchers);

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
