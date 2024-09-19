import { Mutex } from "async-mutex";
import persistent, { type AccountType } from "../store/persistent";
import periodicAction from "./utils/periodic";
import { writable, type Writable } from "svelte/store";

const RANK_UPDATE_PERIOD = 1000 * 60 * 60;
export const fetchRankViewURLs = (riotId: string) => {
  const tag = riotId.replace("#", "-");
  return {
    opgg: {
      icon: "thirdparty/opgg.png",
      label: "OP.GG",
      link: `https://www.op.gg/summoners/euw/${tag}`,
    },
    ugg: {
      icon: "thirdparty/ugg.jpeg",
      label: "U.GG",
      link: `https://u.gg/lol/profile/euw1/${tag}`,
    },
    deeplol: {
      icon: "thirdparty/deeplol.png",
      label: "DEEPLOL",
      link: `https://deeplol.gg/summoner/EUW/${tag}`,
    },
    log: {
      icon: "thirdparty/log.jpg",
      label: "LeagueOfGraphs",
      link: `https://www.leagueofgraphs.com/summoner/euw/${tag}`,
    },
    poro: {
      icon: "thirdparty/poro.png",
      label: "Porofessor Live",
      link: `https://porofessor.gg/live/euw/${tag}`,
    },
  };
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
          let result;

          const accountsToUpdate = accounts
            .filter((account) => account.riotId !== undefined)
            .filter(
              (account) =>
                !(account.uuid in cache.entries) ||
                Date.now() - cache.entries[account.uuid].lastTimePulled >
                  RANK_UPDATE_PERIOD
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
                      region: "euw",
                    })),
                  }),
                })
              ).json();
              console.info(result);
            } catch (e) {
              console.error("Couldn't connect to rank pulling service");
            } finally {
              pullActionStore.currentlyPulledAccounts.set([]);
            }

            if (result) {
              // todo zod or elysia eden
              for (const entry of result) {
                if (typeof entry === "object") {
                  cache.entries[entry.uuid] = {
                    rank: entry,
                    lastTimePulled: Date.now(),
                  };
                }
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
