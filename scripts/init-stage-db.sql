-- Step 1a: Run in pgAdmin Query Tool on database "postgres" (connected as postgres)

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'testing_user') THEN
        CREATE ROLE testing_user WITH LOGIN PASSWORD 'test_user@2026';
    ELSE
        ALTER ROLE testing_user WITH LOGIN PASSWORD 'test_user@2026';
    END IF;
END
$$;

-- Step 1b: Run this NEXT, separately (not inside DO block).
-- In pgAdmin: enable Auto-commit (toolbar icon) before running this line.
-- If stage_db already exists, you can ignore the "already exists" error.

CREATE DATABASE stage_db OWNER testing_user;

GRANT ALL PRIVILEGES ON DATABASE stage_db TO testing_user;

-- Step 2: Open Query Tool on database "stage_db" and run:

GRANT ALL ON SCHEMA public TO testing_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO testing_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO testing_user;
