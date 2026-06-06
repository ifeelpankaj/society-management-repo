-- name: CreateVisitor :one
INSERT INTO visitors (full_name, phone_number, email, photo_url, metadata)
VALUES ($1, $2, $3, $4, COALESCE(sqlc.narg('metadata'), '{}'::jsonb))
RETURNING *;

-- name: GetVisitor :one
SELECT *
FROM visitors
WHERE id = $1;

-- name: CreateVisitorInvite :one
INSERT INTO visitor_invites (society_id, flat_id, created_by, purpose, token_hash, expires_at, metadata)
VALUES ($1, $2, $3, $4, $5, $6, COALESCE(sqlc.narg('metadata'), '{}'::jsonb))
RETURNING *;

-- name: GetVisitorInviteByID :one
SELECT *
FROM visitor_invites
WHERE id = $1
  AND society_id = $2;

-- name: GetVisitorInviteByTokenHash :one
SELECT *
FROM visitor_invites
WHERE token_hash = $1;

-- name: MarkVisitorInviteUsed :one
UPDATE visitor_invites
SET status = 'used',
    used_at = NOW(),
    updated_at = NOW()
WHERE id = $1
  AND status = 'active'
RETURNING *;

-- name: CancelVisitorInvite :one
UPDATE visitor_invites
SET status = 'cancelled',
    updated_at = NOW()
WHERE id = $1
  AND society_id = $2
  AND status = 'active'
RETURNING *;

-- name: ExpireOldVisitorInvites :exec
UPDATE visitor_invites
SET status = 'expired',
    updated_at = NOW()
WHERE status = 'active'
  AND expires_at < NOW();

-- name: CreateVisitorEntry :one
INSERT INTO visitor_entries (
    society_id,
    flat_id,
    visitor_id,
    invite_id,
    source,
    purpose,
    status,
    vehicle_number,
    vehicle_type,
    companions_count,
    companion_details,
    expected_at,
    expected_checkout_at,
    approved_by,
    handled_by_guard_id,
    created_by,
    qr_token_hash,
    qr_expires_at,
    notes,
    metadata
)
VALUES (
    $1,
    $2,
    $3,
    sqlc.narg('invite_id'),
    $4,
    $5,
    $6,
    sqlc.narg('vehicle_number'),
    sqlc.narg('vehicle_type'),
    $7,
    COALESCE(sqlc.narg('companion_details'), '[]'::jsonb),
    sqlc.narg('expected_at'),
    sqlc.narg('expected_checkout_at'),
    sqlc.narg('approved_by'),
    sqlc.narg('handled_by_guard_id'),
    sqlc.narg('created_by'),
    sqlc.narg('qr_token_hash'),
    sqlc.narg('qr_expires_at'),
    sqlc.narg('notes'),
    COALESCE(sqlc.narg('metadata'), '{}'::jsonb)
)
RETURNING *;

-- name: GetVisitorEntry :one
SELECT
    ve.*,
    v.full_name AS visitor_full_name,
    v.phone_number AS visitor_phone_number,
    v.email AS visitor_email,
    v.photo_url AS visitor_photo_url,
    f.flat_number,
    f.block,
    f.floor
FROM visitor_entries ve
JOIN visitors v ON v.id = ve.visitor_id
JOIN flats f ON f.id = ve.flat_id
WHERE ve.id = $1
  AND ve.society_id = $2;

-- name: GetVisitorEntryByQRHash :one
SELECT
    ve.*,
    v.full_name AS visitor_full_name,
    v.phone_number AS visitor_phone_number,
    v.email AS visitor_email,
    v.photo_url AS visitor_photo_url,
    f.flat_number,
    f.block,
    f.floor
FROM visitor_entries ve
JOIN visitors v ON v.id = ve.visitor_id
JOIN flats f ON f.id = ve.flat_id
WHERE ve.qr_token_hash = $1;

