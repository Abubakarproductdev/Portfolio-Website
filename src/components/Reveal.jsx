import { createSignal, onCleanup, onMount } from "solid-js";

export default function Reveal(props) {
  let element;
  const [visible, setVisible] = createSignal(false);

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
    );

    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  return (
    <div
      ref={element}
      class={`${props.class || ""} transition-all duration-700 ease-out ${
        visible() ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-sm"
      }`}
    >
      {props.children}
    </div>
  );
}
