import { writable } from "svelte/store";
import { rawPasswordStore } from "./password";

export const activeDropdown = writable<
  | {
      target: HTMLElement;
      items: { icon?: string; label: string; link: string }[];
    }
  | undefined
>();

interface SpaceField {
  type: "space";
}

interface TextModalField {
  type: "text" | "password";
  id: string;
  label: string;
  default?: string;
  autoFocus?: true;
  required?: true;
  placeholder?: string;
  tooltip?: string;
  trim?: true;
}

interface ModalAction {
  label: string;
  id: string;
}

export interface ModalType {
  title: string;
  fields: (SpaceField | TextModalField)[];
  actions: ModalAction[];
}

export const showModal = <const T extends ModalType>(
  modal: T
): Promise<
  | {
      action: T["actions"][number]["id"];
      fields: {
        [K in Extract<T["fields"][number], { id: string }>["id"]]: Extract<
          T["fields"][number],
          { id: K }
        > extends { required: true }
          ? string
          : string | undefined;
      };
    }
  | undefined
> => {
  return new Promise((resolve) => {
    activeModal.set({
      ...modal,
      resolve: (v: any) => {
        activeModal.set(undefined);
        resolve(v);
      },
    });
  });
};

export const activeModal = writable<
  (ModalType & { resolve: Function }) | undefined
>();

export const editMode = writable<boolean>(false);

export let passwordStore = rawPasswordStore;
