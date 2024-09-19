<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";
  import Icon from "../util/Icon.svelte";
  import type { Icons } from "../util/icon";

  type ActionLabel = { icon: Icons } | { label: string };

  export let edit:
    | MouseEventHandler<HTMLDivElement>
    | [ActionLabel, MouseEventHandler<HTMLDivElement>];
  export let remove:
    | MouseEventHandler<HTMLDivElement>
    | [ActionLabel, MouseEventHandler<HTMLDivElement>];
  export let disabled = false;
</script>

<div class="actions">
  <div
    class="action"
    data-disabled={disabled}
    on:click={disabled
      ? undefined
      : (e) => {
          e.stopPropagation();
          Array.isArray(edit) ? edit[1](e) : edit(e);
        }}
  >
    {#if Array.isArray(edit)}
      {#if "icon" in edit[0]}
        <Icon name={edit[0].icon} color="#bdbdbd" />
      {:else}
        {edit[0].label}
      {/if}
    {:else}Edit{/if}
  </div>
  <div
    class="action"
    data-disabled={disabled}
    on:click={disabled
      ? undefined
      : (e) => {
          e.stopPropagation();
          Array.isArray(remove) ? remove[1](e) : remove(e);
        }}
  >
    {#if Array.isArray(remove)}
      {#if "icon" in remove[0]}
        <Icon name={remove[0].icon} color="#bdbdbd" />
      {:else}
        {remove[0].label}
      {/if}
    {:else}Delete{/if}
  </div>
</div>

<style lang="scss">
  .actions {
    display: flex;
    gap: 6px;

    .action {
      cursor: pointer;
      color: #bdbdbd;
      font-size: 12px;
      background-color: rgb(49, 49, 49);
      padding: 1px 11px;
      border-radius: 10px;

      &:hover {
        outline: 2px solid grey;
      }

      &[data-disabled="true"] {
        cursor: none;
        opacity: 0.5;
        pointer-events: none;
      }
    }
  }
</style>
