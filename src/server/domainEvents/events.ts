export type UserChangeEvent = {
  event: "user.changed";
  payload: {
    userId: string;
  };
};
