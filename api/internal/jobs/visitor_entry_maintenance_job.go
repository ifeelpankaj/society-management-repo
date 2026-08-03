package jobs

import (
	"context"
	visitorentrysvc "go-server/internal/services/visitorEntrySvc"
	"go-server/pkg/logger"
	"time"

	"go.uber.org/zap"
)

type VisitorEntryMaintenanceJob struct {
	entrySvc visitorentrysvc.VisitorEntryService
}

func NewVisitorEntryMaintenanceJob(entrySvc visitorentrysvc.VisitorEntryService) *VisitorEntryMaintenanceJob {
	return &VisitorEntryMaintenanceJob{entrySvc: entrySvc}
}

func (j *VisitorEntryMaintenanceJob) Start(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	j.run(ctx)

	for {
		select {
		case <-ticker.C:
			j.run(ctx)
		case <-ctx.Done():
			logger.Info("visitor entry maintenance job stopped")
			return
		}
	}
}

func (j *VisitorEntryMaintenanceJob) run(ctx context.Context) {
	if err := j.entrySvc.AutoCloseExpiredEntries(ctx); err != nil {
		logger.Error("failed to auto-close expired visitor entries", zap.Error(err))
	} else {
		logger.Info("auto-close expired visitor entries completed")
	}
	if err := j.entrySvc.ExpireStaleEntries(ctx); err != nil {
		logger.Error("failed to expire stale visitor entries", zap.Error(err))
	} else {
		logger.Info("expire stale visitor entries completed")
	}
}
