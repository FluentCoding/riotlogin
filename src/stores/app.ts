import { writable } from "svelte/store";
import { rawPasswordStore } from "./password";
import type { ModalType } from "../components/overlay/modal";

export const activeDropdown = writable<
  | {
      target: HTMLElement;
      items: { icon?: string; label: string; link: string }[];
    }
  | undefined
>();

export const activeModal = writable<
  (ModalType & { resolve: Function }) | undefined
>();

export const editMode = writable<boolean>(false);

export let passwordStore = rawPasswordStore;
