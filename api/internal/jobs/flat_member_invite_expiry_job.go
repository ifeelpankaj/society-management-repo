package jobs

import (
	"context"
	flatsvc "go-server/internal/services/flatSvc"
	"go-server/pkg/logger"
	"time"

	"go.uber.org/zap"
)

type FlatMemberInviteExpiryJob struct {
	flatSvc flatsvc.FlatService
}

func NewFlatMemberInviteExpiryJob(flatSvc flatsvc.FlatService) *FlatMemberInviteExpiryJob {
	return &FlatMemberInviteExpiryJob{flatSvc: flatSvc}
}

func (j *FlatMemberInviteExpiryJob) Start(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	j.run(ctx)

	for {
		select {
		case <-ticker.C:
			j.run(ctx)
		case <-ctx.Done():
			logger.Info("flat member invite expiry job stopped")
			return
		}
	}
}

func (j *FlatMemberInviteExpiryJob) run(ctx context.Context) {
	if err := j.flatSvc.ExpireOldMemberInvites(ctx); err != nil {
		logger.Error("failed to expire old flat member invites", zap.Error(err))
		return
	}
	logger.Info("expire old flat member invites completed")
}
