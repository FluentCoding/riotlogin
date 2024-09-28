<script lang="ts">
  import Donation from "../components/donation/Donation.svelte";
  import { editMode } from "../stores/app";
  import AccountGroupContainer from "../components/account/AccountGroupContainer.svelte";
  import { onMount } from "svelte";
  import pullAction from "../actions/ranks";
  import Header from "../components/common/Header.svelte";
</script>

<Header />
<div class="gap" />
<AccountGroupContainer />
<div class="fill-remaining-height" />
<Donation />

<style lang="scss">
  .gap {
    margin-top: 14px;
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
