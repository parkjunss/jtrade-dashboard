import { useState } from 'react';

export function useSelection(initialValue) {
  const [value, setValue] = useState(initialValue);

  return {
    isSelected: (candidate) => value === candidate,
    select: setValue,
    value,
  };
}
