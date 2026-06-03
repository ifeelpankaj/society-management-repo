package jobs

import (
	"context"
	repository "go-server/internal/repositories"
	"go-server/pkg/logger"
	"time"

	"go.uber.org/zap"
)

type VerificationCleanupJob struct {
	verificationRepo repository.VerificationRepository
}

func NewVerificationCleanupJob(verificationRepo repository.VerificationRepository) *VerificationCleanupJob {
	return &VerificationCleanupJob{verificationRepo: verificationRepo}
}

func (j *VerificationCleanupJob) Start(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	j.run(ctx)

	for {
		select {
		case <-ticker.C:
			j.run(ctx)
		case <-ctx.Done():
			logger.Info("verification cleanup job stopped")
			return
		}
	}
}

func (j *VerificationCleanupJob) run(ctx context.Context) {
	if err := j.verificationRepo.DeleteUsedOrExpired(ctx); err != nil {
		logger.Error("failed to cleanup used or expired verifications", zap.Error(err))
		return
	}
	logger.Info("used or expired verifications cleanup completed")
}
