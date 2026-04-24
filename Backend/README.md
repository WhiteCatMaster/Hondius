# Backend JuegoRol

## Observabilidad con Prometheus y Grafana

Este backend expone métricas de Spring Boot en:

- `GET /actuator/health`
- `GET /actuator/info`
- `GET /actuator/prometheus`

### Levantar todo con Docker

```bash
docker compose up --build
```

### Ejecutar en local sin MySQL

El perfil por defecto es `local`, así que `bootRun` usa H2 en memoria y no depende de MySQL externo.

```bash
./gradlew bootRun
```

### Ejecutar con Docker

El backend del `docker-compose.yml` usa el perfil `docker` y se conecta al servicio `base-de-datos`.

### URLs útiles

- Backend: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Dashboard principal: http://localhost:3000/d/juegorol-observability

### Endpoints para el frontend

- `POST /api/usuarios` o `POST /usuarios` → registrar usuario
- `GET /api/usuarios` o `GET /usuarios` → listar usuarios
- `POST /api/partida` o `POST /partida` → crear partida

`POST /partida` acepta tanto el JSON directo de `CrearPartidaDto` como el formato envuelto `{ "juego": { ... } }`.
`POST /usuarios` acepta un payload simple con:

- `googleId`
- `email`
- `nombre`
- `fotoUrl` opcional

### Credenciales de Grafana

Por defecto, Grafana usa:

- usuario: `admin`
- contraseña: `admin`

> La primera vez te pedirá cambiar la contraseña.

### Qué ya queda configurado

- `Prometheus` hace scrape del backend en `backend:8080/actuator/prometheus`
- `Grafana` arranca con datasource de `Prometheus` provisionado automáticamente
- `Grafana` carga el dashboard `JuegoRol - Observabilidad` automáticamente
- `MySQL` sigue disponible en `localhost:3307` desde tu máquina local
- En local, `bootRun` ya no depende de MySQL; usa H2

### Métricas de negocio añadidas

- `juegorol_usuarios_registrados_total`
- `juegorol_juegos_creados_total`
- `process_uptime_seconds` (métrica estándar de uptime)

### Si Grafana no abre en `localhost:3000`

```bash
docker compose down --remove-orphans
docker compose up --build -d
docker compose ps
docker compose logs grafana --tail 100
```

