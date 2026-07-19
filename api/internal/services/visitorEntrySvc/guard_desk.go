package visitorentrysvc

import (
	"context"

	"go-server/internal/models"
	service "go-server/internal/services"
)

func (s *visitorService) GetGuardDeskBootstrap(ctx context.Context, societyID int64) (*models.GuardDeskBootstrapResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if societyID <= 0 {
		return nil, ErrInvalidVisitorRequest
	}

	society, err := s.societyRepo.Get(ctx, models.GetSocietyFilter{ID: &societyID})
	if err != nil {
		return nil, err
	}
	if society == nil {
		return nil, ErrInvalidVisitorRequest
	}

	stats, err := s.entryRepo.GetStats(ctx, societyID)
	if err != nil {
		return nil, err
	}

	expectedTodayCount, err := s.entryRepo.CountExpectedToday(ctx, societyID)
	if err != nil {
		return nil, err
	}

	pending, err := s.entryRepo.ListSocietyPending(ctx, models.VisitorPendingFilter{
		SocietyID: societyID,
		Limit:     3,
		Offset:    0,
	})
	if err != nil {
		return nil, err
	}

	return &models.GuardDeskBootstrapResponse{
		Society:            society.ToResponse(),
		Stats:              stats,
		ExpectedTodayCount: expectedTodayCount,
		PendingPreview:     pending,
	}, nil
}
