import {
  clearIntervalAsync,
  setIntervalAsync,
  type SetIntervalAsyncHandler,
  type SetIntervalAsyncTimer,
} from "set-interval-async";

export default function periodicAction(action: SetIntervalAsyncHandler<[]>) {
  let interval: SetIntervalAsyncTimer<[]> | undefined;
  return {
    start: (timeout: number) => (interval = setIntervalAsync(action, timeout)),
    stop: () => interval && clearIntervalAsync(interval),
  };
}
