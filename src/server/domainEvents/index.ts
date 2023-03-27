import EventEmitter from "eventemitter2";

type OnCallback<TEvent extends DomainEvent> = (
  event: TEvent
) => void | Promise<void>;

type DomainEvent = {
  event: string;
  payload: object;
};

type ListenerOptions = {
  async?: boolean;
  nextTick?: boolean;
};

class DomainEvents {
  emitter: EventEmitter;
  constructor() {
    this.emitter = new EventEmitter({
      wildcard: true,
      delimiter: ".",
    });
  }

  /**
   * raise('user.changed', { userId: 5 });
   */
  raise<T extends DomainEvent>(event: T["event"], payload: T["payload"]) {
    this.emitter.emit(event, {
      event,
      payload,
    });
  }

  /**
   * subscribe<UserChangedEvent>('user.changed', userChangedHandler);
   * @param eventType
   * @param cb
   */
  subscribe<T extends DomainEvent>(
    eventType: T["event"],
    cb: OnCallback<T>,
    options: ListenerOptions = {}
  ) {
    this.emitter.on(
      eventType,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (event) => {
        try {
          await cb(event);
        } catch (error) {
          if (error instanceof Error) {
            console.error(`Failed to handle ${eventType}: + ${error.message}`);
          }
          throw error;
        }
      },
      options
    );
  }
}

export const domainEvents = new DomainEvents();
export * from "./events";
