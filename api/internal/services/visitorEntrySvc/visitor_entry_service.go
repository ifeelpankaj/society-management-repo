package visitorentrysvc

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"sort"
	"strconv"
	"time"

	"go-server/internal/models"
	repository "go-server/internal/repositories"
	flatauthz "go-server/internal/services/flatAuthz"
	notificationsvc "go-server/internal/services/notificationSvc"
	service "go-server/internal/services"
)

const defaultInviteDuration = 24 * time.Hour

type VisitorInviteService interface {
	CreateInvite(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, actorUserID int64, expiresAt *time.Time) (*models.VisitorEntryMutationResponse, *models.VisitorInvite, error)
	CreateStaffInvite(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, staffUserID int64, expiresAt *time.Time) (*models.VisitorEntryMutationResponse, *models.VisitorInvite, error)
	GetInviteByToken(ctx context.Context, rawToken string) (*models.VisitorInvite, error)
	GetPublicInviteByToken(ctx context.Context, rawToken string) (*models.PublicVisitorInviteView, error)
	SubmitInviteForm(ctx context.Context, rawToken string, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error)
	CancelInvite(ctx context.Context, societyID int64, inviteID int64, actorUserID int64) error
	ExpireOldInvites(ctx context.Context) error
}

type VisitorEntryService interface {
	GetEntryOptions(ctx context.Context, societyID int64) (*models.VisitorEntryOptionsResponse, error)
	CreatePublicQREntry(ctx context.Context, societyID int64, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error)
	CreateQuickLinkEntry(ctx context.Context, societyID int64, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error)
	CreateGuardEntry(ctx context.Context, societyID int64, req models.VisitorFormRequest, guardUserID int64) (*models.VisitorEntryMutationResponse, error)
	ApproveEntry(ctx context.Context, societyID int64, entryID int64, actorUserID int64) (*models.VisitorEntryMutationResponse, error)
	RejectEntry(ctx context.Context, societyID int64, entryID int64, reason string, actorUserID int64) error
	GenerateQR(ctx context.Context, societyID int64, entryID int64) (*models.VisitorEntryMutationResponse, error)
	ValidateQR(ctx context.Context, rawToken string) (*models.VisitorEntry, error)
	CheckIn(ctx context.Context, rawToken string, guardUserID int64) (*models.VisitorEntry, error)
	CheckOut(ctx context.Context, societyID int64, entryID int64, guardUserID int64) (*models.VisitorEntry, error)
	AutoCloseExpiredEntries(ctx context.Context) error
	GetEntry(ctx context.Context, societyID int64, entryID int64) (*models.VisitorEntry, error)
	ListEntries(ctx context.Context, filter models.VisitorEntryFilter) ([]*models.VisitorEntry, error)
	ListEntriesPaginated(ctx context.Context, filter models.VisitorEntryFilter) (*models.VisitorEntryListResult, error)
	GetEntryStats(ctx context.Context, societyID int64) (*models.VisitorEntryStatsResponse, error)
	GetGuardDeskBootstrap(ctx context.Context, societyID int64) (*models.GuardDeskBootstrapResponse, error)
	ListSocietyPendingApprovals(ctx context.Context, filter models.VisitorPendingFilter) (*models.VisitorPendingListResult, error)
	GetFlatVisitorContext(ctx context.Context, societyID int64, flatID int64) (*models.FlatVisitorContextResponse, error)
	GetFlatVisitorContextForActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64) (*models.FlatVisitorContextResponse, error)
	GetMemberVisitorApprovalStats(ctx context.Context, societyID int64, memberID int64) (*models.MemberVisitorApprovalStatsResponse, error)
	ListPendingApprovals(ctx context.Context, societyID int64, flatID int64, actorUserID int64) ([]*models.VisitorEntry, error)
	ListFlatEntriesForActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64, filter models.VisitorEntryFilter) (*models.VisitorEntryListResult, error)
	ListEvents(ctx context.Context, societyID int64, entryID int64) ([]*models.VisitorEntryEvent, error)
}

