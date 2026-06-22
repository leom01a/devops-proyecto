# Innovatech Inventory Desk

Proyecto desarrollado para la Evaluación Parcial 2 de **ISY1101 Introducción a Herramientas DevOps**.

La solución implementa una arquitectura de 3 capas orientada a prácticas DevOps, usando:

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de datos**: MySQL 8.1
- **Contenedorización**: Docker
- **Orquestación local**: Docker Compose
- **Registro de imágenes**: Docker Hub
- **CI/CD**: GitHub Actions
- **Despliegue**: AWS EC2

---

## Objetivo del proyecto

Contenerizar una aplicación compuesta por frontend, backend y base de datos, automatizando su construcción, publicación y despliegue, aplicando buenas prácticas DevOps en un entorno AWS.

---

## Arquitectura implementada

La arquitectura lógica del proyecto es de 3 capas:

- **Frontend público**
  - Aplicación web accesible desde navegador
  - Desplegada en una instancia EC2 pública
- **Backend privado**
  - API REST con lógica de negocio
  - Desplegada en una instancia EC2 privada
- **Base de datos privada**
  - MySQL con persistencia mediante volúmenes Docker
  - Desplegada en una instancia EC2 privada

### Flujo de comunicación

```text
Usuario
  ↓
Frontend público (EC2 pública)
  ↓
Backend privado (EC2 privada)
  ↓
MySQL privado (EC2 privada)

Además, para el acceso desde el navegador, el frontend utiliza Nginx como reverse proxy para redirigir las solicitudes /api hacia el backend privado, manteniendo la API fuera de exposición directa a Internet.

Estructura del proyecto
.
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── bd/
│   ├── schema.sql
│   └── seed.sql
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docker-compose.yml
├── .gitignore
└── README.md
Tecnologías utilizadas
React
Vite
Node.js
Express
MySQL 8.1
Docker
Docker Compose
Docker Hub
GitHub Actions
AWS EC2
Amazon Linux 2023
Nginx
Contenedorización
Dockerfile del frontend

El frontend fue dockerizado usando una estrategia de build para generar la aplicación y servirla con Nginx.

Decisiones técnicas:
build de frontend con Node
publicación con Nginx
soporte de reverse proxy hacia backend privado
imagen liviana para despliegue
Dockerfile del backend

El backend fue dockerizado con Node.js, ejecutando la API REST en el puerto 3001.

Decisiones técnicas:
separación de dependencias e imagen final
uso de NODE_ENV=production
exposición del puerto 3001
despliegue con variables de entorno para conexión a base de datos
Docker Compose

Para pruebas locales se utilizó docker-compose.yml, levantando los 3 servicios con un solo comando:

frontend
backend
db
Ejecución local
docker compose up -d --build
Servicios expuestos localmente
Frontend: http://localhost:8080
Backend: http://localhost:3001
MySQL: localhost:3306
Persistencia de datos

La persistencia se implementó mediante un named volume de Docker:

volumes:
  mysql_data:

Este volumen permite que la información de MySQL no se pierda al reiniciar el contenedor.

Validación realizada
reinicio del contenedor de base de datos
comprobación de continuidad de los datos
volumen visible mediante docker volume ls
Variables de entorno
Backend

Variables principales utilizadas:

PORT=3001
DB_HOST=db
DB_PORT=3306
DB_NAME=innovatech_ops
DB_USER=app_user
DB_PASSWORD=app_secret
CORS_ORIGIN=http://localhost:8080
Frontend

Variable usada en build:

VITE_API_URL

En despliegue AWS el frontend utiliza rutas relativas /api y Nginx se encarga del proxy al backend privado.

Base de datos

La base de datos utiliza los scripts:

bd/schema.sql
bd/seed.sql

Estos permiten:

crear la estructura de tablas
cargar datos de ejemplo
validar funcionamiento de inventario y tickets

Tablas principales:

inventory_items
support_tickets
Docker Hub

Las imágenes fueron publicadas en Docker Hub usando versionado simple.

Repositorios utilizados
bpy4shn/frontend:latest
bpy4shn/backend:latest
CI/CD con GitHub Actions

Se configuró un pipeline en:

.github/workflows/deploy.yml
Flujo automatizado

Cada push a la rama deploy ejecuta:

checkout del código
login en Docker Hub
build de imagen frontend
push de imagen frontend
build de imagen backend
push de imagen backend
conexión por SSH a AWS EC2
despliegue automático del frontend
despliegue automático del backend
Rama de activación
deploy
Secrets utilizados
DOCKER_USERNAME
DOCKER_TOKEN
EC2_HOST
EC2_USERNAME
EC2_SSH_KEY
Despliegue en AWS

La solución fue desplegada en AWS usando 3 instancias EC2:

Frontend en subred pública
Backend en subred privada
Database en subred privada
Componentes de red utilizados
VPC
Subred pública
2 subredes privadas
Internet Gateway
NAT Gateway
Route Tables
Security Groups
Security Groups
SG-Frontend
HTTP 80 desde Internet
SSH 22 desde IP autorizada
SG-Backend
TCP 3001 solo desde Frontend
SSH 22 desde Frontend
SG-DB
MySQL 3306 solo desde Backend
SSH 22 desde Backend
Validaciones realizadas

Durante el desarrollo y despliegue se validó:

Local
build de imágenes
ejecución de contenedores
funcionamiento completo con Docker Compose
persistencia mediante volúmenes
Docker Hub
publicación de imágenes frontend y backend
versionado de imágenes
GitHub Actions
ejecución exitosa del workflow
build y push automáticos
deploy automático a EC2
AWS
Docker instalado en las 3 instancias
MySQL levantado en Database
Backend levantado en Backend
Frontend levantado en Frontend
conectividad interna validada
Pruebas funcionales
curl http://10.0.2.128:3001/health
curl http://localhost/api/dashboard
curl http://localhost/api/items
curl http://localhost/api/tickets
Resultado

La aplicación quedó accesible desde navegador mediante la IP pública de la instancia Frontend.

Evidencias generadas

Durante la implementación se recopilaron capturas de:

contenedores en ejecución
volúmenes Docker
persistencia
Docker Hub
GitHub
workflow de GitHub Actions
infraestructura AWS
despliegue en EC2
endpoints funcionando
aplicación publicada en navegador
Justificación técnica
¿Por qué Docker?

Porque permite empaquetar la aplicación y sus dependencias de forma consistente, evitando diferencias entre entornos.

¿Por qué Docker Compose?

Porque simplifica la ejecución del stack completo en entorno local con un solo comando.

¿Por qué volúmenes?

Porque permiten mantener la persistencia de datos al reiniciar contenedores.

¿Por qué Docker Hub?

Porque facilita el almacenamiento, versionado y distribución de imágenes de forma simple.

¿Por qué GitHub Actions?

Porque automatiza build, publicación y despliegue, reduciendo errores manuales y acelerando entregas.

¿Por qué frontend público y backend privado?

Porque mejora la seguridad, reduciendo la exposición de la API y la base de datos.

¿Por qué Nginx reverse proxy?

Porque permite exponer solo el frontend a Internet y reenviar las solicitudes API al backend privado.

Comandos útiles
Levantar localmente
docker compose up -d --build
Ver contenedores
docker ps
Ver volúmenes
docker volume ls
Ver logs backend
docker logs innovatech-backend
Ver logs db
docker logs innovatech-db
Estado del proyecto
Contenedorización: OK
Docker Compose: OK
Persistencia: OK
Docker Hub: OK
GitHub Actions: OK
AWS EC2: OK
Frontend público: OK
Backend privado: OK
Base de datos privada: OK
Integración Front → Back → DB: OK
Deploy automático: OK
Autor

Proyecto realizado por:

Leonardo Méndez y Diego Araya

Para la asignatura:

ISY1101 Introducción a Herramientas DevOps

# Innovatech Inventory Desk - DevOps AWS ECS

Proyecto desarrollado para la Evaluación Parcial 3 de **ISY1101 Introducción a Herramientas DevOps**.

La solución implementa una arquitectura basada en contenedores, automatización CI/CD y orquestación utilizando servicios nativos de AWS.

## Tecnologías utilizadas

* React + Vite
* Node.js + Express
* MySQL 8.1
* Docker
* GitHub Actions
* Amazon ECS
* Amazon ECR
* Application Load Balancer
* Amazon CloudWatch
* AWS Academy

---

# Arquitectura Final EP3

Durante la EP3 la arquitectura evolucionó desde un despliegue basado en instancias EC2 hacia una solución completamente orquestada utilizando Amazon ECS.

## Componentes principales

* GitHub
* GitHub Actions
* Amazon ECR
* Amazon ECS
* Application Load Balancer
* CloudWatch
* Frontend Service
* Backend Service
* Base de Datos MySQL

## Flujo general

Usuario
↓
Application Load Balancer
↓
Frontend ECS Service
↓
Backend ECS Service
↓
Base de Datos MySQL

GitHub
↓
GitHub Actions
↓
Amazon ECR
↓
Amazon ECS

---

# Amazon ECS

Se utilizó Amazon ECS como plataforma de orquestación para ejecutar y administrar los contenedores de la aplicación.

## Servicios desplegados

* innovatech-frontend-service
* innovatech-backend-service

## Beneficios obtenidos

* Recuperación automática de tareas
* Administración centralizada
* Despliegue continuo
* Escalabilidad
* Alta disponibilidad

---

# Amazon ECR

Las imágenes Docker son almacenadas en Amazon Elastic Container Registry (ECR).

## Repositorios utilizados

* innovatech-frontend
* innovatech-backend

GitHub Actions publica automáticamente nuevas versiones de las imágenes cada vez que se realiza un despliegue.

---

# CI/CD con GitHub Actions

Se implementó un pipeline completamente automatizado.

## Flujo implementado

1. Push a rama deploy
2. Build Frontend
3. Push Frontend a ECR
4. Build Backend
5. Push Backend a ECR
6. Actualización automática de ECS
7. Nuevo despliegue de servicios
8. Aplicación disponible automáticamente

## Beneficios

* Automatización completa
* Menor riesgo de errores manuales
* Entregas continuas
* Actualizaciones rápidas

---

# Application Load Balancer

Se configuró un Application Load Balancer para distribuir tráfico hacia los servicios desplegados en ECS.

## Funciones

* Exposición pública del Frontend
* Health Checks automáticos
* Balanceo de carga
* Integración con ECS

## Target Groups

* innovatech-frontend-tg
* innovatech-backend-tg

---

# Amazon CloudWatch

CloudWatch fue utilizado para monitoreo y análisis del entorno.

## Funcionalidades utilizadas

* Visualización de logs
* Seguimiento de errores
* Validación de despliegues
* Monitoreo de tareas ECS

## Log Groups

* /ecs/innovatech-frontend-task
* /ecs/innovatech-backend-task

---

# Autoscaling

Amazon ECS permite implementar escalamiento automático utilizando métricas de CPU y memoria.

Durante esta evaluación se dejó preparada la arquitectura para futuras estrategias de escalamiento.

## Beneficios

* Mejor rendimiento
* Mayor disponibilidad
* Optimización de recursos
* Adaptación a aumentos de carga

---

# Resultados Obtenidos

Se logró:

* Orquestar contenedores mediante Amazon ECS.
* Automatizar despliegues utilizando GitHub Actions.
* Publicar imágenes Docker en Amazon ECR.
* Implementar balanceo mediante Application Load Balancer.
* Monitorear servicios mediante CloudWatch.
* Mantener comunicación Frontend → Backend → Base de Datos.
* Garantizar recuperación automática de servicios.

---

# Estado del Proyecto

Docker: OK

Amazon ECR: OK

Amazon ECS: OK

Application Load Balancer: OK

GitHub Actions: OK

CloudWatch: OK

Frontend Público: OK

Backend Operativo: OK

Pipeline CI/CD: OK

Orquestación: OK

Integración Front → Back → DB: OK

Despliegue Automático: OK

Monitoreo: OK

---

# Autores

Leonardo Méndez

Diego Araya

ISY1101 – Introducción a Herramientas DevOps
