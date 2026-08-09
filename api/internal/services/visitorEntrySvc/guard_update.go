package visitorentrysvc

import (
	"context"

	"go-server/internal/models"
	service "go-server/internal/services"
)

func (s *VisitorEntrySvc) UpdateGuardEntry(ctx context.Context, societyID int64, entryID int64, guardUserID int64, req models.UpdateGuardVisitorEntryRequest) (*models.VisitorEntry, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := req.Validate(); err != nil {
		return nil, ErrInvalidVisitorRequest.WithCause(err)
	}
	if err := s.ensureStaffActor(ctx, societyID, guardUserID); err != nil {
		return nil, err
	}

	entry, err := s.GetEntry(ctx, societyID, entryID)
	if err != nil {
		return nil, err
	}
	if entry.Status != models.VisitorStatusWaitingApproval && entry.Status != models.VisitorStatusApproved {
		return nil, ErrVisitorInvalidState
	}

	var updated *models.VisitorEntry
	err = s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		if req.FullName != nil || req.PhoneNumber != nil || req.Email != nil || req.PhotoURL != nil {
			if _, err := s.visitorRepo.UpdateProfile(txCtx, entry.VisitorID, req); err != nil {
				return err
			}
		}
		if req.VehicleNumber != nil || req.VehicleType != nil || req.CompanionsCount != nil || req.CompanionDetails != nil || req.Notes != nil {
			var err error
			updated, err = s.entryRepo.UpdateDetails(txCtx, societyID, entryID, req)
			if err != nil {
				return err
			}
		}
		if updated == nil {
			var err error
			updated, err = s.entryRepo.Get(txCtx, societyID, entryID)
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return s.GetEntry(ctx, societyID, entryID)
}
