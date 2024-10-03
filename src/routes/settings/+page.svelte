<script>
  import { open } from "@tauri-apps/plugin-shell";
  import Header from "../../components/common/Header.svelte";
  import Setting from "../../components/setting/Setting.svelte";
  import SettingGroup from "../../components/setting/SettingGroup.svelte";
  import settingsActions from "../../actions/settings";
</script>

<div class="gap" />
<SettingGroup title="General">
  <Setting setting="autostart" hook={settingsActions.autostart} />
  <Setting setting="master_password" />
  <Setting setting="show_donation" />
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
