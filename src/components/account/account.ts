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

interface RankEntry {
  rank: Rank;
  division?: number;
  lp: number;
}

export interface Account {
  name: string;
  rank: RankEntry;
}

export interface AccountGroup {
  name: string;
  accounts: Account[];
}
