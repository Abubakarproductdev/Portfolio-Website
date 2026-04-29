import { children, onCleanup, onMount } from "solid-js";
import Lenis from "lenis";

export function ScrollStackItem(props) {
  return (
    <div
      class={`scroll-stack-card relative my-5 h-auto min-h-[26rem] w-full origin-top rounded-2xl p-0 shadow-[0_0_30px_rgba(0,0,0,0.1)] will-change-transform md:my-8 md:h-80 md:rounded-[40px] md:p-12 ${props.itemClassName || ""}`.trim()}
      style={{ "backface-visibility": "hidden", "transform-style": "preserve-3d" }}
    >
      {props.children}
    </div>
  );
}

export default function ScrollStack(props) {
  let scroller;
  let animationFrame = 0;
  let lenis;
  let cards = [];
  let cardOffsets = [];
  let endElementOffset = 0;
  let stackCompleted = false;
  let isUpdating = false;
  const lastTransforms = new Map();
  const resolved = children(() => props.children);
  const isMobile = () => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

  const calculateProgress = (scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  };

  const parsePercentage = (value, containerHeight) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  };

  const getScrollData = () => {
    if (props.useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
      };
    }

    return {
      scrollTop: scroller.scrollTop,
      containerHeight: scroller.clientHeight,
    };
  };

  const getElementOffset = (element) => {
    if (props.useWindowScroll) {
      const rect = element.getBoundingClientRect();
      return rect.top + window.scrollY;
    }

    return element.offsetTop;
  };

  const updateCardTransforms = () => {
    if (!cards.length || isUpdating) return;
    isUpdating = true;

    const itemScale = props.itemScale ?? 0.05;
    const itemStackDistance = props.itemStackDistance ?? 30;
    const stackPosition = props.stackPosition ?? "20%";
    const scaleEndPosition = props.scaleEndPosition ?? "10%";
    const baseScale = props.baseScale ?? 0.8;
    const rotationAmount = props.rotationAmount ?? 0;
    const blurAmount = props.blurAmount ?? 0;
    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    cards.forEach((card, i) => {
      if (!card) return;

      const cardTop = cardOffsets[i];
      if (cardTop === undefined) return;

      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = endElementOffset - containerHeight / 2;
      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;
      let blur = 0;

      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cards.length; j += 1) {
          const jTriggerStart = cardOffsets[j] - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) blur = Math.max(0, (topCardIndex - i) * blurAmount);
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const nextTransform = { translateY, scale, rotation, blur };
      const lastTransform = lastTransforms.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - nextTransform.translateY) > 0.01 ||
        Math.abs(lastTransform.scale - nextTransform.scale) > 0.0001 ||
        Math.abs(lastTransform.rotation - nextTransform.rotation) > 0.01 ||
        Math.abs(lastTransform.blur - nextTransform.blur) > 0.01;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
        card.style.filter = blur > 0 ? `blur(${blur}px)` : "";
        lastTransforms.set(i, nextTransform);
      }

      if (i === cards.length - 1) {
        if (isPinned && !stackCompleted) {
          stackCompleted = true;
          props.onStackComplete?.();
        } else if (!isPinned && stackCompleted) {
          stackCompleted = false;
        }
      }
    });

    isUpdating = false;
  };

  const measureLayout = () => {
    cards.forEach((card) => {
      card.style.transform = "none";
    });
    cardOffsets = cards.map((card) => getElementOffset(card));
    const endElement = props.useWindowScroll
      ? document.querySelector(".scroll-stack-end")
      : scroller?.querySelector(".scroll-stack-end");
    endElementOffset = endElement ? getElementOffset(endElement) : 0;
    updateCardTransforms();
  };

  onMount(() => {
    if (!scroller && !props.useWindowScroll) return;

    cards = Array.from(
      props.useWindowScroll
        ? document.querySelectorAll(".scroll-stack-card")
        : scroller.querySelectorAll(".scroll-stack-card"),
    );

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${props.itemDistance ?? 500}px`;
      }
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
    });

    window.addEventListener("resize", measureLayout);

    measureLayout();

    if (isMobile()) {
      window.addEventListener("scroll", updateCardTransforms, { passive: true });
      return;
    }

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 2,
      lerp: 0.5,
      syncTouch: true,
      syncTouchLerp: 0.075,
      ...(props.useWindowScroll ? {} : { wrapper: scroller, content: scroller.querySelector(".scroll-stack-inner") }),
    });

    lenis.on("scroll", updateCardTransforms);

    const raf = (time) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };

    animationFrame = requestAnimationFrame(raf);
  });

  onCleanup(() => {
    window.removeEventListener("resize", measureLayout);
    window.removeEventListener("scroll", updateCardTransforms);
    if (animationFrame) cancelAnimationFrame(animationFrame);
    lenis?.destroy();
    cards = [];
    lastTransforms.clear();
  });

  const containerClass = () =>
    props.useWindowScroll
      ? `relative w-full ${props.class || ""}`.trim()
      : `relative h-full w-full overflow-y-auto overflow-x-visible ${props.class || ""}`.trim();

  return (
    <div
      ref={scroller}
      class={containerClass()}
      style={{
        "overscroll-behavior": "contain",
        "-webkit-overflow-scrolling": "touch",
        "scroll-behavior": props.useWindowScroll ? undefined : "smooth",
        "will-change": props.useWindowScroll ? undefined : "scroll-position",
      }}
    >
      <div class="scroll-stack-inner min-h-screen px-3 pt-[8vh] pb-[34rem] md:px-20 md:pt-[20vh] md:pb-[50rem]">
        {resolved()}
        <div class="scroll-stack-end h-px w-full" />
      </div>
    </div>
  );
}
