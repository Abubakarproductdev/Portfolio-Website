import { createSignal, onCleanup, onMount } from "solid-js";

export function createScrollProgress(targetAccessor) {
  const [progress, setProgress] = createSignal(0);

  onMount(() => {
    const update = () => {
      const target = targetAccessor?.();
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

      if (!target) {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        setProgress(Math.min(1, Math.max(0, scrollY / maxScroll)));
        return;
      }

      const rect = target.getBoundingClientRect();
      const top = rect.top + scrollY;
      const height = Math.max(1, target.offsetHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, (scrollY - top) / height)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    onCleanup(() => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    });
  });

  return progress;
}
