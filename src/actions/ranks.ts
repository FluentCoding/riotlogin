import { Mutex } from "async-mutex";
import persistent, { type AccountType } from "../stores/persistent";
import periodicAction from "./utils/periodic";
import { writable, type Writable } from "svelte/store";
import toast from "svelte-french-toast";
import rankUrls from "../static/rank_urls.json";

const RANK_UPDATE_PERIOD = 1000 * 60 * 60;
export const fetchRankViewURLs = (riotId: string, region: string) => {
  const tag = riotId.replace("#", "-");

  return Object.fromEntries(
    Object.entries(rankUrls.urls).map(([key, value]) => [
      key,
      {
        icon: value.icon,
        label: value.label,
        link: `${value.baseLink}/${
          (value.region as Record<string, string>)[region] ?? region
        }/${tag}`,
      },
    ])
  );
};

const pullActionStore: {
  currentlyPulledAccounts: Writable<string[]>;
} = {
  currentlyPulledAccounts: writable([]),
};
const pullActionMutex = new Mutex();
const pullAction = {
  ...periodicAction(
    () =>
      pullActionMutex.runExclusive(async () => {
        const accounts = persistent.accounts
          .get()
          .groups.map((group) => group.accounts)
          .flat();
        const cache = persistent.ranksCache.get();

        {
          const accountsToUpdate = accounts
            .filter(
              (account) =>
                account.riotId !== undefined && account.riotId.length > 0
            )
            .filter(
              (account) =>
                !(account.uuid in cache.entries) ||
                Date.now() - cache.entries[account.uuid].lastTimePulled >
                  RANK_UPDATE_PERIOD - 5000 // 5s tolerance
            );

          if (accountsToUpdate.length > 0) {
            console.info(
              `Updating ranks: ${accountsToUpdate.map(
                (account) => account.riotId
              )}`
            );

            pullActionStore.currentlyPulledAccounts.set(
              accountsToUpdate.map((account) => account.uuid)
            );

            let result;
            try {
              result = await (
                await fetch("http://localhost:3000/ranks", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json;charset=utf-8",
                  },
                  body: JSON.stringify({
                    accounts: accountsToUpdate.map((account) => ({
                      uuid: account.uuid,
                      riotId: account.riotId,
                      region: account.region,
                    })),
                  }),
                })
              ).json();
              console.info(result);
            } catch (e) {
              toast.error(
                "Failed to pull ranks, check your internet connection or reach out on discord"
              );
            } finally {
              pullActionStore.currentlyPulledAccounts.set([]);
            }

            if (result) {
              // todo zod or elysia eden
              for (const entry of result) {
                if ("error" in entry) continue;

                cache.entries[entry.uuid] = {
                  rank: entry,
                  lastTimePulled: Date.now(),
                };
              }
            }
          }
        }

        persistent.ranksCache.set({
          ...cache,
          entries: Object.fromEntries(
            // remove deleted accounts
            Object.entries(cache.entries).filter(([uuid]) =>
              accounts.some((account) => account.uuid === uuid)
            )
          ),
        });
      }),
    RANK_UPDATE_PERIOD
  ),
  store: pullActionStore,
  mutex: pullActionMutex,
};

export default pullAction;
