import { Icon } from "@iconify/react";
import { useTheme } from "~/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // Evitar renderizar el icono incorrecto durante la hidratación del servidor
  if (!theme) return <div className="size-9" />; // placeholder del mismo tamaño

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
      title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
    >
      <Icon icon={theme === "light" ? "ph:moon-duotone" : "ph:sun-duotone"} className="size-5" />
    </button>
  );
}