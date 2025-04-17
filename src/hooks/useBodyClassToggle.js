import { useEffect } from "react";

export const useBodyClassToggle = (className, condition) => {
  useEffect(() => {
    if (condition) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove(className);
    };
  }, [className, condition]);
};
