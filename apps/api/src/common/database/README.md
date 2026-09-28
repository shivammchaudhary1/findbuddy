# Database conventions

- Create one Mongoose model per repository and reuse the process-wide connection from `config/database.ts`. Repositories must never open connections per request.
- Apply `baseSchemaOptions` to every persisted domain schema. It enables timestamps, rejects unknown fields, and omits Mongoose's version key.
- Declare query-supporting and uniqueness indexes beside each schema. Production disables automatic index creation, so ship index changes through a registered migration.
- Represent lifecycle removal with the domain's locked status value rather than deleting records. Repository read methods must apply `visibleStatusFilter` unless an administrative workflow explicitly needs hidden records.
- Accept `RepositoryWriteOptions` on writes that can participate in a transaction, and pass its session to every operation in that transaction.
- Map documents to explicit domain or public DTOs before returning them from a repository boundary. Never expose Mongoose documents or provider-only fields from an API.
- Integration tests may connect only through `TEST_MONGODB_URI`; its database name must contain a distinct `test` segment. Fixtures should use the deterministic builders under `tests/helpers`.
