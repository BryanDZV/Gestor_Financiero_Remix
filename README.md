# Gestor Financiero

Aplicación web para la gestión de finanzas personales, desarrollada para ofrecer control sobre ingresos, gastos, presupuestos y planificación de metas financieras. 

## Características Principales

- Autenticación: Sistema de inicio de sesión gestionado a través de Supabase.
- Panel General: Vista resumida del estado financiero del usuario.
- Gestión de Cuentas: Registro y visualización del saldo en múltiples cuentas o billeteras.
- Transacciones: Ingreso y categorización de movimientos de dinero (ingresos y egresos).
- Presupuestos: Asignación de límites de gasto mensuales por categoría.
- Suscripciones: Seguimiento de servicios recurrentes y sus próximas fechas de cobro.
- Planificador de Deudas: Módulo para registrar deudas y organizar estrategias de pago.
- Multimoneda: Soporte para gestionar finanzas en diferentes divisas.

## Arquitectura y Buenas Prácticas

El proyecto está diseñado buscando la mantenibilidad y una clara separación de responsabilidades:

- **Arquitectura por Funcionalidades (Feature-Driven):** El código está organizado por dominios de negocio (ej. `accounts`, `transactions`, `budgets`) dentro de la carpeta `features`. Esto encapsula la lógica, vistas y componentes propios de cada módulo, facilitando el mantenimiento a largo plazo.
- **Renderizado del Lado del Servidor (SSR):** Se utilizan los *loaders* y *actions* de React Router 7 para obtener y mutar datos directamente desde el servidor. Esto mejora el rendimiento inicial y la seguridad de las transacciones.
- **Separación de Responsabilidades Frontend/Backend:** Se implementan archivos con el sufijo `.server.ts` para aislar la lógica de acceso a datos e integraciones con APIs, garantizando que el código sensible jamás se envíe al cliente.
- **Sistema de Componentes Reutilizables:** Se emplea `shadcn/ui` para disponer de componentes de UI accesibles (basados en Radix UI) y centralizados en `components/ui`, lo cual mantiene una línea gráfica unificada en toda la aplicación.
- **Tipado Estricto (End-to-End Type Safety):** Uso de TypeScript en toda la aplicación para tipar respuestas de base de datos, props de componentes y utilidades, previniendo errores durante el desarrollo.
- **Control de Versiones de Base de Datos:** Las modificaciones al esquema de PostgreSQL se gestionan a través de migraciones de Supabase (carpeta `supabase/migrations`), manteniendo un registro histórico de cambios en la base de datos como código.

## Tecnologías Utilizadas

- Frontend: React y React Router 7
- Lenguaje: TypeScript
- Estilos: Tailwind CSS y shadcn/ui
- Backend y Base de Datos: Supabase (PostgreSQL y Supabase Auth)
- Entorno de Desarrollo: Vite

## Instalación y Configuración Local

1. Clonar el repositorio en el equipo local.
2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Configurar las variables de entorno. Es necesario crear un archivo `.env` en la raíz del proyecto con las siguientes claves de Supabase:
   ```text
   SUPABASE_URL=url_del_proyecto
   SUPABASE_ANON_KEY=clave_anonima
   ```
4. Iniciar el entorno de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación se podrá visualizar en `http://localhost:5173`.

## Integración Continua y Despliegue (CI/CD)

El repositorio incluye configuración de GitHub Actions para automatizar procesos:
- Verificación de tipos y validación de compilación en cada Pull Request.
- Despliegue automático de entornos de prueba al actualizar la rama `develop`.
- Despliegue a producción mediante Vercel al actualizar la rama `main`.
