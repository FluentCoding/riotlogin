import { Mutex } from "async-mutex";
import persistent, { type AccountType } from "../store/persistent";
import periodicAction from "./utils/periodic";
import { writable, type Writable } from "svelte/store";
import type { RiotRegion } from "../components/util/riot";

const RANK_UPDATE_PERIOD = 1000 * 60 * 60;
export const fetchRankViewURLs = (riotId: string, region: string) => {
  const tag = riotId.replace("#", "-");
  return {
    opgg: {
      icon: "thirdparty/opgg.png",
      label: "OP.GG",
      link: `https://www.op.gg/summoners/${region}/${tag}`,
    },
    ugg: {
      icon: "thirdparty/ugg.jpeg",
      label: "U.GG",
      link: `https://u.gg/lol/profile/${
        (
          {
            na: "na1",
            me: "me1",
            euw: "euw1",
            eune: "eune",
            oce: "oc1",
            kr: "kr",
            jp: "jp1",
            br: "br1",
            las: "la2",
            lan: "la1",
            ru: "ru",
            tr: "tr1",
            sg: "sg2",
            ph: "ph2",
            tw: "tw2",
            vn: "vn2",
            th: "th2",
          } satisfies Record<RiotRegion, string>
        )[region]
      }/${tag}`,
    },
    deeplol: {
      icon: "thirdparty/deeplol.png",
      label: "DEEPLOL",
      link: `https://deeplol.gg/summoner/${region}/${tag}`,
    },
    log: {
      icon: "thirdparty/log.jpg",
      label: "LeagueOfGraphs",
      link: `https://www.leagueofgraphs.com/summoner/${region}/${tag}`,
    },
    poro: {
      icon: "thirdparty/poro.png",
      label: "Porofessor Live",
      link: `https://porofessor.gg/live/${region}/${tag}`,
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
                      region: account.region,
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
