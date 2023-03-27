import { type UserChangeEvent, domainEvents } from "..";

// eslint-disable-next-line @typescript-eslint/require-await
domainEvents.subscribe<UserChangeEvent>("user.changed", (event) => {
  console.log(">>>> log", event);
});
