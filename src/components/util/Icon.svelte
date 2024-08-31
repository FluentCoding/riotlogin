<script lang="ts">
  export let name: keyof typeof icons;
  export let width = "1rem";
  export let height = "1rem";
  export let focusable: string | number | null | undefined = undefined;
  let icons = {
    three_dots: {
      box: 16,
      svg: '<path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>',
    },
  } as const;
  let displayIcon = icons[name];
</script>

<svg
  class={$$props.class}
  {focusable}
  {width}
  {height}
  viewBox="0 0 {displayIcon.box} {displayIcon.box}">{@html displayIcon.svg}</svg
>
