import { Store } from "@tauri-apps/plugin-store";
import { get as getFromStore, writable } from "svelte/store";
import type { RiotRegion } from "../components/util/riot";

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

export type AccountType = AccountGroupType["accounts"][0];
export type AccountGroupType = PullPersistentValueType<"accounts">["groups"][0];

export type PullPersistentValueType<T extends keyof typeof persistent> =
  Awaited<ReturnType<(typeof persistent)[T]["get"]>>;

const persistent = await (async () => {
  const store = new Store("data.bin");
  const K = async <const T extends PersistentValue>(
    key: string,
    _default: T
  ) => {
    const _store = writable((await store.get<T>(key)) ?? _default);

    const get = () => getFromStore(_store);
    const set = async (value: T) => {
      await store.set(key, value);
      await store.save();
      _store.set(value);
    };

    return {
      subscribe: _store.subscribe,
      get,
      set,
      change: async (change: Partial<T>) => {
        return await set({ ...get(), ...change });
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
          alias?: string;
          riotId?: string;
          region?: RiotRegion;
        }[];
      }[];
    }>("accounts", {
      version: 1,
      groups: [],
    }),
    ranksCache: await K<{
      version: 1;
      entries: Record<
        string,
        {
          rank: { tier: Rank; division?: number; lp: number };
          lastTimePulled: number;
        }
      >;
    }>("ranks_cache", { version: 1, entries: {} }),
    rawPasswords: await K<{
      version: 1;
      entries: Record<string, string>;
    }>("raw_passwords", { version: 1, entries: {} }),
  };
})();

export default persistent;
