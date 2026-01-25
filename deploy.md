# 🚀 Deployment Guide: Docker + SSH + Standard (2025)

Esta guía documenta la arquitectura de despliegue actual del proyecto `alpadev_ai_monorepo`, basada en **Docker**, **GitHub Actions**, y **Composition Inline**.

---

## 🏗️ Arquitectura

El sistema utiliza un enfoque "Golden Standard" donde la imagen de Docker se construye en el CI (GitHub Actions) y se despliega en el VPS mediante SSH.

*   **Local:** Docker Compose para la base de datos + `pnpm dev` para la aplicación.
*   **Producción:** GitHub Container Registry (GHCR) -> VPS pull -> Docker Compose.

---

## 💻 1. Entorno de Desarrollo (Local)

Tienes dos formas de correr el proyecto localmente:

### A. Modo Desarrollo (Recomendado para programar)
Usas Docker solo para la base de datos y corres la app con Node.js para tener **Hot Reload**.

1.  **Levantar solo la DB:**
    ```bash
    docker-compose up -d mongo
    ```
2.  **Correr la App:**
    ```bash
    pnpm dev
    ```

### B. Modo Producción Local (Para probar contenedores)
Corres **toda** la aplicación en Docker, idéntico a producción.
*Nota: No tiene Hot Reload. Tienes que reconstruir si cambias código.*

1.  **Levantar todo (App + DB):**
    ```bash
    docker-compose up --build
    ```
    *   La App estará en: `http://localhost:3000`
    *   La DB estará en: `localhost:27017`
    *   El contenedor `frontend` se conecta automáticamente al contenedor `mongo`.

---

## 🌍 2. Entorno de Producción (VPS)

El despliegue es **100% automatizado** vía GitHub Actions. No necesitas tocar el servidor manualmente para desplegar nueva versiones.

### Flujo de Despliegue:
1.  Haces **Push** a la rama `main`.
2.  **GitHub Action** (`deploy.yml`):
    *   Construye la imagen Docker optimizada (usando `turbo prune` y `standalone`).
    *   Sube la imagen a `ghcr.io` (GitHub Container Registry).
    *   Se conecta a tu VPS por SSH.
    *   Crea dinámicamente un archivo `.env` con tus secretos.
    *   Crea dinámicamente un `docker-compose.yml` que usa la nueva imagen.
    *   Ejecuta `docker-compose up -d` para reemplazar el contenedor viejo sin downtime perceptible.

### Configuración Requerida (GitHub Secrets):
Para que esto funcione, debes configurar los siguientes secretos en tu repositorio GitHub:

*   **Infraestructura VPS:**
    *   `VPS_HOST`: Dirección IP de tu servidor.
    *   `VPS_USER`: Usuario SSH (ej. `root` o `alpadev`).
    *   `VPS_SSH_KEY`: Tu clave privada SSH (la que corresponde a la clave pública en `~/.ssh/authorized_keys` del servidor).
    *   `VPS_PORT`: Puerto SSH (usualmente 22).

*   **Base de Datos & App:**
    *   `DATABASE_URL`: String de conexión REAL a tu MongoDB de producción (Atlas o VPS).
    *   `NEXTAUTH_SECRET`: String aleatorio para firmar sesiones.
    *   `NEXT_PUBLIC_APP_URL`: URL final de tu sitio (ej. `https://adminia.online`).

### Comandos Útiles en el VPS:
Si necesitas entrar al servidor para depurar:

```bash
# Ver logs del contenedor
docker logs -f alpadev-ai-frontend

# Ver estado de los contenedores
docker ps

# Reiniciar manualmente (si fuera necesario)
cd ~/alpadev-ai-config
docker-compose restart
```

---

## 🛠️ Detalles Técnicos

### Dockerfile (Optimizado)
El `Dockerfile` en la raíz utiliza **Multi-stage builds** y **Turbo Prune**:
1.  **Pruner:** Aísla solo los archivos necesarios para `next-app-template`.
2.  **Builder:** Instala dependencias y compila. Usa un script `postbuild` para copiar los binarios de Prisma.
3.  **Runner:** Imagen Alpine mínima que ejecuta `server.js` en modo standalone.

### Standalone Mode
Next.js está configurado con `output: "standalone"`. Esto genera una carpeta `/apps/frontend/.next/standalone` que contiene todo lo necesario (incluso `node_modules` mínimos) para correr la app sin instalar nada más.