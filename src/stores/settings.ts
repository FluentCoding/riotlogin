interface AbstractSettingScheme<A, B> {
  type: A;
  default: B;
}
type CheckboxSettingScheme = AbstractSettingScheme<"checkbox", boolean>;

export type SettingScheme = CheckboxSettingScheme & {
  label: string;
  description: string;
};

interface SettingsSchemeTypeMapping {
  checkbox: boolean;
}

export const settingsScheme = {
  autostart: {
    type: "checkbox",
    label: "Autostart",
    description: "Start application on system start",
    default: false,
  },
  master_password: {
    type: "checkbox",
    label: "Master Password",
    description: "If active, all passwords are encrypted",
    default: false,
  },
  show_donation: {
    type: "checkbox",
    label: "Show Donation Banner",
    description: "You can disable it anytime you want ^^",
    default: true,
  },
} as const satisfies Record<string, Readonly<SettingScheme>>;

export namespace PersistentSettings {
  export type Type = {
    [K in keyof typeof settingsScheme]: SettingsSchemeTypeMapping[(typeof settingsScheme)[K]["type"]];
  };
  export const createDefault = () => {
    return Object.fromEntries(
      Object.entries(settingsScheme).map(([k, v]) => [k, v.default])
    ) as Type;
  };
}
