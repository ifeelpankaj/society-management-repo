The Makefile now uses `MIGRATE_ENV` with a default of `development`:

```makefile
MIGRATE_ENV ?= development
```

Run migrations with:

```bash
make migrate-up
```

For production:

```bash
make migrate-up MIGRATE_ENV=production
```

## Next issue you may hit

After the env fix, `make migrate-up` connects correctly, but it fails with:

```
pq: type "global_role" already exists handling 01_users.sql
```

`make migrate-status` shows **all migrations as "no"**, while your database already has the schema (the app was running fine). The `schema_migrations` table is out of sync — sql-migrate thinks nothing has been applied.

**To apply only the new migrations (12 and 13):** mark 01–11 as already applied, then run migrate-up:

```sql
-- Run in psql against your dev DB
INSERT INTO schema_migrations (id, applied_at) VALUES
  ('01_users.sql', NOW()),
  ('02_user_verification.sql', NOW()),
  ('03_societies_and_society_members.sql', NOW()),
  ('04_flat_residents_claims.sql', NOW()),
  ('05_plan_and_subscriptions.sql', NOW()),
  ('06_subscription_resident_limits.sql', NOW()),
  ('07_visitor_settings.sql', NOW()),
  ('08_visitor_entries.sql', NOW()),
  ('09_device_tokens.sql', NOW()),
  ('10_visitor_entry_gate_fields.sql', NOW()),
  ('11_flat_member_invites.sql', NOW())
ON CONFLICT DO NOTHING;
```

Then:

```bash
make migrate-up
```

That should apply `12_visitor_production_hardening.sql` and `13_query_performance_indexes.sql`.

Also confirm `dbconfig.yml` exists (copy from `dbconfig.example.yml` if needed)