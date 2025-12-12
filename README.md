# customer_api_auth

Authentication and authorization service for the customer api

/\*\*

- Project Directory Structure (Entities)
-
- We follow a modular folder structure under `src/modules/`, where:
-
- - Each feature/module has its own directory (e.g., `users`, `common`, `axios`).
- - Common or shared entities are placed under `modules/common/entities/`.
- - Module-specific entities are stored inside their respective module folders:
-      src/
-        modules/
-          common/
-            entities/
-              base-audit.entity.ts     // Shared base entity for audit fields
-          users/
-            entities/
-              user.entity.ts           // User module-specific entity
-
- This structure ensures:
- - Clean modular architecture
- - Easy maintenance
- - Better scalability
- - Automatic scanning of all entities via the TypeORM config pattern:
-      entities: [__dirname + '/../modules/**/entities/**/*.entity{.ts,.js}']
  \*/

### Migrations

New to Migrations ? To know more click [here](https://orkhan.gitbook.io/typeorm/docs/migrations)

**Note:** Before running below migration scripts

In development environment : Make sure you are using local machine DB Credentials.

```bash
# Generate migrations
     npm run migration:generate -- ./src/modules/database/migrations/{Give Some Name to Your Migration or use timestamp}

# Run migrations
     npm run migration:run

# Revert migrations
    npm run migration:revert
```
