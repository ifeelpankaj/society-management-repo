package flatsvc

import (
	"context"

	"go-server/internal/models"
	service "go-server/internal/services"
)

func (s *FlatSvc) CreateFlat(ctx context.Context, societyID int64, createdBy int64, req *models.CreateFlatRequest) (*models.FlatResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil {
		return nil, ErrInvalidFlatRequest
	}
	if err := s.ensureFlatManager(ctx, societyID, createdBy); err != nil {
		return nil, err
	}
	if err := s.ensureFlatOperational(ctx, societyID); err != nil {
		return nil, err
	}
	if err := s.ensureCanAddFlats(ctx, societyID, 1); err != nil {
		return nil, err
	}

	flat := &models.Flat{
		SocietyID: societyID, Block: req.Block, Floor: req.Floor, FlatNumber: req.FlatNumber,
		Status: models.FlatStatusVacant, IsActive: true, CreatedBy: &createdBy, Metadata: req.Metadata,
	}
	if err := s.flatRepo.Create(ctx, flat); err != nil {
		return nil, ErrFlatConflict.WithCause(err)
	}
	return s.GetFlat(ctx, &models.FlatFilter{ID: &flat.ID, SocietyID: &societyID})
}

func (s *FlatSvc) BulkCreateFlats(ctx context.Context, societyID int64, createdBy int64, req *models.BulkCreateFlatsRequest) (*models.BulkCreateFlatsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil {
		return nil, ErrInvalidFlatRequest
	}
	req.Sanitize()
	if err := req.Validate(); err != nil {
		return nil, ErrInvalidFlatRequest.WithCause(err)
	}
	if err := s.ensureFlatManager(ctx, societyID, createdBy); err != nil {
		return nil, err
	}
	if err := s.ensureFlatOperational(ctx, societyID); err != nil {
		return nil, err
	}
	if err := s.ensureCanAddFlats(ctx, societyID, int64(len(req.Flats))); err != nil {
		return nil, err
	}

	items := make([]*models.FlatResponse, 0, len(req.Flats))
	err := s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		for i := range req.Flats {
			item := req.Flats[i]
			flat := &models.Flat{
				SocietyID: societyID, Block: item.Block, Floor: item.Floor, FlatNumber: item.FlatNumber,
				Status: models.FlatStatusVacant, IsActive: true, CreatedBy: &createdBy, Metadata: item.Metadata,
			}
			if err := s.flatRepo.Create(txCtx, flat); err != nil {
				return ErrFlatConflict.WithCause(err)
			}
			loaded, err := s.flatRepo.Get(txCtx, &models.FlatFilter{ID: &flat.ID, SocietyID: &societyID})
			if err != nil {
				return err
			}
			items = append(items, loaded.ToResponse())
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &models.BulkCreateFlatsResponse{Items: items, Total: int32(len(items))}, nil
}

func (s *FlatSvc) UpdateFlat(ctx context.Context, filter *models.FlatFilter, req *models.UpdateFlatRequest) (*models.FlatResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil || filter == nil {
		return nil, ErrInvalidFlatRequest
	}
	req.Sanitize()
	if err := req.Validate(); err != nil {
		return nil, ErrInvalidFlatRequest.WithCause(err)
	}
	flat, err := s.flatRepo.Update(ctx, filter, req)
	if err != nil {
		return nil, err
	}
	if flat == nil {
		return nil, ErrFlatNotFound
	}
	return s.GetFlat(ctx, &models.FlatFilter{ID: &flat.ID, SocietyID: &flat.SocietyID})
}

func (s *FlatSvc) DeleteFlat(ctx context.Context, filter *models.FlatFilter, deletedBy int64) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if filter == nil {
		return ErrInvalidFlatRequest
	}
	if filter.SocietyID != nil {
		if err := s.ensureFlatManager(ctx, *filter.SocietyID, deletedBy); err != nil {
			return err
		}
	}
	return s.flatRepo.Deactivate(ctx, filter)
}

func (s *FlatSvc) BlockFlat(ctx context.Context, filter *models.FlatFilter, blockedBy int64, reason string) (*models.FlatResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if filter == nil {
		return nil, ErrInvalidFlatRequest
	}
	if filter.SocietyID != nil {
		if err := s.ensureFlatManager(ctx, *filter.SocietyID, blockedBy); err != nil {
			return nil, err
		}
	}
	flat, err := s.flatRepo.Block(ctx, filter)
	if err != nil {
		return nil, err
	}
	if flat == nil {
		return nil, ErrFlatNotFound
	}
	return s.GetFlat(ctx, &models.FlatFilter{ID: &flat.ID, SocietyID: &flat.SocietyID})
}

func (s *FlatSvc) UnblockFlat(ctx context.Context, filter *models.FlatFilter, unblockedBy int64) (*models.FlatResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if filter == nil {
		return nil, ErrInvalidFlatRequest
	}
	if filter.SocietyID != nil {
		if err := s.ensureFlatManager(ctx, *filter.SocietyID, unblockedBy); err != nil {
			return nil, err
		}
	}
	flat, err := s.flatRepo.Unblock(ctx, filter)
	if err != nil {
		return nil, err
	}
	if flat == nil {
		return nil, ErrFlatNotFound
	}
	return s.GetFlat(ctx, &models.FlatFilter{ID: &flat.ID, SocietyID: &flat.SocietyID})
}
