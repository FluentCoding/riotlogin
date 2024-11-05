import { activeModal } from "../../stores/app";

export namespace ModalCollection {
  export function of<const T extends Record<string, ModalType>>(collection: T) {
    return {
      async show<const X extends keyof T>(type: X) {
        const result = await showModal(collection[type]);
        return result;
      },
    };
  }
}

interface InputModalField {
  id: string;
  required?: true;
  tooltip?: string;
  label: string;
  default?: string;
  autoFocus?: true;
}

export type SpaceModalField = {
  type: "space";
};

export type TextModalField = InputModalField & {
  type: "text" | "password";
  placeholder?: string;
  trim?: true;
};

export type SelectModalField = InputModalField & {
  type: "select";
  values: [string, string][];
};

interface ModalAction {
  id: string;
  label: string;
  color?: string;
}

export interface ModalType {
  title: string;
  fields: (SpaceModalField | TextModalField | SelectModalField)[];
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

export const commonModals = ModalCollection.of({
  confirmDelete: {
    title: "Are you sure?",
    fields: [],
    actions: [
      { id: "delete", label: "Delete", color: "#FA8072" },
      { id: "cancel", label: "Cancel" },
    ],
  },
});
