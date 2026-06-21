import React from "react";
import { SelectNative } from "~/components/ui/select-native";
import type { CurrencySelectProps } from "~/types/components";

export function CurrencySelect({ options, ...props }: CurrencySelectProps) {
  return (
    <SelectNative {...props}>
      {options.map(code => {
        let label = code;
        try {
          const name = new Intl.DisplayNames(['es-ES'], { type: 'currency' }).of(code);
          if (name) label = `${code} - ${name.charAt(0).toUpperCase() + name.slice(1)}`;
        } catch (e) {
          // Fallback si el navegador no lo soporta
        }
        return (
          <option key={code} value={code}>
            {label}
          </option>
        );
      })}
    </SelectNative>
  );
}