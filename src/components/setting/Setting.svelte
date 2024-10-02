<script lang="ts">
  import { editMode } from "../../stores/app";
  import persistent from "../../stores/persistent";
  import { settingsScheme } from "../../stores/settings";

  export let setting: keyof typeof settingsScheme;
  const settings = persistent.settings.get();
  $: scheme = settingsScheme[setting];
</script>

<div class="setting" class:disable-interactions={$editMode}>
  <div class="info">
    <span class="label">{scheme.label}</span>
    <span class="description">{scheme.description}</span>
  </div>
  <div class="end">
    <label class="switch">
      <input
        type="checkbox"
        checked={settings[setting]}
        on:change={(e) =>
          persistent.settings.change({ [setting]: e.currentTarget.checked })}
      />
      <span class="slider"></span>
    </label>
  </div>
</div>

<style lang="scss">
  .setting {
    position: relative;
    display: flex;
    align-items: center;
    gap: 20px;

    background-color: #2a2a2a;
    border-radius: 10px;
    padding: 0 10px;
    height: 60px;

    .info {
      display: flex;
      justify-content: center;
      flex-direction: column;
      color: #bdbdbd;
      overflow: hidden;

      .label {
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .description {
        font-size: 12px;
        font-weight: 500;
        width: 100%;
      }
    }

    .end {
      margin-left: auto;

      .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        box-shadow: 0 0 1px 1px #7f7f7f;
        border-radius: 34px;
        background-color: #181818;
        -webkit-transition: 0.2s;
        transition: 0.4s;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 30px;
        width: 30px;
        border-radius: 50%;
        left: 2px;
        bottom: 2px;
        background: rgb(42, 42, 42);
        background: linear-gradient(
          90deg,
          rgba(42, 42, 42, 1) 0%,
          rgba(59, 59, 59, 1) 100%
        );
        -webkit-transition: 0.2s;
        transition: 0.4s;
        box-shadow: 0px 6px 15px -2px #000000;
      }

      input:checked + .slider {
        background-color: #0c8d00;
      }

      input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
      }
    }
  }
</style>
