-- name: CreateUser :one
INSERT INTO users (
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    timezone,
    language,
    metadata
)
VALUES (
    sqlc.narg('first_name'),
    sqlc.narg('last_name'),
    sqlc.arg('full_name'),
    sqlc.narg('email'),
    sqlc.narg('phone_number'),
    sqlc.narg('password_hash'),
    sqlc.arg('auth_provider')::auth_provider,
    sqlc.arg('global_role')::global_role,
    sqlc.arg('email_verified'),
    sqlc.arg('phone_verified'),
    sqlc.arg('is_active'),
    sqlc.arg('is_blocked'),
    sqlc.arg('timezone'),
    sqlc.arg('language'),
    sqlc.arg('metadata')
)
RETURNING
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at;

-- name: GetUserByEmail :one
SELECT
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at
FROM users
WHERE LOWER(email) = LOWER($1)
  AND deleted_at IS NULL
LIMIT 1;

-- name: GetUserByPhoneNumber :one
SELECT
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at
FROM users
WHERE phone_number = $1
  AND deleted_at IS NULL
LIMIT 1;

-- name: EmailExists :one
SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE LOWER(email) = LOWER($1)
      AND deleted_at IS NULL
);

-- name: PhoneExists :one
SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE phone_number = $1
      AND deleted_at IS NULL
);

-- name: UpdateUserPasswordHash :exec
UPDATE users
SET
    password_hash = $2,
    password_changed_at = NOW(),
    updated_at = NOW()
WHERE id = $1
  AND deleted_at IS NULL;

-- name: UpdateUserLastLogin :exec
UPDATE users
SET
    last_login_at = NOW(),
    updated_at = NOW()
WHERE id = $1
  AND deleted_at IS NULL;
