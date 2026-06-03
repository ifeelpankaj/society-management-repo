-- name: CreateSociety :one
INSERT INTO societies (
    name, society_code, email, phone_number,
    address_line1, address_line2, landmark, city, state, pincode, country,
    total_flats, total_blocks, status, created_by, metadata
) VALUES (
    $1, $2, $3, $4,
    $5, $6, $7, $8, $9, $10, COALESCE(sqlc.narg('country'), 'India'),
    $11, $12, 'pending', $13, COALESCE(sqlc.narg('metadata'), '{}'::jsonb)
)
RETURNING *;

-- name: GetSociety :one
SELECT *
FROM societies
WHERE (sqlc.narg('id')::bigint IS NULL OR id = sqlc.narg('id')::bigint)
  AND (sqlc.narg('code')::text IS NULL OR society_code = sqlc.narg('code')::text)
  AND (sqlc.narg('created_by')::bigint IS NULL OR created_by = sqlc.narg('created_by')::bigint)
  AND (sqlc.narg('status')::society_status IS NULL OR status = sqlc.narg('status')::society_status)
  AND (sqlc.arg('include_deleted')::bool OR deleted_at IS NULL)
ORDER BY id DESC
LIMIT 1;

-- name: ListSocieties :many
SELECT *
FROM societies
WHERE (sqlc.narg('id')::bigint IS NULL OR id = sqlc.narg('id')::bigint)
  AND (sqlc.narg('status')::society_status IS NULL OR status = sqlc.narg('status')::society_status)
  AND (sqlc.narg('created_by')::bigint IS NULL OR created_by = sqlc.narg('created_by')::bigint)
  AND (sqlc.narg('approved_by')::bigint IS NULL OR approved_by = sqlc.narg('approved_by')::bigint)
  AND (sqlc.narg('rejected_by')::bigint IS NULL OR rejected_by = sqlc.narg('rejected_by')::bigint)
  AND (sqlc.narg('suspended_by')::bigint IS NULL OR suspended_by = sqlc.narg('suspended_by')::bigint)
  AND (sqlc.narg('created_from')::timestamptz IS NULL OR created_at >= sqlc.narg('created_from')::timestamptz)
  AND (sqlc.narg('created_to')::timestamptz IS NULL OR created_at <= sqlc.narg('created_to')::timestamptz)
  AND (sqlc.arg('code')::text = '' OR society_code ILIKE '%' || sqlc.arg('code')::text || '%')
  AND (sqlc.arg('name')::text = '' OR name ILIKE '%' || sqlc.arg('name')::text || '%')
  AND (sqlc.arg('city')::text = '' OR city ILIKE '%' || sqlc.arg('city')::text || '%')
  AND (sqlc.arg('state')::text = '' OR state ILIKE '%' || sqlc.arg('state')::text || '%')
  AND (sqlc.arg('country')::text = '' OR country ILIKE '%' || sqlc.arg('country')::text || '%')
  AND (sqlc.arg('pincode')::text = '' OR pincode ILIKE '%' || sqlc.arg('pincode')::text || '%')
  AND (
      sqlc.arg('search')::text = ''
      OR name ILIKE '%' || sqlc.arg('search')::text || '%'
      OR society_code ILIKE '%' || sqlc.arg('search')::text || '%'
      OR COALESCE(email, '') ILIKE '%' || sqlc.arg('search')::text || '%'
      OR COALESCE(phone_number, '') ILIKE '%' || sqlc.arg('search')::text || '%'
      OR COALESCE(city, '') ILIKE '%' || sqlc.arg('search')::text || '%'
      OR COALESCE(state, '') ILIKE '%' || sqlc.arg('search')::text || '%'
      OR status::text ILIKE '%' || sqlc.arg('search')::text || '%'
  )
  AND deleted_at IS NULL
ORDER BY
    CASE WHEN sqlc.arg('sort_by') = 'name' AND sqlc.arg('sort_order') = 'asc' THEN name END ASC,
    CASE WHEN sqlc.arg('sort_by') = 'name' AND sqlc.arg('sort_order') = 'desc' THEN name END DESC,
    CASE WHEN sqlc.arg('sort_by') = 'city' AND sqlc.arg('sort_order') = 'asc' THEN city END ASC,
    CASE WHEN sqlc.arg('sort_by') = 'city' AND sqlc.arg('sort_order') = 'desc' THEN city END DESC,
    CASE WHEN sqlc.arg('sort_by') = 'status' AND sqlc.arg('sort_order') = 'asc' THEN status END ASC,
    CASE WHEN sqlc.arg('sort_by') = 'status' AND sqlc.arg('sort_order') = 'desc' THEN status END DESC,
    CASE WHEN sqlc.arg('sort_by') = 'updated_at' AND sqlc.arg('sort_order') = 'asc' THEN updated_at END ASC,
    CASE WHEN sqlc.arg('sort_by') = 'updated_at' AND sqlc.arg('sort_order') = 'desc' THEN updated_at END DESC,
    CASE WHEN sqlc.arg('sort_order') = 'asc' THEN created_at END ASC,
    created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountSocieties :one
