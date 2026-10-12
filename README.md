
## Bank Management System — Spring Webflux, Microservices, GraphQL, gRPC, Kafka 


### A Bank Management System built on Spring Webflux, Microservices, GraphQL, gRPC, Kafka (Work-in-progress)


<div align="center">
  <h3>Part 1</h3>
  <a href="https://drive.google.com/drive/folders/1PUa2bbuZyb0PKn6EBXFBtXdK4DFlnmks?dmr=1&ec=wgc-drive-%5Bmodule%5D-goto/part1.mp4">
    <img src="records/backend_team.png" width="700" height="400" alt="Part 1 - backend_team demo">
  </a>
</div>

<div align="center">
  <h3>Part 2</h3>
  <a href="https://github.com/user-attachments/assets/08cb881b-fd49-4f82-83b8-f155b535508c">
    <img src="records/customer.png" width="700" height="400" alt="Part 2 - Customer demo">
  </a>
</div>


Tools & Technology:
 - Java 23, Spring Boot 3.5 (Spring WebFlux — reactive, non-blocking)
 - Spring Data R2DBC + PostgreSQL (isolated database per service)
 - GraphQL via Netflix DGS (auth-service)
 - gRPC + Protocol Buffers (internal service-to-service calls)
 - Apache Kafka (planned — Saga/Outbox pattern for transfers)
 - Kong API Gateway (planned)
 - Docker Compose (planned — local orchestration)
- React + TypeScript + Tailwind CSS (frontend)




Completed Features:
 - User registration (auth-service)
 - Identity verification via account number lookup (auth-service → account-service)
 - Identity match on date of birth and mobile number (auth-service → customer-service)
 - OTP generation, delivery (via SMS), and verification for identity confirmation (auth-service ↔ notification-service, Redis + Kafka outbox)
 - Credential setup & account activation — creates username/password linked to verified customer, with welcome notification (auth-service → notification-service)
 - Role-based menu access control system, enabling dynamic role and permission management

