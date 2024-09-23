<script lang="ts">
  import { open } from "@tauri-apps/plugin-shell";
  import { activeDropdown } from "../../stores/app";
  import { clickOutside } from "../util/clickOutside";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { fade } from "svelte/transition";

  const updatePosition = () => {
    rect.set($activeDropdown?.target.getBoundingClientRect());
  };

  let rect = writable<DOMRect | undefined>();

  $: if ($activeDropdown?.target) updatePosition();

  onMount(() => {
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  });
</script>

{#if $activeDropdown}
  <div style={`position: absolute; top: ${$rect?.y}px; left: ${$rect?.x}px`}>
    <div
      class="modal"
      use:clickOutside={() => activeDropdown.set(undefined)}
      transition:fade={{ duration: 150 }}
    >
      {#each $activeDropdown.items as item}
        <div
          class="item"
          on:click={(e) => {
            e.stopPropagation();
            open(item.link);
            activeDropdown.set(undefined);
          }}
        >
          {#if item.icon}
            <img alt="" src={item.icon} width="16" height="16" />
          {/if}
          {item.label}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
  .modal {
    position: absolute;
    z-index: 10;
    top: 0;
    right: 0;
    box-shadow: -3px 5px 12px 2px #000000;
    overflow: hidden;

    border-radius: 12px;
    background-color: #242424;

    .item {
      padding: 10px;
      pointer-events: auto;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;

      &:hover {
        background-color: #323232;
      }
    }
  }
</style>
