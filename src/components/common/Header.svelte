<script lang="ts">
  import { exit } from "@tauri-apps/plugin-process";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { editMode } from "../../stores/app";

  let headerElement: HTMLElement;

  onMount(() => {
    // overwrite original logic which maximizes the window when double clicking
    // https://github.com/tauri-apps/tauri/blob/28169ae097af5c676ac4e7f9ef1eee9dc2ea73e8/crates/tauri/src/window/scripts/drag.js#L13
    const onHeaderElementDoubleClick = (e: MouseEvent) => {
      if (e.button === 0 && e.detail === 2 /* dblclick */) {
        e.stopImmediatePropagation();
      }
    };
    headerElement.addEventListener("mousedown", onHeaderElementDoubleClick);
    return () => {
      headerElement.removeEventListener(
        "mousedown",
        onHeaderElementDoubleClick
      );
    };
  });
</script>

<div id="header" bind:this={headerElement} data-tauri-drag-region>
  <div class="title" data-tauri-drag-region>RiotLogin</div>
  <div style="flex-grow: 1" data-tauri-drag-region />
  <div class="actions" data-tauri-drag-region>
    <div class="edit" on:click={() => editMode.set(!$editMode)}>
      {$editMode ? "Stop edit mode" : "Edit Accounts"}
    </div>
    {#if $page.url.pathname !== "/"}
      <div class="back" on:click={() => goto("/")}>Return</div>
    {:else}
      <div class="settings" on:click={() => goto("/settings")}>Settings</div>
    {/if}
    <div class="exit" on:click={() => exit()}>Exit</div>
  </div>
</div>

<style lang="scss">
  #header {
    display: flex;
    user-select: none;

    &:hover {
      cursor: move;
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      color: #d5d5d5;
    }

    .actions {
      display: flex;
      gap: 5px;

      div {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        border-radius: 10px;
        padding: 0 10px;
        background-color: #323232;
        cursor: pointer;
      }

      .back {
        &:hover {
          outline: 2px solid orange;
        }
      }

      .edit {
        &:hover {
          outline: 2px solid grey;
        }
      }

      .settings {
        &:hover {
          outline: 2px solid lightblue;
        }
      }

      .exit {
        &:hover {
          outline: 2px solid lightcoral;
        }
      }
    }
  }
</style>
