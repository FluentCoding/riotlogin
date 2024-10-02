<script lang="ts">
  import Donation from "../components/donation/Donation.svelte";
  import AccountGroupContainer from "../components/account/AccountGroupContainer.svelte";
  import Header from "../components/common/Header.svelte";
  import persistent from "../stores/persistent";

  const settings = persistent.settings;
</script>

<Header />
<div class="gap" />
<AccountGroupContainer />
{#if $settings.show_donation}
  <div class="fill-remaining-height" />
  <Donation />
{/if}
