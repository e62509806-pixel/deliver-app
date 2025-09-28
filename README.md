# Deliver App - Gestión de Viajes y Clientes

Una aplicación web desarrollada con Angular 20, Bootstrap 5 y Supabase para gestionar viajes y clientes de manera eficiente.

## 🚀 Características

- **Gestión de Viajes**: Crear, editar, eliminar y visualizar viajes
- **Gestión de Clientes**: Agregar clientes a cada viaje con información detallada
- **Estado de Entrega**: Marcar paquetes como entregados o pendientes
- **Estadísticas**: Dashboard con métricas de clientes y paquetes
- **Interfaz Responsiva**: Diseño moderno con Bootstrap 5
- **Base de Datos**: Integración completa con Supabase

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Angular 20.1.0
- **UI Framework**: Bootstrap 5.3.3
- **Iconos**: Font Awesome 6.4.0
- **Backend**: Supabase
- **Base de Datos**: PostgreSQL (Supabase)
- **TypeScript**: 5.8.2

## 📋 Estructura de la Base de Datos

### Tabla `viajes`

```sql
CREATE TABLE viajes (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT
);
```

### Tabla `clientes`

```sql
CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  identity_card INTEGER, -- opcional
  destination TEXT NOT NULL,
  packages INTEGER NOT NULL,
  family_name TEXT, -- opcional
  phone TEXT, -- opcional
  familiar TEXT, -- opcional
  description TEXT, -- opcional
  delivered BOOLEAN DEFAULT FALSE,
  viaje_id BIGINT NOT NULL,
  CONSTRAINT fk_viaje FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE
);
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd deliver-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar las consultas SQL para crear las tablas
3. **Si ya tienes datos existentes**, ejecutar el script `database_update.sql` para agregar los nuevos campos
4. Obtener la URL y API Key de tu proyecto
5. Actualizar `src/app/environment/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: "TU_SUPABASE_URL",
  supabaseKey: "TU_SUPABASE_ANON_KEY",
};
```

### 4. Ejecutar la aplicación

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## 📱 Funcionalidades

### Gestión de Viajes

- ✅ Crear nuevos viajes con fecha y descripción
- ✅ Editar viajes existentes
- ✅ Eliminar viajes (elimina también todos los clientes asociados)
- ✅ Visualizar lista de viajes ordenados por fecha

### Gestión de Clientes

- ✅ Agregar clientes a un viaje específico
- ✅ Editar información de clientes
- ✅ Eliminar clientes
- ✅ Marcar/desmarcar paquetes como entregados
- ✅ Visualizar estadísticas del viaje

### Características Adicionales

- 📊 Dashboard con métricas en tiempo real
- 🔍 Búsqueda y filtrado
- 📱 Diseño responsive para móviles
- ⚡ Carga rápida con lazy loading
- 🎨 Interfaz moderna y intuitiva

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── viajes/
│   │   │   ├── viajes-list/     # Lista de viajes
│   │   │   └── viaje-form/      # Formulario de viajes
│   │   └── clientes/
│   │       ├── clientes-list/   # Lista de clientes
│   │       └── cliente-form/    # Formulario de clientes
│   ├── models/
│   │   ├── viaje.model.ts       # Interfaces de Viaje
│   │   └── cliente.model.ts     # Interfaces de Cliente
│   ├── services/
│   │   ├── supabase.service.ts  # Servicio de Supabase
│   │   ├── viajes.service.ts    # Servicio de Viajes
│   │   └── clientes.service.ts  # Servicio de Clientes
│   ├── environment/
│   │   └── environment.ts        # Configuración de Supabase
│   └── app.routes.ts            # Configuración de rutas
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm start                    # Servidor de desarrollo
npm run build               # Build para producción
npm run watch               # Build con watch mode

# Testing
npm test                    # Ejecutar tests
```

## 📝 Uso de la Aplicación

1. **Inicio**: La aplicación inicia mostrando la lista de viajes
2. **Crear Viaje**: Haz clic en "Nuevo Viaje" para crear un viaje
3. **Gestionar Clientes**: Desde un viaje, haz clic en "Clientes" para ver/agregar clientes
4. **Marcar Entregas**: Usa los botones de estado para marcar paquetes como entregados
5. **Estadísticas**: Ve métricas en tiempo real en el dashboard de clientes

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de [Angular](https://angular.dev)
2. Consulta la documentación de [Supabase](https://supabase.com/docs)
3. Abre un issue en este repositorio

---

**Desarrollado con ❤️ usando Angular 20 + Bootstrap + Supabase**