-- name: ListVisitorEntries :many
SELECT
    ve.*,
    v.full_name AS visitor_full_name,
    v.phone_number AS visitor_phone_number,
    v.email AS visitor_email,
    v.photo_url AS visitor_photo_url,
    f.flat_number,
    f.block,
    f.floor
FROM visitor_entries ve
JOIN visitors v ON v.id = ve.visitor_id
JOIN flats f ON f.id = ve.flat_id
WHERE ve.society_id = sqlc.arg('society_id')
  AND (sqlc.narg('flat_id')::bigint IS NULL OR ve.flat_id = sqlc.narg('flat_id')::bigint)
  AND (sqlc.narg('status')::visitor_status IS NULL OR ve.status = sqlc.narg('status')::visitor_status)
  AND (sqlc.narg('source')::visitor_source IS NULL OR ve.source = sqlc.narg('source')::visitor_source)
  AND (sqlc.narg('purpose')::visitor_purpose IS NULL OR ve.purpose = sqlc.narg('purpose')::visitor_purpose)
ORDER BY ve.created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: ListPendingVisitorApprovals :many
SELECT
    ve.*,
    v.full_name AS visitor_full_name,
    v.phone_number AS visitor_phone_number,
    v.email AS visitor_email,
    v.photo_url AS visitor_photo_url,
    f.flat_number,
    f.block,
    f.floor
FROM visitor_entries ve
JOIN visitors v ON v.id = ve.visitor_id
JOIN flats f ON f.id = ve.flat_id
WHERE ve.society_id = $1
  AND ve.flat_id = $2
  AND ve.status = 'waiting_approval'
ORDER BY ve.created_at DESC;

-- name: ApproveVisitorEntry :one
UPDATE visitor_entries
SET status = 'approved',
    approved_by = $3,
    qr_token_hash = $4,
    qr_expires_at = $5,
    updated_at = NOW()
WHERE id = $1
  AND society_id = $2
  AND status = 'waiting_approval'
RETURNING *;

-- name: RejectVisitorEntry :one
UPDATE visitor_entries
SET status = 'rejected',
    rejected_by = $3,
    rejection_reason = $4,
    updated_at = NOW()
WHERE id = $1
  AND society_id = $2
  AND status = 'waiting_approval'
RETURNING *;

-- name: GenerateVisitorEntryQR :one
UPDATE visitor_entries
SET qr_token_hash = $3,
    qr_expires_at = $4,
    updated_at = NOW()
WHERE id = $1
  AND society_id = $2
  AND status = 'approved'
RETURNING *;

-- name: CheckInVisitorEntry :one
UPDATE visitor_entries
SET status = 'checked_in',
    checked_in_at = NOW(),
    handled_by_guard_id = $3,
    qr_used_at = COALESCE(qr_used_at, NOW()),
    updated_at = NOW()
WHERE id = $1
  AND society_id = $2
  AND status = 'approved'
RETURNING *;

-- name: CheckOutVisitorEntry :one
UPDATE visitor_entries
SET status = 'checked_out',
    checked_out_at = NOW(),
    handled_by_guard_id = $3,
    updated_at = NOW()
WHERE id = $1
  AND society_id = $2
  AND status = 'checked_in'
RETURNING *;

-- name: AutoCloseExpiredVisitorEntries :exec
UPDATE visitor_entries
SET status = 'auto_closed',
    auto_closed_at = NOW(),
    updated_at = NOW()
WHERE status = 'checked_in'
  AND expected_checkout_at IS NOT NULL
  AND expected_checkout_at < NOW();

-- name: CreateVisitorEntryEvent :one
INSERT INTO visitor_entry_events (visitor_entry_id, society_id, actor_user_id, event_type, message, metadata)
VALUES ($1, $2, sqlc.narg('actor_user_id'), $3, sqlc.narg('message'), COALESCE(sqlc.narg('metadata'), '{}'::jsonb))
RETURNING *;

-- name: ListVisitorEntryEvents :many
SELECT *
FROM visitor_entry_events
WHERE visitor_entry_id = $1
  AND society_id = $2
ORDER BY created_at DESC;
