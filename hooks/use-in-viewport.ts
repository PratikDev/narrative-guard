// collected from [mantine-ui](https://github.com/mantinedev/mantine/blob/master/packages/@mantine/hooks/src/use-in-viewport/use-in-viewport.ts)

import { useCallback, useRef, useState } from "react";

export interface UseInViewportReturnValue<T extends HTMLElement = HTMLElement> {
  inViewport: boolean;
  ref: React.RefCallback<T | null>;
}

export function useInViewport<
  T extends HTMLElement = HTMLElement,
>(): UseInViewportReturnValue<T> {
  const observer = useRef<IntersectionObserver | null>(null);
  const [inViewport, setInViewport] = useState(false);

  const ref: React.RefCallback<T | null> = useCallback((node) => {
    if (typeof IntersectionObserver !== 'undefined') {
      observer.current?.disconnect();

      if (node) {
        observer.current = new IntersectionObserver((entries) => {
          const lastEntry = entries[entries.length - 1];
          setInViewport(lastEntry.isIntersecting);
        });
        observer.current.observe(node);
      } else {
        observer.current = null;
        setInViewport(false);
      }
    }
  }, []);

  return { ref, inViewport };
}
