-- name: UpsertDeviceToken :one
INSERT INTO device_tokens (
    user_id,
    token,
    platform,
    device_id,
    last_seen_at
)
VALUES ($1, $2, $3, $4, NOW())
ON CONFLICT (user_id, token) DO UPDATE SET
    platform = EXCLUDED.platform,
    device_id = EXCLUDED.device_id,
    last_seen_at = NOW(),
    updated_at = NOW()
RETURNING *;

-- name: DeleteDeviceToken :exec
DELETE FROM device_tokens
WHERE user_id = $1
  AND token = $2;

-- name: ListDeviceTokensByUserID :many
SELECT *
FROM device_tokens
WHERE user_id = $1
ORDER BY last_seen_at DESC;

-- name: DeleteDeviceTokenByValue :exec
DELETE FROM device_tokens
WHERE token = $1;
