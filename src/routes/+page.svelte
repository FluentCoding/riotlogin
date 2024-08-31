<script lang="ts">
  import "@fontsource/inter";
  import "@fontsource/inter/300.css";
  import "@fontsource/inter/500.css";
  import "@fontsource/inter/500-italic.css";
  import "@fontsource/inter/600.css";
  import AccountGroup from "../components/account/AccountGroup.svelte";
  import Donation from "../components/donation/Donation.svelte";
  import { activeDropdown } from "../store/ui";
  import Dropdown from "../components/dropdown/Dropdown.svelte";
  import { Toaster } from "svelte-french-toast";
</script>

<div
  class={$activeDropdown !== undefined ? "page disable-interactions" : "page"}
>
  <Toaster
    toastOptions={{
      position: "bottom-center",
      style:
        "background-color: #2a2a2a; box-shadow: -3px 5px 15px 2px #000000; color: white",
    }}
  />
  <Dropdown />
  <div class="container">
    <div class="credits">by @fluentcoding</div>
    <div class="title">Riot Account Manager</div>
    <div class="gap" />
    <div class="account-groups">
      <AccountGroup
        data={{
          name: "Main Accounts",
          accounts: [
            {
              name: "FluentCoding#000",
              rank: { rank: "diamond", division: 4, lp: 60 },
            },
            {
              name: "Dr. Meta",
              rank: { rank: "gold", division: 1, lp: 24 },
            },
          ],
        }}
      />
      <AccountGroup
        data={{
          name: "Accounts that i love stalking",
          accounts: [
            {
              name: "Saitamaro",
              rank: { rank: "grandmaster", lp: 820 },
            },
            {
              name: "baussi",
              rank: { rank: "challenger", lp: 1450 },
            },
          ],
        }}
      />
    </div>
    <div class="gap" />
    <div class="edit">Edit Accounts</div>
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
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.1);
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

  .account-groups {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
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
