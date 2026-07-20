package visitorentrysvc

import (
	"context"
	"time"

	"go-server/internal/models"
	service "go-server/internal/services"
)

func (s *VisitorEntrySvc) CreateInvite(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, actorUserID int64, expiresAt *time.Time) (*models.VisitorEntryMutationResponse, *models.VisitorInvite, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if societyID <= 0 || flatID <= 0 || actorUserID <= 0 || !purpose.IsValid() {
		return nil, nil, ErrInvalidVisitorRequest
	}
	if err := s.ensureApprovalActor(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, nil, err
	}
	return s.createInvite(ctx, societyID, flatID, purpose, actorUserID, expiresAt)
}

func (s *VisitorEntrySvc) CreateStaffInvite(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, staffUserID int64, expiresAt *time.Time) (*models.VisitorEntryMutationResponse, *models.VisitorInvite, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if societyID <= 0 || flatID <= 0 || staffUserID <= 0 || !purpose.IsValid() {
		return nil, nil, ErrInvalidVisitorRequest
	}
	if err := s.ensureStaffActor(ctx, societyID, staffUserID); err != nil {
		return nil, nil, err
	}
	flat, err := s.flatRepo.Get(ctx, &models.FlatFilter{ID: &flatID, SocietyID: &societyID})
	if err != nil {
		return nil, nil, err
	}
	if flat == nil {
		return nil, nil, ErrVisitorFlatNotFound
	}
	return s.createInvite(ctx, societyID, flatID, purpose, staffUserID, expiresAt)
}

func (s *VisitorEntrySvc) createInvite(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, actorUserID int64, expiresAt *time.Time) (*models.VisitorEntryMutationResponse, *models.VisitorInvite, error) {
	if _, err := s.settingSvc.ResolveApprovalRequirement(ctx, societyID, flatID, purpose, models.VisitorEntrySourceResidentLink); err != nil {
		return nil, nil, err
	}
	token, tokenHash, err := newToken()
	if err != nil {
		return nil, nil, err
	}
	expiry := time.Now().Add(defaultInviteDuration)
	if expiresAt != nil {
		expiry = *expiresAt
	}
	invite, err := s.inviteRepo.Create(ctx, societyID, flatID, purpose, tokenHash, expiry, actorUserID)
	if err != nil {
		return nil, nil, err
	}
	return &models.VisitorEntryMutationResponse{QR: &models.QRTokenResponse{Token: token, ExpiresAt: expiry}}, invite, nil
}

func (s *VisitorEntrySvc) SubmitInviteForm(ctx context.Context, rawToken string, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := req.Validate(false); err != nil {
		return nil, ErrInvalidVisitorRequest.WithCause(err)
	}
	invite, err := s.GetInviteByToken(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	settings, err := s.settingSvc.GetSocietySettings(ctx, invite.SocietyID)
	if err != nil {
		return nil, err
	}
	if settings == nil || !settings.AllowResidentPreApproval || !settings.IsActive {
		return nil, ErrVisitorInviteUnavailable
	}
	var response *models.VisitorEntryMutationResponse
	err = s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		qr, err := s.makeQR(ctx, invite.SocietyID)
		if err != nil {
			return err
		}
		visitor, err := s.visitorRepo.Create(txCtx, req)
		if err != nil {
			return err
		}
		entry, err := s.entryRepo.Create(txCtx, req, invite.SocietyID, invite.FlatID, visitor.ID, &invite.ID, models.VisitorEntrySourceResidentLink, invite.Purpose, models.VisitorStatusApproved, &invite.CreatedBy, nil, &qr.hash, &qr.expiresAt)
		if err != nil {
			return err
		}
		if _, err := s.inviteRepo.MarkUsed(txCtx, invite.ID); err != nil {
			return err
		}
		if err := s.recordEvents(txCtx, entry, &invite.CreatedBy, models.VisitorEventTypeCreated, models.VisitorEventTypeApproved, models.VisitorEventTypeQRGenerated); err != nil {
			return err
		}
		response = &models.VisitorEntryMutationResponse{Entry: entry, QR: qr.response()}
		return nil
	})
	if err != nil {
		return response, err
	}
	if response != nil && response.Entry != nil {
		s.notifyVisitorApproved(response.Entry)
	}
	return response, err
}

func (s *VisitorEntrySvc) CancelInvite(ctx context.Context, societyID int64, inviteID int64, actorUserID int64) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	invite, err := s.inviteRepo.GetByID(ctx, societyID, inviteID)
	if err != nil {
		return err
	}
	if invite == nil {
		return ErrVisitorInviteNotFound
	}
	if err := s.ensureApprovalActor(ctx, societyID, invite.FlatID, actorUserID); err != nil {
		return err
	}
	cancelled, err := s.inviteRepo.Cancel(ctx, societyID, inviteID)
	if err != nil {
		return err
	}
	if cancelled == nil {
		return ErrVisitorInviteUnavailable
	}
	return nil
}

func (s *VisitorEntrySvc) ExpireOldInvites(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	return s.inviteRepo.ExpireOld(ctx)
}
