import { writable } from "svelte/store";
import { type Account } from "../components/account/account";

export const activeDropdown = writable<
  | {
      target: HTMLElement;
      items: { icon?: string; label: string; link: string }[];
    }
  | undefined
>();
