package notificationsvc

import (
	"context"
	"strings"

	"go-server/internal/config"
	"go-server/internal/models"
	repository "go-server/internal/repositories"
	"go-server/pkg/logger"

	"go.uber.org/zap"
)

type notificationService struct {
	repo      repository.DeviceTokenRepository
	fcmClient fcmClient
	enabled   bool
}

func NewNotificationService(ctx context.Context, repo repository.DeviceTokenRepository, cfg *config.Config) (NotificationService, error) {
	if err := validateFCMConfig(cfg); err != nil {
		return nil, err
	}

	var client fcmClient = noopFCMClient{}
	if cfg.FCMEnabled {
		fcmClient, err := newFirebaseFCMClient(ctx, cfg.FCMCredentialsPath)
		if err != nil {
			return nil, err
		}
		client = fcmClient
	}

	return &notificationService{
		repo:      repo,
		fcmClient: client,
		enabled:   cfg.FCMEnabled,
	}, nil
}

func (s *notificationService) RegisterDeviceToken(ctx context.Context, userID int64, req models.RegisterDeviceTokenRequest) (*models.DeviceToken, error) {
	token := strings.TrimSpace(req.Token)
	if token == "" || !req.Platform.IsValid() {
		return nil, ErrInvalidDeviceToken
	}

	return s.repo.Upsert(ctx, userID, token, req.Platform, req.DeviceID)
}

func (s *notificationService) UnregisterDeviceToken(ctx context.Context, userID int64, token string) error {
	token = strings.TrimSpace(token)
	if token == "" {
		return ErrInvalidDeviceToken
	}

	if err := s.repo.Delete(ctx, userID, token); err != nil {
		return err
	}

	return nil
}

func (s *notificationService) SendToUser(ctx context.Context, userID int64, payload models.NotificationPayload) error {
	return s.SendToUsers(ctx, []int64{userID}, payload)
}

func (s *notificationService) SendToUsers(ctx context.Context, userIDs []int64, payload models.NotificationPayload) error {
	if !s.enabled {
		logger.Debug("push notification skipped because FCM is disabled")
		return nil
	}

	if strings.TrimSpace(payload.Title) == "" && strings.TrimSpace(payload.Body) == "" {
		return ErrInvalidDeviceToken
	}

	tokens := make([]string, 0)
	seen := make(map[string]struct{})

	for _, userID := range userIDs {
		rows, err := s.repo.ListByUserID(ctx, userID)
		if err != nil {
			return ErrNotificationSend.WithCause(err)
		}

		for _, row := range rows {
			if _, exists := seen[row.Token]; exists {
				continue
			}
			seen[row.Token] = struct{}{}
			tokens = append(tokens, row.Token)
		}
	}

	if len(tokens) == 0 {
		return nil
	}

	err := sendMulticast(ctx, s.fcmClient, tokens, payload, func(token string) {
		if deleteErr := s.repo.DeleteByToken(ctx, token); deleteErr != nil {
			logger.Warn("failed to delete invalid device token", zap.Error(deleteErr))
		}
	})
	if err != nil {
		return ErrNotificationSend.WithCause(err)
	}

	return nil
}

func (s *notificationService) Close() error {
	if s.fcmClient == nil {
		return nil
	}
	return s.fcmClient.Close()
}
