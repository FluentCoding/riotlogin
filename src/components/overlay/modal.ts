import { activeModal } from "../../store/app";

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

export const showCommonModal = async (type: "confirmDelete") => {
  if (type == "confirmDelete") {
    const result = await showModal({
      title: "Are you sure?",
      fields: [],
      actions: [
        { id: "delete", label: "Delete", color: "#f58989" },
        { id: "cancel", label: "Cancel" },
      ],
    });
    return result?.action === "delete";
  }

  return false;
};
