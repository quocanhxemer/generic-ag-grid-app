import { useState, useEffect } from "react";

function useDebounce(value, delay) {
  const [debounce, setDebounce] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounce(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value]);

  return debounce;
}

export default useDebounce;
