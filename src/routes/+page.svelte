<script lang="ts">
  import Donation from "../components/donation/Donation.svelte";
  import AccountGroupContainer from "../components/account/AccountGroupContainer.svelte";
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
</style>
