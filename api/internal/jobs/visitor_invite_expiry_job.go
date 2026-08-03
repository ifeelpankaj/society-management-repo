package jobs

import (
	"context"
	visitorentrysvc "go-server/internal/services/visitorEntrySvc"
	"go-server/pkg/logger"
	"time"

	"go.uber.org/zap"
)

type VisitorInviteExpiryJob struct {
	inviteSvc visitorentrysvc.VisitorInviteService
}

func NewVisitorInviteExpiryJob(inviteSvc visitorentrysvc.VisitorInviteService) *VisitorInviteExpiryJob {
	return &VisitorInviteExpiryJob{inviteSvc: inviteSvc}
}

func (j *VisitorInviteExpiryJob) Start(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	j.run(ctx)

	for {
		select {
		case <-ticker.C:
			j.run(ctx)
		case <-ctx.Done():
			logger.Info("visitor invite expiry job stopped")
			return
		}
	}
}

func (j *VisitorInviteExpiryJob) run(ctx context.Context) {
	if err := j.inviteSvc.ExpireOldInvites(ctx); err != nil {
		logger.Error("failed to expire old visitor invites", zap.Error(err))
		return
	}
	logger.Info("expire old visitor invites completed")
}
