package visitorentrysvc

import (
	"context"
	"time"

	"go-server/internal/models"
	service "go-server/internal/services"
)

func (s *VisitorEntrySvc) CreatePublicQREntry(ctx context.Context, societyID int64, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error) {
	return s.createEntryFromForm(ctx, societyID, req, models.VisitorEntrySourcePublicQR, nil)
}

func (s *VisitorEntrySvc) CreateQuickLinkEntry(ctx context.Context, societyID int64, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error) {
	return s.createEntryFromForm(ctx, societyID, req, models.VisitorEntrySourceQuickLink, nil)
}

func (s *VisitorEntrySvc) CreateGuardEntry(ctx context.Context, societyID int64, req models.VisitorFormRequest, guardUserID int64) (*models.VisitorEntryMutationResponse, error) {
	if err := s.ensureStaffActor(ctx, societyID, guardUserID); err != nil {
		return nil, err
	}
	return s.createEntryFromForm(ctx, societyID, req, models.VisitorEntrySourceGuardEntry, &guardUserID)
}

func (s *VisitorEntrySvc) createEntryFromForm(ctx context.Context, societyID int64, req models.VisitorFormRequest, source models.VisitorEntrySource, actorUserID *int64) (*models.VisitorEntryMutationResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := req.Validate(true); err != nil {
		return nil, ErrInvalidVisitorRequest.WithCause(err)
	}
	if err := req.ValidateForPurpose(); err != nil {
		return nil, ErrInvalidVisitorRequest.WithCause(err)
	}
	if err := s.ensureEntryFlat(ctx, societyID, req.FlatID); err != nil {
		return nil, err
	}
	if err := s.ensureSocietyActive(ctx, societyID); err != nil {
		return nil, err
	}
	approvalRequired, err := s.settingSvc.ResolveApprovalRequirement(ctx, societyID, req.FlatID, req.Purpose, source)
	if err != nil {
		return nil, err
	}
	status := models.VisitorStatusApproved
	if approvalRequired {
		status = models.VisitorStatusWaitingApproval
	}
	var response *models.VisitorEntryMutationResponse
	err = s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		var qr *qrToken
		if status == models.VisitorStatusApproved {
			var err error
			qr, err = s.makeQR(ctx, societyID)
			if err != nil {
				return err
			}
		}
		visitor, err := s.visitorRepo.Create(txCtx, req)
		if err != nil {
			return err
		}
		var qrHash *string
		var qrExpiresAt *time.Time
		if qr != nil {
			qrHash = &qr.hash
			qrExpiresAt = &qr.expiresAt
		}
		entry, err := s.entryRepo.Create(txCtx, req, societyID, req.FlatID, visitor.ID, nil, source, req.Purpose, status, actorUserID, guardActor(source, actorUserID), qrHash, qrExpiresAt)
		if err != nil {
			return err
		}
		events := []models.VisitorEventType{models.VisitorEventTypeCreated}
		if status == models.VisitorStatusApproved {
			events = append(events, models.VisitorEventTypeApproved, models.VisitorEventTypeQRGenerated)
		}
		if err := s.recordEvents(txCtx, entry, actorUserID, events...); err != nil {
			return err
		}
		if qr != nil {
			entry, err = s.attachQRDisplayToken(txCtx, societyID, entry.ID, qr)
			if err != nil {
				return err
			}
		}
		response = &models.VisitorEntryMutationResponse{Entry: entry}
		if qr != nil {
			response.QR = qr.response()
		}
		return nil
	})
	if err != nil {
		return response, err
	}
	if response != nil && response.Entry != nil {
		if response.Entry.Status == models.VisitorStatusWaitingApproval {
			s.notifyVisitorPending(response.Entry)
		} else {
			s.notifyVisitorApproved(response.Entry)
		}
	}
	return response, err
}

func (s *VisitorEntrySvc) ApproveEntry(ctx context.Context, societyID int64, entryID int64, actorUserID int64) (*models.VisitorEntryMutationResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	entry, err := s.GetEntry(ctx, societyID, entryID)
	if err != nil {
		return nil, err
	}
	if entry.Status != models.VisitorStatusWaitingApproval {
		return nil, ErrVisitorInvalidState
	}
	if err := s.ensureApprovalActor(ctx, societyID, entry.FlatID, actorUserID); err != nil {
		return nil, err
	}
	qr, err := s.makeQR(ctx, societyID)
	if err != nil {
		return nil, err
	}
	var approved *models.VisitorEntry
	err = s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := s.lockEntryForApproval(txCtx, societyID, entryID); err != nil {
			return err
		}
		var err error
		approved, err = s.entryRepo.Approve(txCtx, societyID, entryID, actorUserID, qr.hash, qr.expiresAt)
		if err != nil {
			return err
		}
		if approved == nil {
			return ErrVisitorInvalidState
		}
		return s.recordEvents(txCtx, approved, &actorUserID, models.VisitorEventTypeApproved, models.VisitorEventTypeQRGenerated)
	})
	if err != nil {
		return nil, err
	}
	s.notifyVisitorApproved(approved)
	return &models.VisitorEntryMutationResponse{Entry: approved, QR: qr.response()}, nil
}

func (s *VisitorEntrySvc) RejectEntry(ctx context.Context, societyID int64, entryID int64, reason string, actorUserID int64) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	entry, err := s.GetEntry(ctx, societyID, entryID)
	if err != nil {
		return err
	}
	if entry.Status != models.VisitorStatusWaitingApproval {
		return ErrVisitorInvalidState
	}
	if err := s.ensureApprovalActor(ctx, societyID, entry.FlatID, actorUserID); err != nil {
		return err
	}
	var rejected *models.VisitorEntry
	err = s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		var err error
		rejected, err = s.entryRepo.Reject(txCtx, societyID, entryID, actorUserID, reason)
		if err != nil {
			return err
		}
		if rejected == nil {
			return ErrVisitorInvalidState
		}
		return s.recordEvents(txCtx, rejected, &actorUserID, models.VisitorEventTypeRejected)
	})
	if err != nil {
		return err
	}
	s.notifyVisitorRejected(rejected)
	return nil
}

func (s *VisitorEntrySvc) GenerateQR(ctx context.Context, societyID int64, entryID int64) (*models.VisitorEntryMutationResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	qr, err := s.makeQR(ctx, societyID)
	if err != nil {
		return nil, err
	}
	var entry *models.VisitorEntry
	err = s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		var err error
		entry, err = s.entryRepo.GenerateQR(txCtx, societyID, entryID, qr.hash, qr.expiresAt)
		if err != nil {
			return err
		}
		if entry == nil {
			return ErrVisitorInvalidState
		}
		return s.recordEvents(txCtx, entry, nil, models.VisitorEventTypeQRGenerated)
	})
	if err != nil {
		return nil, err
	}
	return &models.VisitorEntryMutationResponse{Entry: entry, QR: qr.response()}, nil
}

func (s *VisitorEntrySvc) AutoCloseExpiredEntries(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	return s.entryRepo.AutoCloseExpired(ctx)
}

func (s *VisitorEntrySvc) ExpireStaleEntries(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	return s.entryRepo.ExpireStaleEntries(ctx)
}
