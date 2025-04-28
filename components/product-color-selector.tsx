'use client';

import { useState } from 'react';

interface ProductColorSelectorProps {
  colors: string[];
  selectedColor?: string;
  onSelectColor?: (color: string) => void;
}

export default function ProductColorSelector({
  colors,
  selectedColor,
  onSelectColor,
}: ProductColorSelectorProps) {
  const [internalSelectedColor, setInternalSelectedColor] = useState<string>(
    selectedColor || (colors.length > 0 ? colors[0] : '')
  );

  const handleColorSelect = (color: string) => {
    setInternalSelectedColor(color);
    if (onSelectColor) {
      onSelectColor(color);
    }
  };

  // Use either the controlled (from props) or uncontrolled (internal) state
  const currentSelectedColor = selectedColor || internalSelectedColor;

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-10 h-10 rounded-full border-2 ${
            currentSelectedColor === color
              ? 'border-indigo-600 ring-2 ring-indigo-200'
              : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          style={{ backgroundColor: color }}
          onClick={() => handleColorSelect(color)}
          aria-label={`Select ${color} color`}
          title={color}
        />
      ))}
    </div>
  );
}
