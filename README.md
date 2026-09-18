# Bank Management System — Spring Webflux, Microservices, GraphQL, gRPC, Kafka (Work-in-progress)

## Tools & Technology
- Java 23, Spring Boot 3.5 (Spring WebFlux — reactive, non-blocking)
- Spring Data R2DBC + PostgreSQL (isolated database per service)
- GraphQL via Netflix DGS (auth-service)
- gRPC + Protocol Buffers (internal service-to-service calls)
- Lombok, ModelMapper, Spring Security Crypto
- Maven
- React + TypeScript + Vite + Tailwind CSS (frontend)
- Apache Kafka (planned — Saga/Outbox pattern for transfers)
- Kong API Gateway (planned)
- Docker Compose (planned — local orchestration)

## Completed Features
- User registration (`auth-service`)
- Identity verification via account number lookup (`auth-service` → `account-service`)
- Identity match on date of birth and mobile number (`auth-service` → `customer-service`)

<img src="UI-image/Bank UI 1.png">
<img src="UI-image/Bank UI 2.png">
<img src="UI-image/Bank UI 3.png">