type visitorService struct {
	visitorRepo  repository.VisitorRepository
	inviteRepo   repository.VisitorInviteRepository
	entryRepo    repository.VisitorEntryRepository
	eventRepo    repository.VisitorEntryEventRepository
	settingSvc   visitorSettingRules
	memberRepo   repository.SocietyMemberRepository
	residentRepo repository.FlatResidentRepository
	flatRepo     repository.FlatRepository
	societyRepo  repository.SocietyRepository
	flatAuthz    *flatauthz.FlatVisitorAuthz
	notifier     notificationsvc.NotificationService
	txManager    repository.TransactionManager
}

type visitorSettingRules interface {
	GetSocietySettings(ctx context.Context, societyID int64) (*models.SocietyVisitorSettingsResponse, error)
	GetFlatSettings(ctx context.Context, societyID int64, flatID int64) ([]models.FlatVisitorSettingsResponse, error)
	EnsureDefaultFlatSettingsIfMissing(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error
	ResolveApprovalRequirement(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, source models.VisitorEntrySource) (bool, error)
}

func NewVisitorService(
	visitorRepo repository.VisitorRepository,
	inviteRepo repository.VisitorInviteRepository,
	entryRepo repository.VisitorEntryRepository,
	eventRepo repository.VisitorEntryEventRepository,
	settingSvc visitorSettingRules,
	memberRepo repository.SocietyMemberRepository,
	residentRepo repository.FlatResidentRepository,
	flatRepo repository.FlatRepository,
	societyRepo repository.SocietyRepository,
	flatAuthz *flatauthz.FlatVisitorAuthz,
	notifier notificationsvc.NotificationService,
	txManager repository.TransactionManager,
) (VisitorInviteService, VisitorEntryService) {
	svc := &visitorService{
		visitorRepo: visitorRepo, inviteRepo: inviteRepo, entryRepo: entryRepo, eventRepo: eventRepo,
		settingSvc: settingSvc, memberRepo: memberRepo, residentRepo: residentRepo, flatRepo: flatRepo,
		societyRepo: societyRepo, flatAuthz: flatAuthz, notifier: notifier, txManager: txManager,
	}
	return svc, svc
}

func (s *visitorService) CreateInvite(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, actorUserID int64, expiresAt *time.Time) (*models.VisitorEntryMutationResponse, *models.VisitorInvite, error) {
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

func (s *visitorService) CreateStaffInvite(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, staffUserID int64, expiresAt *time.Time) (*models.VisitorEntryMutationResponse, *models.VisitorInvite, error) {
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

func (s *visitorService) createInvite(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, actorUserID int64, expiresAt *time.Time) (*models.VisitorEntryMutationResponse, *models.VisitorInvite, error) {
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

func (s *visitorService) GetInviteByToken(ctx context.Context, rawToken string) (*models.VisitorInvite, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	invite, err := s.inviteRepo.GetByTokenHash(ctx, hashToken(rawToken))
	if err != nil {
		return nil, err
	}
	if invite == nil {
		return nil, ErrVisitorInviteNotFound
	}
	if !inviteUsable(invite) {
		return nil, ErrVisitorInviteUnavailable
	}
	return invite, nil
}

func (s *visitorService) GetPublicInviteByToken(ctx context.Context, rawToken string) (*models.PublicVisitorInviteView, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	invite, err := s.GetInviteByToken(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	flat, err := s.flatRepo.Get(ctx, &models.FlatFilter{ID: &invite.FlatID, SocietyID: &invite.SocietyID})
	if err != nil {
		return nil, err
	}
	if flat == nil {
		return nil, ErrVisitorFlatNotFound
	}
	society, err := s.societyRepo.Get(ctx, models.GetSocietyFilter{ID: &invite.SocietyID})
	if err != nil {
		return nil, err
	}
	if society == nil {
		return nil, ErrVisitorFlatNotFound
	}
	return &models.PublicVisitorInviteView{
		ID:          invite.ID,
		Purpose:     invite.Purpose,
		Status:      invite.Status,
		ExpiresAt:   invite.ExpiresAt,
		SocietyName: society.Name,
		FlatNumber:  flat.FlatNumber,
		Block:       flat.Block,
		Floor:       flat.Floor,
	}, nil
}

func (s *visitorService) SubmitInviteForm(ctx context.Context, rawToken string, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error) {
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

func (s *visitorService) CancelInvite(ctx context.Context, societyID int64, inviteID int64, actorUserID int64) error {
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

func (s *visitorService) ExpireOldInvites(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	return s.inviteRepo.ExpireOld(ctx)
}

func (s *visitorService) GetEntryOptions(ctx context.Context, societyID int64) (*models.VisitorEntryOptionsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	active := true
	occupied := string(models.FlatStatusOccupied)
	flats, err := s.flatRepo.List(ctx, &models.FlatFilter{SocietyID: &societyID, Status: &occupied, IsActive: &active, Limit: 500})
	if err != nil {
		return nil, err
	}
	items := make([]models.VisitorEntryOptionsFlat, 0, len(flats))
	grouped := map[string][]models.VisitorEntryOptionsFlat{}
	for _, flat := range flats {
		item := models.VisitorEntryOptionsFlat{ID: flat.ID, Block: flat.Block, Floor: flat.Floor, FlatNumber: flat.FlatNumber}
		items = append(items, item)
		grouped[blockKey(flat.Block)] = append(grouped[blockKey(flat.Block)], item)
	}
	blocks := make([]models.VisitorEntryOptionsBlock, 0, len(grouped))
	for key, flats := range grouped {
		var block *string
		if key != "" {
			value := key
			block = &value
		}
		blocks = append(blocks, models.VisitorEntryOptionsBlock{Block: block, Flats: flats})
	}
	sort.Slice(blocks, func(i, j int) bool {
		return blockKey(blocks[i].Block) < blockKey(blocks[j].Block)
	})
	return &models.VisitorEntryOptionsResponse{
		Purposes: []models.VisitorPurpose{models.VisitorPurposeGuest, models.VisitorPurposeDelivery, models.VisitorPurposeCab, models.VisitorPurposeService, models.VisitorPurposeMaintenance, models.VisitorPurposeStaff, models.VisitorPurposeOther},
		Blocks:   blocks,
		Flats:    items,
	}, nil
}

func (s *visitorService) CreatePublicQREntry(ctx context.Context, societyID int64, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error) {
	return s.createEntryFromForm(ctx, societyID, req, models.VisitorEntrySourcePublicQR, nil)
}

func (s *visitorService) CreateQuickLinkEntry(ctx context.Context, societyID int64, req models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error) {
	return s.createEntryFromForm(ctx, societyID, req, models.VisitorEntrySourceQuickLink, nil)
}

func (s *visitorService) CreateGuardEntry(ctx context.Context, societyID int64, req models.VisitorFormRequest, guardUserID int64) (*models.VisitorEntryMutationResponse, error) {
	if err := s.ensureStaffActor(ctx, societyID, guardUserID); err != nil {
		return nil, err
	}
	return s.createEntryFromForm(ctx, societyID, req, models.VisitorEntrySourceGuardEntry, &guardUserID)
}

func (s *visitorService) createEntryFromForm(ctx context.Context, societyID int64, req models.VisitorFormRequest, source models.VisitorEntrySource, actorUserID *int64) (*models.VisitorEntryMutationResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := req.Validate(true); err != nil {
		return nil, ErrInvalidVisitorRequest.WithCause(err)
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

func (s *visitorService) ApproveEntry(ctx context.Context, societyID int64, entryID int64, actorUserID int64) (*models.VisitorEntryMutationResponse, error) {
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

func (s *visitorService) RejectEntry(ctx context.Context, societyID int64, entryID int64, reason string, actorUserID int64) error {
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

func (s *visitorService) GenerateQR(ctx context.Context, societyID int64, entryID int64) (*models.VisitorEntryMutationResponse, error) {
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

func (s *visitorService) ValidateQR(ctx context.Context, rawToken string) (*models.VisitorEntry, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	entry, err := s.entryRepo.GetByQRHash(ctx, hashToken(rawToken))
	if err != nil {
		return nil, err
	}
	if entry == nil {
		return nil, ErrVisitorQRInvalid
	}
	if entry.Status != models.VisitorStatusApproved {
		return nil, ErrVisitorInvalidState
	}
	if entry.QRExpiresAt == nil {
		return nil, ErrVisitorQRUnavailable
	}
	if time.Now().After(*entry.QRExpiresAt) {
		return nil, ErrVisitorQRExpired
	}
	return entry, nil
}

func (s *visitorService) CheckIn(ctx context.Context, rawToken string, guardUserID int64) (*models.VisitorEntry, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	entry, err := s.ValidateQR(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	if err := s.ensureStaffActor(ctx, entry.SocietyID, guardUserID); err != nil {
		return nil, err
	}
	var checkedIn *models.VisitorEntry
	err = s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		var err error
		checkedIn, err = s.entryRepo.CheckIn(txCtx, entry.SocietyID, entry.ID, guardUserID)
		if err != nil {
			return err
		}
		if checkedIn == nil {
			return ErrVisitorInvalidState
		}
		return s.recordEvents(txCtx, checkedIn, &guardUserID, models.VisitorEventTypeQRUsed, models.VisitorEventTypeCheckedIn)
	})
	if err != nil {
		return checkedIn, err
	}
	s.notifyVisitorCheckIn(checkedIn)
	return checkedIn, err
}

func (s *visitorService) CheckOut(ctx context.Context, societyID int64, entryID int64, guardUserID int64) (*models.VisitorEntry, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureStaffActor(ctx, societyID, guardUserID); err != nil {
		return nil, err
	}
	var checkedOut *models.VisitorEntry
	err := s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		var err error
		checkedOut, err = s.entryRepo.CheckOut(txCtx, societyID, entryID, guardUserID)
		if err != nil {
			return err
		}
		if checkedOut == nil {
			return ErrVisitorInvalidState
		}
		return s.recordEvents(txCtx, checkedOut, &guardUserID, models.VisitorEventTypeCheckedOut)
	})
	if err != nil {
		return checkedOut, err
	}
	s.notifyVisitorCheckOut(checkedOut)
	return checkedOut, err
}

func (s *visitorService) AutoCloseExpiredEntries(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	return s.entryRepo.AutoCloseExpired(ctx)
}

func (s *visitorService) GetEntry(ctx context.Context, societyID int64, entryID int64) (*models.VisitorEntry, error) {
	entry, err := s.entryRepo.Get(ctx, societyID, entryID)
	if err != nil {
		return nil, err
	}
	if entry == nil {
		return nil, ErrVisitorEntryNotFound
	}
	return entry, nil
}

func (s *visitorService) ListEntries(ctx context.Context, filter models.VisitorEntryFilter) ([]*models.VisitorEntry, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	return s.entryRepo.List(ctx, filter)
}

func (s *visitorService) ListEntriesPaginated(ctx context.Context, filter models.VisitorEntryFilter) (*models.VisitorEntryListResult, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	if filter.Limit <= 0 {
		filter.Limit = 50
	}
	entries, err := s.entryRepo.List(ctx, filter)
	if err != nil {
		return nil, err
	}
	total, err := s.entryRepo.Count(ctx, filter)
	if err != nil {
		return nil, err
	}
	return &models.VisitorEntryListResult{
		Entries: entries,
		Total:   total,
		Limit:   filter.Limit,
		Offset:  filter.Offset,
	}, nil
}

func (s *visitorService) GetEntryStats(ctx context.Context, societyID int64) (*models.VisitorEntryStatsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	return s.entryRepo.GetStats(ctx, societyID)
}

func (s *visitorService) ListSocietyPendingApprovals(ctx context.Context, filter models.VisitorPendingFilter) (*models.VisitorPendingListResult, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	if filter.Limit <= 0 {
		filter.Limit = 50
	}
	entries, err := s.entryRepo.ListSocietyPending(ctx, filter)
	if err != nil {
		return nil, err
	}
	total, err := s.entryRepo.CountSocietyPending(ctx, filter)
	if err != nil {
		return nil, err
	}
	return &models.VisitorPendingListResult{
		Entries: entries,
		Total:   total,
		Limit:   filter.Limit,
		Offset:  filter.Offset,
	}, nil
}

func (s *visitorService) GetFlatVisitorContext(ctx context.Context, societyID int64, flatID int64) (*models.FlatVisitorContextResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	flat, err := s.flatRepo.Get(ctx, &models.FlatFilter{SocietyID: &societyID, ID: &flatID})
	if err != nil {
		return nil, err
	}
	if flat == nil {
		return nil, ErrVisitorFlatNotFound
	}

	societySettings, err := s.settingSvc.GetSocietySettings(ctx, societyID)
	if err != nil {
		return nil, err
	}
	if societySettings == nil {
		return nil, ErrVisitorSettingsNotFound
	}

	flatSettings, err := s.settingSvc.GetFlatSettings(ctx, societyID, flatID)
	if err != nil {
		return nil, err
	}

	totalResidents, err := s.residentRepo.CountActive(ctx, societyID, flatID)
	if err != nil {
		return nil, err
	}

	status := string(models.FlatResidentStatusActive)
	isPrimary := true
	primary, err := s.residentRepo.Get(ctx, &models.FlatResidentFilter{
		SocietyID: &societyID,
		FlatID:    &flatID,
		Status:    &status,
		IsPrimary: &isPrimary,
	})
	if err != nil {
		return nil, err
	}

	recent, err := s.entryRepo.ListRecentByFlat(ctx, societyID, flatID, 10)
	if err != nil {
		return nil, err
	}
	recentSummaries := make([]*models.FlatRecentVisitorSummary, 0, len(recent))
	for _, entry := range recent {
		name := ""
		if entry.Visitor != nil {
			name = entry.Visitor.FullName
		}
		recentSummaries = append(recentSummaries, &models.FlatRecentVisitorSummary{
			EntryID:   entry.ID,
			FullName:  name,
			Purpose:   entry.Purpose,
			Status:    entry.Status,
			VisitedOn: entry.CreatedAt,
		})
	}

	var primaryResident *models.FlatVisitorContextResident
	if primary != nil {
		name := ""
		if primary.UserName != nil {
			name = *primary.UserName
		}
		primaryResident = &models.FlatVisitorContextResident{
			ID:       primary.ID,
			UserID:   primary.UserID,
			FullName: name,
		}
	}

	return &models.FlatVisitorContextResponse{
		OccupancyStatus:     flat.Status,
		PrimaryResident:     primaryResident,
		TotalResidents:      totalResidents,
		InheritsSocietyMode: societySettings.ApprovalMode == models.VisitorApprovalModeHybrid,
		SocietyApprovalMode: societySettings.ApprovalMode,
		VisitorSettings:     flatSettings,
		RecentVisitors:      recentSummaries,
	}, nil
}

func (s *visitorService) GetMemberVisitorApprovalStats(ctx context.Context, societyID int64, memberID int64) (*models.MemberVisitorApprovalStatsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	member, err := s.memberRepo.Get(ctx, models.GetSocietyMemberFilter{ID: &memberID, SocietyID: &societyID})
	if err != nil {
		return nil, err
	}
	if member == nil {
		return nil, ErrVisitorForbidden
	}
	return s.entryRepo.CountMemberApprovals(ctx, societyID, member.UserID)
}

func (s *visitorService) ListPendingApprovals(ctx context.Context, societyID int64, flatID int64, actorUserID int64) ([]*models.VisitorEntry, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureApprovalActor(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, err
	}
	return s.entryRepo.ListPending(ctx, societyID, flatID)
}

func (s *visitorService) ListFlatEntriesForActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64, filter models.VisitorEntryFilter) (*models.VisitorEntryListResult, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureFlatResident(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, err
	}

	filter.SocietyID = societyID
	filter.FlatID = &flatID
	if filter.Limit <= 0 {
		filter.Limit = 50
	}

	return s.ListEntriesPaginated(ctx, filter)
}

func (s *visitorService) GetFlatVisitorContextForActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64) (*models.FlatVisitorContextResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureFlatVisitorContextActor(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, err
	}

	if err := s.flatAuthz.CanManageFlatVisitors(ctx, societyID, flatID, actorUserID); err == nil {
		if err := s.settingSvc.EnsureDefaultFlatSettingsIfMissing(ctx, societyID, flatID, actorUserID); err != nil {
			return nil, err
		}
	}

	return s.GetFlatVisitorContext(ctx, societyID, flatID)
}

func (s *visitorService) ListEvents(ctx context.Context, societyID int64, entryID int64) ([]*models.VisitorEntryEvent, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	if _, err := s.GetEntry(ctx, societyID, entryID); err != nil {
		return nil, err
	}
	return s.eventRepo.List(ctx, societyID, entryID)
}

func (s *visitorService) makeQR(ctx context.Context, societyID int64) (*qrToken, error) {
	settings, err := s.settingSvc.GetSocietySettings(ctx, societyID)
	if err != nil {
		return nil, err
	}
	if settings == nil || settings.QRExpiryMinutes <= 0 {
		return nil, ErrVisitorQRUnavailable
	}
	token, hash, err := newToken()
	if err != nil {
		return nil, err
	}
	return &qrToken{token: token, hash: hash, expiresAt: time.Now().Add(time.Duration(settings.QRExpiryMinutes) * time.Minute)}, nil
}

func (s *visitorService) ensureApprovalActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	return mapFlatAuthzError(s.flatAuthz.CanManageFlatVisitors(ctx, societyID, flatID, actorUserID))
}

func (s *visitorService) ensureFlatResident(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	return mapFlatAuthzError(s.flatAuthz.CanViewFlatVisitors(ctx, societyID, flatID, actorUserID))
}

func (s *visitorService) ensureFlatVisitorContextActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	return mapFlatAuthzError(s.flatAuthz.CanViewFlatVisitors(ctx, societyID, flatID, actorUserID))
}

func mapFlatAuthzError(err error) error {
	if err == nil {
		return nil
	}

	var appErr *models.AppError
	if !errors.As(err, &appErr) {
		return err
	}

	switch appErr.Code {
	case flatauthz.ErrForbidden.Code, flatauthz.ErrViewForbidden.Code:
		return ErrVisitorForbidden
	case flatauthz.ErrFlatNotFound.Code:
		return ErrVisitorFlatNotFound
	default:
		return err
	}
}

func (s *visitorService) ensureStaffActor(ctx context.Context, societyID int64, actorUserID int64) error {
	if actorUserID <= 0 {
		return ErrVisitorForbidden
	}
	active := string(models.SocietyMemberStatusActive)
	member, err := s.memberRepo.Get(ctx, models.GetSocietyMemberFilter{SocietyID: &societyID, UserID: &actorUserID, Status: &active})
	if err != nil {
		return err
	}
	if member == nil {
		return ErrVisitorForbidden
	}
	switch member.Role {
	case models.SocietyMemberRoleOwner, models.SocietyMemberRoleAdmin, models.SocietyMemberRoleStaff:
		return nil
	default:
		return ErrVisitorForbidden
	}
}

func (s *visitorService) recordEvents(ctx context.Context, entry *models.VisitorEntry, actorUserID *int64, events ...models.VisitorEventType) error {
	for _, eventType := range events {
		if _, err := s.eventRepo.Create(ctx, entry.ID, entry.SocietyID, actorUserID, eventType, nil, nil); err != nil {
			return err
		}
	}
	return nil
}

type qrToken struct {
	token     string
	hash      string
	expiresAt time.Time
}

func (q *qrToken) response() *models.QRTokenResponse {
	return &models.QRTokenResponse{Token: q.token, ExpiresAt: q.expiresAt}
}

func newToken() (string, string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", "", err
	}
	token := hex.EncodeToString(raw)
	return token, hashToken(token), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func inviteUsable(invite *models.VisitorInvite) bool {
	return invite != nil && invite.Status == models.VisitorInviteStatusActive && invite.ExpiresAt.After(time.Now())
}

func blockKey(block *string) string {
	if block == nil {
		return ""
	}
	return *block
}

func guardActor(source models.VisitorEntrySource, actorUserID *int64) *int64 {
	if source == models.VisitorEntrySourceGuardEntry {
		return actorUserID
	}
	return nil
}

func ParseVisitorEntryFilterValue[T ~string](raw string, validate func(T) bool) (*T, error) {
	if raw == "" {
		return nil, nil
	}
	value := T(raw)
	if !validate(value) {
		return nil, ErrInvalidVisitorRequest
	}
	return &value, nil
}

func ParsePositiveInt64(raw string) (*int64, error) {
	if raw == "" {
		return nil, nil
	}
	value, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || value <= 0 {
		return nil, ErrInvalidVisitorRequest
	}
	return &value, nil
}

func IsInvalidStateNoRows(err error) bool {
	return errors.Is(err, ErrVisitorInvalidState)
}

var _ VisitorInviteService = (*visitorService)(nil)
var _ VisitorEntryService = (*visitorService)(nil)
