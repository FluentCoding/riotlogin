import { writable } from "svelte/store";

export const activeDropdown = writable<
  | {
      target: HTMLElement;
      items: { icon?: string; label: string; link: string }[];
    }
  | undefined
>();

interface ModalField {
  type: "text";
  id: string;
  label: string;
  default?: string;
  required?: true;
}

interface ModalAction {
  label: string;
  id: string;
}

export interface ModalType {
  title: string;
  fields: ModalField[];
  actions: ModalAction[];
}

export const showModal = <const T extends ModalType>(
  modal: T
): Promise<
  | {
      action: T["actions"][number]["id"];
      fields: Record<T["fields"][number]["id"], string>;
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
