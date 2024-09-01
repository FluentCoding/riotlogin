import { Store } from "@tauri-apps/plugin-store";
import { get, writable } from "svelte/store";

type PersistentValue = {
  version: number;
};

type Rank =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "emerald"
  | "diamond"
  | "master"
  | "grandmaster"
  | "challenger";

export type PullPersistentValueType<T extends keyof typeof persistent> =
  Awaited<ReturnType<(typeof persistent)[T]["get"]>>;

const persistent = await (async () => {
  const store = new Store("data.bin");
  const K = async <T extends PersistentValue>(key: string, _default: T) => {
    const _store = writable((await store.get<T>(key)) ?? _default);

    return {
      subscribe: _store.subscribe,
      get: () => get(_store),
      set: async (value: T) => {
        await store.set(key, value);
        await store.save();
        _store.set(value);
      },
    };
  };

  return {
    accounts: await K<{
      version: 1;
      groups: {
        uuid: string;
        name: string;
        accounts: {
          uuid: string;
          name: string;
          // password => pull from rust keychain
          rank?: { rank: Rank; division?: number; lp: number }; // TODO PULL FROM SERVER + CACHE
        }[];
      }[];
    }>("accounts", {
      version: 1,
      groups: [],
    }),
  };
})();

export default persistent;
