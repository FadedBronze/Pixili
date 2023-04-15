import { useEffect } from "react";

export const usePreventCtrlMousewheel = () => {
  useEffect(() => {
    const func = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", func, { passive: false });

    return () => window.removeEventListener("wheel", func);
  });
};
