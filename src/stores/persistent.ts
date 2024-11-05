import { Store } from "@tauri-apps/plugin-store";
import { get as getFromStore, writable } from "svelte/store";
import type { Riot } from "../types/riot";
import { PersistentSettings } from "./settings";
import type {
  EncryptedAccountPassword,
  EncryptedMasterPassword,
} from "../actions/password";

type PersistentValue = {
  version: number;
};

export type AccountType = AccountGroupType["accounts"][0];
export type AccountGroupType = PullPersistentValueType<"accounts">["groups"][0];

export type PullPersistentValueType<T extends keyof typeof persistent> =
  Awaited<ReturnType<(typeof persistent)[T]["get"]>>;

const persistent = await (async () => {
  const store = new Store("data.bin");
  const K = async <const T extends PersistentValue>(
    key: string,
    _default: T & { version: T["version"] }
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
          region?: Riot.Region;
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
          rank: {
            tier: Riot.League.Rank;
            division?: number;
            lp?: number;
            wl: [number, number];
          };
          lastTimePulled: number;
        }
      >;
    }>("ranks_cache", { version: 1, entries: {} }),
    passwords: await K<
      {
        version: 1;
      } & (
        | {
            entries: Record<string, string>;
          }
        | {
            masterPassword: EncryptedMasterPassword;
            entries: Record<string, EncryptedAccountPassword>;
          }
      )
    >("passwords", { version: 1, entries: {} }),
    settings: await K<{ version: 1 } & PersistentSettings.Type>("settings", {
      version: 1,
      ...PersistentSettings.createDefault(),
    }),
  };
})();

export default persistent;
