<script lang="ts">
  import { open } from "@tauri-apps/plugin-shell";
  import Setting from "../../components/setting/Setting.svelte";
  import SettingGroup from "../../components/setting/SettingGroup.svelte";
  import settingsActions from "../../actions/settings";
  import persistent from "../../stores/persistent";
  import passwordActions from "../../actions/password";

  const persistentPasswords = persistent.passwords;
</script>

<div class="gap" />
<SettingGroup title="General">
  <Setting setting="autostart" hook={settingsActions.autostart} />
  <Setting
    hook={passwordActions.migrate}
    setting={{
      type: "checkbox",
      label: "Master Password",
      description: "If active, all passwords are encrypted",
      value: "masterPassword" in $persistentPasswords,
    }}
  />
  <Setting setting="show_donation" />
  <Setting
    hook={passwordActions.reset}
    setting={{
      type: "button",
      label: "Reset all passwords",
      description: "If you forgot your master password",
    }}
  />
</SettingGroup>
<div class="fill-remaining-height" />
<div class="madeby">
  made with ♥ by <span
    class="creator"
    on:click={() => open("https://x.com/fluentcoding")}>@fluentcoding</span
  >
</div>

<style lang="scss">
  .madeby {
    color: #d5d5d5;
    text-align: center;
    font-size: 14px;
    margin-bottom: 8px;

    .creator {
      text-decoration: underline;
      cursor: pointer;
      transition: 0.1s filter;

      &:hover {
        filter: brightness(120%);
      }
    }
  }
</style>
