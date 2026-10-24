import { useEffect, useState } from 'react';

export function useDebouncedGuestQuery(query) {
  const [value, setValue] = useState(query);
  useEffect(() => {
    if (query === value) return;
    const timer = setTimeout(() => setValue(query), 250);
    return () => clearTimeout(timer);
  }, [query, value]);
  return value;
}