SELECT COUNT(*)
FROM societies
WHERE (sqlc.narg('id')::bigint IS NULL OR id = sqlc.narg('id')::bigint)
  AND (sqlc.narg('status')::society_status IS NULL OR status = sqlc.narg('status')::society_status)
  AND (sqlc.narg('created_by')::bigint IS NULL OR created_by = sqlc.narg('created_by')::bigint)
  AND (sqlc.narg('approved_by')::bigint IS NULL OR approved_by = sqlc.narg('approved_by')::bigint)
  AND (sqlc.narg('rejected_by')::bigint IS NULL OR rejected_by = sqlc.narg('rejected_by')::bigint)
  AND (sqlc.narg('suspended_by')::bigint IS NULL OR suspended_by = sqlc.narg('suspended_by')::bigint)
  AND (sqlc.narg('created_from')::timestamptz IS NULL OR created_at >= sqlc.narg('created_from')::timestamptz)
  AND (sqlc.narg('created_to')::timestamptz IS NULL OR created_at <= sqlc.narg('created_to')::timestamptz)
  AND (sqlc.arg('code')::text = '' OR society_code ILIKE '%' || sqlc.arg('code')::text || '%')
  AND (sqlc.arg('name')::text = '' OR name ILIKE '%' || sqlc.arg('name')::text || '%')
  AND (sqlc.arg('city')::text = '' OR city ILIKE '%' || sqlc.arg('city')::text || '%')
  AND (sqlc.arg('state')::text = '' OR state ILIKE '%' || sqlc.arg('state')::text || '%')
  AND (sqlc.arg('country')::text = '' OR country ILIKE '%' || sqlc.arg('country')::text || '%')
  AND (sqlc.arg('pincode')::text = '' OR pincode ILIKE '%' || sqlc.arg('pincode')::text || '%')
  AND (
      sqlc.arg('search')::text = ''
      OR name ILIKE '%' || sqlc.arg('search')::text || '%'
      OR society_code ILIKE '%' || sqlc.arg('search')::text || '%'
      OR COALESCE(email, '') ILIKE '%' || sqlc.arg('search')::text || '%'
      OR COALESCE(phone_number, '') ILIKE '%' || sqlc.arg('search')::text || '%'
      OR COALESCE(city, '') ILIKE '%' || sqlc.arg('search')::text || '%'
      OR COALESCE(state, '') ILIKE '%' || sqlc.arg('search')::text || '%'
      OR status::text ILIKE '%' || sqlc.arg('search')::text || '%'
  )
  AND deleted_at IS NULL;

-- name: UpdateSociety :one
UPDATE societies
SET
    name = COALESCE(sqlc.narg('name'), name),
    email = COALESCE(sqlc.narg('email'), email),
    phone_number = COALESCE(sqlc.narg('phone_number'), phone_number),
    address_line1 = COALESCE(sqlc.narg('address_line1'), address_line1),
    address_line2 = COALESCE(sqlc.narg('address_line2'), address_line2),
    landmark = COALESCE(sqlc.narg('landmark'), landmark),
    city = COALESCE(sqlc.narg('city'), city),
    state = COALESCE(sqlc.narg('state'), state),
    pincode = COALESCE(sqlc.narg('pincode'), pincode),
    country = COALESCE(sqlc.narg('country'), country),
    total_flats = COALESCE(sqlc.narg('total_flats'), total_flats),
    total_blocks = COALESCE(sqlc.narg('total_blocks'), total_blocks),
    metadata = COALESCE(sqlc.narg('metadata'), metadata),
    updated_at = NOW()
WHERE id = sqlc.arg('id')
  AND deleted_at IS NULL
RETURNING *;

-- name: ApproveSociety :one
UPDATE societies
SET status = 'active', approved_by = $2, approved_at = NOW(), rejected_by = NULL, rejected_at = NULL,
    rejection_reason = NULL, suspended_by = NULL, suspended_at = NULL, suspension_reason = NULL, updated_at = NOW()
WHERE id = $1 AND status = 'pending' AND deleted_at IS NULL
RETURNING *;

-- name: RejectSociety :one
UPDATE societies
SET status = 'rejected', rejected_by = $2, rejected_at = NOW(), rejection_reason = $3, updated_at = NOW()
WHERE id = $1 AND status = 'pending' AND deleted_at IS NULL
RETURNING *;

-- name: SuspendSociety :one
UPDATE societies
SET status = 'suspended', suspended_by = $2, suspended_at = NOW(), suspension_reason = $3, updated_at = NOW()
WHERE id = $1 AND status = 'active' AND deleted_at IS NULL
RETURNING *;

-- name: ReactivateSociety :one
UPDATE societies
SET status = 'active', approved_by = $2, approved_at = NOW(), suspended_by = NULL, suspended_at = NULL,
    suspension_reason = NULL, updated_at = NOW()
WHERE id = $1 AND status = 'suspended' AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteSociety :exec
UPDATE societies
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: RestoreSociety :one
UPDATE societies
SET status = 'pending', deleted_at = NULL, approved_by = NULL, approved_at = NULL, rejected_by = NULL,
    rejected_at = NULL, rejection_reason = NULL, suspended_by = NULL, suspended_at = NULL,
    suspension_reason = NULL, updated_at = NOW()
WHERE id = $1 AND deleted_at IS NOT NULL
RETURNING *;

-- name: CountPendingSocietiesByCreator :one
SELECT COUNT(*)
FROM societies
WHERE created_by = $1 AND status = 'pending' AND deleted_at IS NULL;
