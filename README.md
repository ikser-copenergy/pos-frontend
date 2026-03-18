# POS Frontend

App React + Tailwind con CRUD de inventario. Estructura modular preparada para separar en web desktop y mobile.

## Estructura

```
src/
├── api/              # Cliente HTTP base (compartido web/mobile)
├── core/             # Config, constantes
├── features/         # Módulos por feature
│   └── inventory/
│       ├── api/      # Llamadas API del feature
│       ├── hooks/    # Lógica de negocio (compartida)
│       ├── types/    # Tipos TypeScript
│       └── ui/       # Componentes web (futuro: mobile/ para RN)
├── app/              # Shell, rutas
└── shared/           # Utilidades compartidas
```

- **api/** y **core/**: compartidos entre web y mobile
- **features/*/api**, **hooks**, **types**: lógica reutilizable
- **features/*/ui**: componentes web; en el futuro `mobile/` para React Native

## Scripts

- `npm run dev` - Desarrollo
- `npm run build` - Build producción
- `npm run preview` - Preview del build

## Variables de entorno

Copia `.env.example` a `.env` y ajusta `VITE_API_URL` si el backend no está en `localhost:3000`.
