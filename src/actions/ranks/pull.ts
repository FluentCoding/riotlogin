import persistent from "../../store/persistent";
import periodicAction from "../utils/periodic";

const pullAction = periodicAction(() => {
  console.info("Pulling ranks");

  const accounts = persistent.accounts
    .get()
    .groups.map((group) => group.accounts)
    .flat();
  const cache = persistent.ranksCache.get();

  for (const account of accounts) {
    /*cache.entries[account.uuid] = {
      rank: "diamond",
      lp: 1,
      division: 1,
    };*/
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
});

export default pullAction;
