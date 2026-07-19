package repository

import (
	"context"

	"go-server/internal/db"
	"go-server/internal/models"
	"go-server/pkg/database"
)

type DeviceTokenRepository interface {
	Upsert(ctx context.Context, userID int64, token string, platform models.DevicePlatform, deviceID *string) (*models.DeviceToken, error)
	Delete(ctx context.Context, userID int64, token string) error
	ListByUserID(ctx context.Context, userID int64) ([]*models.DeviceToken, error)
	DeleteByToken(ctx context.Context, token string) error
}

type deviceTokenRepository struct {
	db *database.Database
}

func NewDeviceTokenRepository(db *database.Database) DeviceTokenRepository {
	return &deviceTokenRepository{db: db}
}

func (r *deviceTokenRepository) Upsert(ctx context.Context, userID int64, token string, platform models.DevicePlatform, deviceID *string) (*models.DeviceToken, error) {
	row, err := GetQueries(ctx, r.db).UpsertDeviceToken(ctx, db.UpsertDeviceTokenParams{
		UserID:   userID,
		Token:    token,
		Platform: db.DevicePlatform(platform),
		DeviceID: deviceID,
	})
	if err != nil {
		return nil, err
	}
	return deviceTokenFromDB(row), nil
}

func (r *deviceTokenRepository) Delete(ctx context.Context, userID int64, token string) error {
	return GetQueries(ctx, r.db).DeleteDeviceToken(ctx, db.DeleteDeviceTokenParams{
		UserID: userID,
		Token:  token,
	})
}

func (r *deviceTokenRepository) ListByUserID(ctx context.Context, userID int64) ([]*models.DeviceToken, error) {
	rows, err := GetQueries(ctx, r.db).ListDeviceTokensByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	items := make([]*models.DeviceToken, 0, len(rows))
	for _, row := range rows {
		items = append(items, deviceTokenFromDB(row))
	}
	return items, nil
}

func (r *deviceTokenRepository) DeleteByToken(ctx context.Context, token string) error {
	return GetQueries(ctx, r.db).DeleteDeviceTokenByValue(ctx, token)
}

func deviceTokenFromDB(row db.DeviceToken) *models.DeviceToken {
	return &models.DeviceToken{
		ID:         row.ID,
		UserID:     row.UserID,
		Token:      row.Token,
		Platform:   models.DevicePlatform(row.Platform),
		DeviceID:   row.DeviceID,
		LastSeenAt: pgTimestamptzToTime(row.LastSeenAt),
		CreatedAt:  pgTimestamptzToTime(row.CreatedAt),
		UpdatedAt:  pgTimestamptzToTime(row.UpdatedAt),
	}
}
