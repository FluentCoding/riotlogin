<script lang="ts">
  import "@fontsource/inter";
  import "@fontsource/inter/300.css";
  import "@fontsource/inter/500.css";
  import "@fontsource/inter/500-italic.css";
  import "@fontsource/inter/600.css";
  import { activeDropdown, activeModal } from "../stores/app";
  import { Toaster } from "svelte-french-toast";
  import Modal from "../components/overlay/Modal.svelte";
  import Dropdown from "../components/overlay/Dropdown.svelte";
  import { onMount } from "svelte";
  import pullAction from "../actions/ranks";
  import { invoke } from "@tauri-apps/api/core";
  import Header from "../components/common/Header.svelte";

  $: disableInteractionsOverlay =
    $activeDropdown !== undefined || $activeModal !== undefined;

  onMount(() => {
    invoke("ready"); // app is ready now, pop the window and enable tray interaction
    pullAction.start();
    return pullAction.stop;
  });
</script>

<div class="page">
  {#if disableInteractionsOverlay}
    <div
      class="disable-interactions"
      style="background-color: rgba(0, 0, 0, {$activeDropdown ? 0.2 : 0.8})"
    />
  {/if}
  <Toaster
    toastOptions={{
      position: "bottom-center",
      style:
        "background-color: #2a2a2a; box-shadow: -3px 5px 15px 2px #000000; color: white",
    }}
  />
  <Modal />
  <Dropdown />
  <div class="container">
    <Header />
    <slot />
  </div>
</div>

<style lang="scss">
  :root {
    color-scheme: dark;
    background-color: rgba(0, 0, 0, 0.9);
  }

  .page {
    color: white;
    font-family: "Inter";
    min-width: 100%;
    min-height: 100vh;
    user-select: none;
  }

  .disable-interactions {
    position: absolute;
    z-index: 1;
    height: 100vh;
    width: 100vw;
    pointer-events: auto;
  }

  .container {
    padding: 8px 16px;
    padding-bottom: 0px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 8px);
  }

  :global(.gap) {
    margin-top: 14px;
  }

  :global(.fill-remaining-height) {
    margin-top: 10px;
    flex-grow: 1;
  }
</style>
