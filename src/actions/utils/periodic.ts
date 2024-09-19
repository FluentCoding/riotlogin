import {
  clearIntervalAsync,
  setIntervalAsync,
  type SetIntervalAsyncHandler,
  type SetIntervalAsyncTimer,
} from "set-interval-async";

export default function periodicAction(
  action: SetIntervalAsyncHandler<[]>,
  timeout: number
) {
  let interval: SetIntervalAsyncTimer<[]> | undefined;
  return {
    start: async () => {
      await action(); // start immediately, then assign interval which will fire up first after the given timeout
      interval = setIntervalAsync(action, timeout);
    },
    stop: async () => {
      if (interval) await clearIntervalAsync(interval);
    },
    action,
  };
}
