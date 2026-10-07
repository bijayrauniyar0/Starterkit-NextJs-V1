import { useEffect, useState } from "react";

export function useScreenWidth(): number {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowWidth;
}
