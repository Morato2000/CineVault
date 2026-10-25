import { useEffect, useState } from "react";

export default function useCoarsePointer() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(hover: none) and (pointer: coarse)"
    );

    const update = () => setIsTouch(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isTouch;
}