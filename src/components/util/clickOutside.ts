import type { Action } from "svelte/action";

export const clickOutside: Action<HTMLDivElement, Function> = (
  node,
  handler
) => {
  const handleClick = (event: MouseEvent) => {
    if (!event.target) return;
    if (
      node &&
      !node.contains(event.target as HTMLElement) &&
      !event.defaultPrevented
    ) {
      handler();
    }
  };
  document.addEventListener("click", handleClick, true);
  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
};
