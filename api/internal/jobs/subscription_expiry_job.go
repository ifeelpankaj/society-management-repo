package jobs

import (
	"context"
	"time"

	subscriptionsvc "go-server/internal/services/subscriptionSvc"
	"go-server/pkg/logger"

	"go.uber.org/zap"
)

type SubscriptionExpiryJob struct {
	subSvc subscriptionsvc.SubscriptionService
}

func NewSubscriptionExpiryJob(subSvc subscriptionsvc.SubscriptionService) *SubscriptionExpiryJob {
	return &SubscriptionExpiryJob{subSvc: subSvc}
}

func (j *SubscriptionExpiryJob) Start(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	j.run(ctx)

	for {
		select {
		case <-ticker.C:
			j.run(ctx)
		case <-ctx.Done():
			logger.Info("subscription expiry job stopped")
			return
		}
	}
}

func (j *SubscriptionExpiryJob) run(ctx context.Context) {
	count, err := j.subSvc.ExpireDueSubscriptions(ctx)
	if err != nil {
		logger.Error("failed to expire due subscriptions", zap.Error(err))
		return
	}
	if count > 0 {
		logger.Info("expired due subscriptions", zap.Int64("count", count))
	}
}
