'use client';

import { useState } from 'react';
import {
  getCSSColor,
  getContrastingTextColor,
  getColorDisplayName,
  isPatternColor,
} from '@/lib/color-utils';

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
      {colors.map((color) => {
        const cssColor = getCSSColor(color);
        const displayName = getColorDisplayName(color);
        const textColor = getContrastingTextColor(color);
        const hasPattern = isPatternColor(color);

        return (
          <button
            key={color}
            className={`relative w-10 h-10 rounded-full border-2 overflow-hidden transition-all duration-200 ${
              currentSelectedColor === color
                ? 'border-indigo-600 ring-2 ring-indigo-200 scale-110'
                : 'border-gray-300 hover:border-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            style={{ backgroundColor: cssColor }}
            onClick={() => handleColorSelect(color)}
            aria-label={`Select ${displayName} color`}
            title={displayName}
          >
            {/* Pattern indicator for special colors like Tigers */}
            {hasPattern && (
              <div className="absolute inset-0 opacity-30">
                <div
                  className="w-full h-full"
                  style={{
                    background: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 2px,
                      ${textColor} 2px,
                      ${textColor} 3px
                    )`,
                  }}
                />
              </div>
            )}

            {/* Color name overlay for better identification */}
            {color.length <= 6 && (
              <span
                className="absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none"
                style={{
                  color: textColor,
                  textShadow: '0 0 2px rgba(0,0,0,0.5)',
                }}
              >
                {color.substring(0, 3).toUpperCase()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
