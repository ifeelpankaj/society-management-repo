-- name: CreateFlatMemberInvite :one
INSERT INTO flat_member_invites (
    society_id,
    flat_id,
    invited_by,
    role,
    phone,
    email,
    full_name,
    token_hash,
    expires_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: GetFlatMemberInviteByID :one
SELECT *
FROM flat_member_invites
WHERE id = $1
  AND society_id = $2;

-- name: GetFlatMemberInviteByTokenHash :one
SELECT *
FROM flat_member_invites
WHERE token_hash = $1;

-- name: ListPendingFlatMemberInvites :many
SELECT *
FROM flat_member_invites
WHERE society_id = $1
  AND flat_id = $2
  AND status = 'pending'
ORDER BY created_at DESC;

-- name: CancelFlatMemberInvite :one
UPDATE flat_member_invites
SET status = 'cancelled',
    updated_at = NOW()
WHERE id = $1
  AND society_id = $2
  AND flat_id = $3
  AND status = 'pending'
RETURNING *;

-- name: AcceptFlatMemberInvite :one
UPDATE flat_member_invites
SET status = 'accepted',
    updated_at = NOW()
WHERE id = $1
  AND status = 'pending'
  AND expires_at > NOW()
RETURNING *;

-- name: ExpireOldFlatMemberInvites :exec
UPDATE flat_member_invites
SET status = 'expired',
    updated_at = NOW()
WHERE status = 'pending'
  AND expires_at < NOW();
