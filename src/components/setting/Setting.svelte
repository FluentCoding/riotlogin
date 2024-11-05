<script lang="ts">
  import persistent from "../../stores/persistent";
  import { settingsScheme } from "../../stores/settings";

  export let setting:
    | keyof typeof settingsScheme
    | {
        // todo improve
        type: "checkbox";
        label: string;
        description: string;
        value: boolean;
      }
    | {
        type: "button";
        label: string;
        description: string;
      };
  // todo improve
  export let hook: ((...args: any[]) => Promise<void>) | undefined = undefined;

  let processingHook = false;

  const settings = persistent.settings;
  $: scheme = typeof setting === "string" ? settingsScheme[setting] : setting;
  $: checked =
    typeof setting === "string"
      ? $settings[setting]
      : setting.type === "checkbox" && setting.value;
  $: change =
    typeof setting === "string"
      ? (v: boolean) => persistent.settings.change({ [setting]: v })
      : (_: boolean) => {};
</script>

<div
  class="setting"
  on:click={() => scheme.type === "button" && hook?.()}
  class:disable-interactions={scheme.type !== "button"}
>
  <div class="info">
    <span class="label">{scheme.label}</span>
    <span class="description">{scheme.description}</span>
  </div>
  {#if scheme.type === "checkbox"}
    <div class="end">
      <label class="switch">
        <input
          type="checkbox"
          {checked}
          disabled={processingHook}
          on:change={async (e) => {
            const target = e.currentTarget;
            const checked = target.checked;
            if (hook) {
              processingHook = true;
              try {
                target.checked = !checked; // keep old state
                await hook(checked);
              } finally {
                processingHook = false;
              }
              target.checked = checked; // reenable after asynchronous code execution
            }
            change(checked);
          }}
        />
        <span class="slider"></span>
      </label>
    </div>
  {/if}
</div>

<style lang="scss">
  :root {
    --slider-animation-duration: 0.3s;
  }

  @property --slider-start-color {
    syntax: "<color>";
    initial-value: #181818;
    inherits: false;
  }

  @property --slider-end-color {
    syntax: "<color>";
    initial-value: #181818;
    inherits: false;
  }

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
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        box-shadow: 0 0 1px 1px #7f7f7f;
        border-radius: 34px;
        background-color: #181818;
        background: linear-gradient(
          90deg,
          var(--slider-start-color),
          var(--slider-end-color)
        );
        transition:
          --slider-start-color var(--slider-animation-duration),
          --slider-end-color var(--slider-animation-duration);
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 30px;
        width: 30px;
        border-radius: 50%;
        left: 2px;
        bottom: 2px;
        background: linear-gradient(90deg, #2a2a2a 0%, #3b3b3b 100%);
        transition: var(--slider-animation-duration);
        box-shadow: 0px 6px 14px 2px #000000;
      }

      input:checked + .slider {
        --slider-start-color: #0c8d00;
        --slider-end-color: #0e401b;
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      input[disabled] + .slider {
        filter: brightness(70%);
      }

      input:not([disabled]) + .slider {
        cursor: pointer;
      }
    }

    &:hover:not(:has(.modal:hover)):not(.disable-interactions) {
      outline: 2px solid #0088ff;
      background-color: #242424;
      cursor: pointer;
    }
  }
</style>
