import ObjectID from "bson-objectid";
import type { Example } from "@prisma/client";

export const single = (): Example => {
  return {
    id: ObjectID().toHexString(),
    name: "test",
    createdAt: new Date(),
    address: {
      street: "123 Main St",
      city: "Anytown",
      zip: "12345",
    },
  } as Example;
};

export const shortList = (): Example[] => {
  return [
    {
      id: ObjectID().toHexString(),
      name: "def",
      createdAt: new Date(),
      updatedAt: new Date(),
      address: {
        street: "123 Main St",
        city: "Anytown",
        zip: "12345",
      },
    },
    {
      id: ObjectID().toHexString(),
      name: "abc",
      createdAt: new Date(),
      updatedAt: new Date(),
      address: {
        street: "456 Second St",
        city: "Antwerp",
        zip: "8575",
      },
    },
  ];
};
