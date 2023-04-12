import superjson from 'superjson';

export const toSuperJson = <TResult>(source: unknown): TResult => {
  const jsonString = superjson.stringify(source);
  return JSON.parse(jsonString) as TResult;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toTRPCResult = (source: unknown): any => {
  return [
    {
      result: {
        data: toSuperJson(source),
      },
    },
  ];
};
