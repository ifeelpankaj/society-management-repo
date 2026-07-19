package notificationsvc

import (
	"context"

	"go-server/internal/models"
)

type NotificationService interface {
	RegisterDeviceToken(ctx context.Context, userID int64, req models.RegisterDeviceTokenRequest) (*models.DeviceToken, error)
	UnregisterDeviceToken(ctx context.Context, userID int64, token string) error
	SendToUser(ctx context.Context, userID int64, payload models.NotificationPayload) error
	SendToUsers(ctx context.Context, userIDs []int64, payload models.NotificationPayload) error
	Close() error
}
