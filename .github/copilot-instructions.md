# Sistema de Diseño del Proyecto

Estas reglas aplican a todo el workspace y deben respetarse en cualquier archivo nuevo o modificado.

## Tipografía

- Usa exclusivamente Inter, ya configurada en el proyecto.
- Usa una jerarquía tipográfica fija:
  - `text-3xl` para títulos principales.
  - `text-xl` para subtítulos.
  - `text-base` para cuerpo normal.
  - `text-sm` o `text-xs` para detalles.
- Usa `font-bold` o `font-semibold` solo para títulos o datos críticos.
- Mantén el resto en `font-normal` o `font-medium`.

## Espaciado y layout

- Usa estrictamente la escala de espaciado de Tailwind con múltiplos de 4.
- Prefiere patrones consistentes como `gap-4`, `p-6`, `space-y-4`, `mb-8`.
- Mantén el mismo padding interior en todas las tarjetas basadas en shadcn.
- No comprimas unas cards más que otras sin una razón funcional clara.

## Componentes

- No construyas botones, inputs, tablas o tarjetas desde cero con HTML puro y Tailwind si existe un componente shadcn/ui equivalente.
- Reutiliza siempre componentes de `app/components/ui` como `Button`, `Card`, `Input`, `Select`, `Textarea`, `Badge`, etc. cuando estén disponibles.
- Si falta un componente shadcn necesario, crea el primitive faltante en `app/components/ui` antes de volver a usar controles nativos.
- No dupliques patrones visuales entre `app/routes/` y `app/features/`; la UI principal debe vivir en `app/features/**`.

## Datos numéricos y financieros

- Para importes, fechas y números usa siempre `tabular-nums`.
- Alinea montos y fechas para que las columnas queden visualmente consistentes.
- Los ingresos y estados de éxito usan `text-emerald-600`.
- Los gastos y errores usan `text-red-600`.

## Colores y semántica

- Usa variables y tokens semánticos de shadcn como `bg-background`, `text-foreground`, `text-primary` y `text-muted-foreground`.
- No escribas colores arbitrarios ni hexadecimales embebidos en el código.
- Evita colores quemados fuera de los tokens permitidos.
- Reserva los colores de estado para su significado funcional.

## Formulario y estados

- Los campos deben tener una altura, borde y radio coherentes con shadcn.
- Usa estados de foco y hover consistentes con el sistema del proyecto.
- No introduzcas variantes visuales únicas para un solo componente si rompen la consistencia global.

## Vistas y navegación

- Mantén `app/routes/*.tsx` delgadas: loader/action en la ruta y UI principal en `app/features/**`.
- Respeta la navegación responsive del dashboard: sidebar en `md+` y navegación superior en mobile.
- Prioriza consistencia visual por encima de microvariaciones locales.

## Criterio general

- Si una decisión de UI entra en conflicto con estas reglas, estas reglas prevalecen.
- Antes de introducir un nuevo patrón visual, reutiliza el existente o extiende el sistema de diseño del proyecto.