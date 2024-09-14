<script lang="ts">
  import "@fontsource/inter";
  import "@fontsource/inter/300.css";
  import "@fontsource/inter/500.css";
  import "@fontsource/inter/500-italic.css";
  import "@fontsource/inter/600.css";
  import Donation from "../components/donation/Donation.svelte";
  import { activeDropdown, activeModal, editMode } from "../store/app";
  import Dropdown from "../components/overlay/Dropdown.svelte";
  import { Toaster } from "svelte-french-toast";
  import Modal from "../components/overlay/Modal.svelte";
  import AccountGroupContainer from "../components/account/AccountGroupContainer.svelte";
  import { exit } from "@tauri-apps/plugin-process";
  import { onMount } from "svelte";
  import pullAction from "../actions/ranks";

  $: disableInteractionsOverlay =
    $activeDropdown !== undefined || $activeModal !== undefined;

  onMount(() => {
    pullAction.start(2000);
    return () => pullAction.stop();
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
    <div class="header">
      <div class="exit" on:click={() => exit()}>Exit</div>
    </div>
    <div class="credits">by @fluentcoding</div>
    <div class="title">Riot Account Manager</div>
    <div class="gap" />
    <AccountGroupContainer />
    <div class="gap" />
    <div class="edit" on:click={() => editMode.set(!$editMode)}>
      {$editMode ? "Stop edit mode" : "Edit Accounts"}
    </div>
    <div class="fill-remaining-height" />
    <Donation />
  </div>
</div>

<style lang="scss">
  :root {
    color-scheme: dark;
    background-color: black;
  }

  .disable-interactions {
    position: absolute;
    z-index: 1;
    height: 100vh;
    width: 100vw;
    pointer-events: auto;
  }

  .page {
    color: white;
    font-family: "Inter";
    min-width: 100%;
    min-height: 100vh;
    user-select: none;
  }

  .container {
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 20px);

    .header {
      display: flex;
      justify-content: end;
      .exit {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        border-radius: 10px;
        width: 30px;
        padding: 5px;
        background-color: #323232;
        cursor: pointer;

        &:hover {
          outline: 2px solid lightcoral;
        }
      }
    }

    .credits {
      font-size: 13px;
      font-weight: 300;
      color: #a9a9a9;
      margin-bottom: 5px;
    }

    .title {
      font-size: 26px;
      font-weight: 600;
    }

    .gap {
      margin-top: 15px;
    }

    .fill-remaining-height {
      margin-top: 10px;
      flex-grow: 1;
    }

    .edit {
      background-color: #323232;
      border-radius: 12px;
      text-align: center;
      padding: 8px 0;
      color: #d5d5d5;
      font-size: 13px;
      font-weight: 500;

      &:hover {
        background-color: #2d2d2d;
        cursor: pointer;
      }
    }
  }
</style>
