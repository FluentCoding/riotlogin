<script lang="ts">
  import { onMount } from "svelte";
  import { activeModal, showModal } from "../../store/app";
  import { clickOutside } from "../util/clickOutside";
  import { fade } from "svelte/transition";

  let result: NonNullable<Awaited<ReturnType<typeof showModal>>>["fields"] = {};
  let hasAutoFocusField = false;

  $: if ($activeModal) {
    result = Object.fromEntries(
      $activeModal.fields
        .filter((field) => "id" in field)
        .map((field) => [field.id, field.default ?? ""])
    );
    hasAutoFocusField = $activeModal.fields.some(
      (field) => "id" in field && field.autoFocus
    );
  }

  $: disabled = $activeModal?.fields
    .filter((field) => "id" in field)
    .some(
      (field) =>
        field.required &&
        (field.trim ? result[field.id]!.trim() : result[field.id]) === ""
    );

  const cancelModal = () => {
    $activeModal?.resolve(undefined);
    activeModal.set(undefined);
  };

  const submitModal = (action: string) => {
    if (!$activeModal) return;
    const originalProperties = $activeModal.fields;
    // post process
    $activeModal.resolve({
      action,
      fields: Object.fromEntries(
        Object.entries(result).map(([k, v]) => [
          k,
          originalProperties
            .filter((field) => "id" in field)
            .find((field) => field.id === k)?.trim
            ? v?.trim()
            : v,
        ])
      ),
    });
  };

  onMount(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!$activeModal) return;
      if (e.key === "Escape") cancelModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });
</script>

{#if $activeModal}
  <div
    class="modal"
    use:clickOutside={cancelModal}
    transition:fade={{ duration: 100 }}
  >
    <div class="window">
      <div class="title">{$activeModal.title}</div>
      <div class="fields">
        {#each $activeModal.fields as field, index ("id" in field ? field.id : ".")}
          <div class="field">
            {#if field.type === "space"}
              <div style="margin-top: 10px" />
            {:else}
              <div style="display: flex">
                <label
                  for={field.id}
                  style={field.required ? "font-weight: bold" : undefined}
                  >{field.label}{#if field.required}*{/if}
                </label>
                {#if field.tooltip}<span class="tooltip" title={field.tooltip}
                    >?</span
                  >{/if}
              </div>
              <!-- svelte-ignore a11y-autofocus -->
              <input
                autofocus={hasAutoFocusField ? field.autoFocus : index === 0}
                type={field.type === "text" ? "tel" : "password"}
                id={field.id}
                value={result[field.id]}
                placeholder={field.placeholder
                  ? (result[
                      $activeModal.fields
                        .filter((entry) => "id" in entry)
                        .find((entry) => entry.id === field.placeholder)?.id ??
                        ""
                    ] ?? field.placeholder)
                  : undefined}
                on:input={(e) => (result[field.id] = e.currentTarget.value)}
                on:keydown={(e) => {
                  if (e.key === "Enter") {
                    $activeModal.actions.length === 1 &&
                      !disabled &&
                      submitModal($activeModal.actions[0].id);
                  } else if (
                    (e.key === "Tab" &&
                      !e.shiftKey &&
                      index === $activeModal.fields.length - 1) ||
                    (e.key === "Tab" && e.shiftKey && index === 0)
                  ) {
                    e.preventDefault();
                  }
                }}
                autocomplete="off"
                spellcheck="false"
              />
            {/if}
          </div>
        {/each}
      </div>
      <div class="actions">
        {#each $activeModal.actions as action}
          <button
            class="action"
            {disabled}
            on:click={() => submitModal(action.id)}>{action.label}</button
          >
        {/each}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal {
    position: absolute;
    z-index: 11;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    pointer-events: none;

    height: 100vh;
    width: 100vw;

    .window {
      pointer-events: auto;

      border-radius: 6px;
      background-color: #242424;
      border: 1px solid gray;
      width: 80vw;
      max-width: 400px;

      padding: 10px;
      color: #d5d5d5;
      font-size: 13px;

      display: flex;
      flex-direction: column;
      align-items: center;

      .title {
        font-size: 17px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .fields {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .field {
          display: flex;
          align-items: center;
          gap: 10px;

          div {
            white-space: nowrap;
            font-family: inherit;
            min-width: 30%;
          }

          input {
            width: 100%;
            box-sizing: border-box;
            font-family: inherit;
            &:focus {
              outline: none;
            }
          }

          .tooltip {
            font-size: 11px;
            border-bottom: 1px solid;
            opacity: 70%;
            transition: opacity 0.3s;
            margin-left: 3px;
            margin-right: 5px;

            &:hover {
              opacity: 100%;
            }
          }
        }
      }

      .actions {
        margin-top: 10px;

        .action {
          border: 0;
          border-radius: 4px;
          padding: 5px;
          font-family: inherit;
        }
      }
    }
  }
</style>
