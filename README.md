# Support Desk - Support Ticket Management System

A full stack Java web application for logging, tracking and resolving support tickets, similar to the
workflow of an IT support or production support team.

Users can raise tickets, set priority, assign them, move them through a status workflow, discuss them
in comments, and see live counts on a dashboard.

## Features

- Create, view, edit and delete support tickets
- Priority levels: LOW, MEDIUM, HIGH, CRITICAL
- Status workflow: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED (resolution time is recorded automatically)
- Comment thread on every ticket (investigation notes, updates)
- Search by title or description, filter by status and priority
- Dashboard with ticket counts (total, open, in progress, resolved, closed, high/critical open)
- Input validation and clean JSON error responses (400 / 404)
- Sample data loaded on first start

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 3, Spring Web (REST), Spring Data JPA / Hibernate, Bean Validation |
| Database | H2 (default, in-memory) or MySQL |
| Frontend | HTML, CSS, JavaScript (fetch API), served by Spring Boot |
| Build / Test | Maven, JUnit 5, MockMvc |

## Project structure

```
support-desk
|-- pom.xml
|-- src/main/java/com/prafull/supportdesk
|   |-- SupportDeskApplication.java
|   |-- controller/   TicketController        (REST endpoints)
|   |-- service/      TicketService           (business logic)
|   |-- repository/   TicketRepository        (database access)
|   |-- model/        Ticket, Comment, Status, Priority   (JPA entities / enums)
|   |-- dto/          request and response objects
|   |-- exception/    GlobalExceptionHandler  (error responses)
|   `-- config/       DataSeeder              (sample data)
|-- src/main/resources
|   |-- application.properties                (H2, default)
|   |-- application-mysql.properties          (MySQL profile)
|   `-- static/       index.html, style.css, app.js   (frontend)
`-- src/test/java/...  TicketApiTest
```

## Run locally

Requirements: JDK 17+ and Maven.

```bash
git clone https://github.com/PrafullSapkal/support-desk.git
cd support-desk
mvn spring-boot:run
```

Open http://localhost:8080 in your browser.

H2 database console (default profile): http://localhost:8080/h2-console
(JDBC URL `jdbc:h2:mem:supportdesk`, user `sa`, empty password).

### Run with MySQL

1. Create the database:
   ```sql
   CREATE DATABASE supportdesk;
   ```
2. Start the app with the `mysql` profile (tables are created automatically):
   ```bash
   export DB_USERNAME=root
   export DB_PASSWORD=your_password
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

### Run the tests

```bash
mvn test
```

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List tickets. Optional query params: `status`, `priority`, `q` (search text) |
| GET | `/api/tickets/stats` | Dashboard counts |
| GET | `/api/tickets/{id}` | Get one ticket with its comments |
| POST | `/api/tickets` | Create a ticket |
| PUT | `/api/tickets/{id}` | Update ticket details |
| PATCH | `/api/tickets/{id}/status` | Change status, body: `{"status": "RESOLVED"}` |
| POST | `/api/tickets/{id}/comments` | Add a comment, body: `{"author": "...", "message": "..."}` |
| DELETE | `/api/tickets/{id}` | Delete a ticket |

Example:

```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"VPN not connecting","description":"Timeout after login","priority":"HIGH","category":"Network","reportedBy":"Amit"}'
```

## What I learned

- Building a layered Spring Boot application (controller, service, repository)
- Designing REST APIs with proper status codes and validation
- Modelling relationships (one ticket, many comments) with JPA
- Switching databases between H2 and MySQL using Spring profiles
- Writing API tests with MockMvc

## Future improvements

- User login and roles (agent / customer) with Spring Security
- Email notification when a ticket is assigned or resolved
- SLA timers and overdue ticket highlighting
- Docker setup and CI with GitHub Actions
