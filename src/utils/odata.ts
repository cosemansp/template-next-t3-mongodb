import buildODataQuery from "odata-query";

export { buildODataQuery };

export const omitOData = <TData extends object>(source: TData): TData => {
  if (typeof source === "object" && source !== null) {
    const newObj = { ...source };
    if ("@odata.type" in newObj) delete newObj["@odata.type"];
    if ("@odata.context" in newObj) delete newObj["@odata.context"];
    return newObj;
  }
  return source;
};
