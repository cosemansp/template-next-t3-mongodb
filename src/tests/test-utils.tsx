import {
  cloneElement,
  type FC,
  type JSXElementConstructor,
  type ReactElement,
  type ReactNode,
} from "react";
import { render as renderRtl } from "@testing-library/react";

export * from "@testing-library/react";

export type DefaultParams = Parameters<typeof renderRtl>;
export type RenderUI = DefaultParams[0];
export type RenderOptions<T extends FC> = DefaultParams[1] & {
  // declare additional render options here, these will be passed along to the `createWrapper` function
  initialProps?: T["propTypes"];
};

// add providers here
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <>{children}</>;
  };
}

export function render<T extends FC>(
  ui: ReactElement<T, string | JSXElementConstructor<T>>,
  { initialProps, ...options }: RenderOptions<T> = {}
) {
  return renderRtl(cloneElement(ui, initialProps), {
    wrapper: createWrapper(),
    ...options,
  });
}
