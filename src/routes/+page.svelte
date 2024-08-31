<script lang="ts">
  import "@fontsource/inter";
  import "@fontsource/inter/300.css";
  import "@fontsource/inter/500.css";
  import "@fontsource/inter/500-italic.css";
  import "@fontsource/inter/600.css";
  import Donation from "../components/donation/Donation.svelte";
  import { activeDropdown, activeModal, editMode } from "../store/ui";
  import Dropdown from "../components/overlay/Dropdown.svelte";
  import { Toaster } from "svelte-french-toast";
  import Modal from "../components/overlay/Modal.svelte";
  import { afterUpdate } from "svelte";
  import AccountGroupContainer from "../components/account/AccountGroupContainer.svelte";

  $: disableInteractionsOverlay =
    $activeDropdown !== undefined || $activeModal !== undefined;
</script>

<div class="page">
  {#if disableInteractionsOverlay}
    <div
      class="disable-interactions"
      style={$activeDropdown
        ? "background-color: rgba(0, 0, 0, 0.2)"
        : "background-color: rgba(0, 0, 0, 0.8)"}
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
    <div class="credits">by @fluentcoding</div>
    <div class="title">Riot Account Manager</div>
    <div class="gap" />
    <AccountGroupContainer />
    <div class="gap" />
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
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
</style>
