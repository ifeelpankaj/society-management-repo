package visitorsettingsvc

import (
	"context"

	"go-server/internal/models"
	repository "go-server/internal/repositories"
	service "go-server/internal/services"
)

type VisitorSettingService interface {
	CreateDefaultSocietySettings(ctx context.Context, societyID int64, actorUserID int64) error
	GetSocietySettings(ctx context.Context, societyID int64) (*models.SocietyVisitorSettingsResponse, error)
	UpdateSocietySettings(ctx context.Context, societyID int64, req models.UpdateSocietyVisitorSettingsRequest, actorUserID int64) (*models.SocietyVisitorSettingsResponse, error)
	CreateDefaultFlatSettings(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error
	GetFlatSettings(ctx context.Context, societyID int64, flatID int64) ([]models.FlatVisitorSettingsResponse, error)
	GetFlatSettingsForActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64) ([]models.FlatVisitorSettingsResponse, error)
	UpdateFlatPurposeSetting(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, req models.UpdateFlatVisitorSettingRequest, actorUserID int64) (*models.FlatVisitorSettingsResponse, error)
	ResetFlatSettingsToDefault(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error
	ResolveApprovalRequirement(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, source models.VisitorEntrySource) (bool, error)
}

type VisitorSettingSvc struct {
	settingsRepo repository.VisitorSettingRepository
	memberRepo   repository.SocietyMemberRepository
	residentRepo repository.FlatResidentRepository
	flatRepo     repository.FlatRepository
	txManager    repository.TransactionManager
}

func NewVisitorSettingService(
	settingsRepo repository.VisitorSettingRepository,
	memberRepo repository.SocietyMemberRepository,
	residentRepo repository.FlatResidentRepository,
	flatRepo repository.FlatRepository,
	txManager repository.TransactionManager,
) VisitorSettingService {
	return &VisitorSettingSvc{
		settingsRepo: settingsRepo,
		memberRepo:   memberRepo,
		residentRepo: residentRepo,
		flatRepo:     flatRepo,
		txManager:    txManager,
	}
}

func (s *VisitorSettingSvc) CreateDefaultSocietySettings(ctx context.Context, societyID int64, actorUserID int64) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	return s.settingsRepo.CreateDefaultSociety(ctx, societyID, actorUserID)
}

func (s *VisitorSettingSvc) GetSocietySettings(ctx context.Context, societyID int64) (*models.SocietyVisitorSettingsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	settings, err := s.settingsRepo.GetSociety(ctx, societyID)
	if err != nil {
		return nil, err
	}
	if settings == nil {
		return nil, ErrVisitorSettingsNotFound
	}
	return settings.ToResponse(), nil
}

func (s *VisitorSettingSvc) UpdateSocietySettings(ctx context.Context, societyID int64, req models.UpdateSocietyVisitorSettingsRequest, actorUserID int64) (*models.SocietyVisitorSettingsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := req.Validate(); err != nil {
		return nil, ErrInvalidVisitorSettings.WithCause(err)
	}
	settings, err := s.settingsRepo.UpdateSociety(ctx, societyID, req, actorUserID)
	if err != nil {
		return nil, err
	}
	if settings == nil {
		return nil, ErrVisitorSettingsNotFound
	}
	return settings.ToResponse(), nil
}

func (s *VisitorSettingSvc) CreateDefaultFlatSettings(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	return s.settingsRepo.CreateDefaultFlat(ctx, societyID, flatID, actorUserID)
}

func (s *VisitorSettingSvc) GetFlatSettings(ctx context.Context, societyID int64, flatID int64) ([]models.FlatVisitorSettingsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	items, err := s.settingsRepo.ListFlat(ctx, societyID, flatID)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, ErrVisitorSettingsNotFound
	}
	responses := make([]models.FlatVisitorSettingsResponse, 0, len(items))
	for _, item := range items {
		responses = append(responses, *item.ToResponse())
	}
	return responses, nil
}

func (s *VisitorSettingSvc) GetFlatSettingsForActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64) ([]models.FlatVisitorSettingsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureFlatSettingsActor(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, err
	}
	return s.GetFlatSettings(ctx, societyID, flatID)
}

func (s *VisitorSettingSvc) UpdateFlatPurposeSetting(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, req models.UpdateFlatVisitorSettingRequest, actorUserID int64) (*models.FlatVisitorSettingsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if !purpose.IsValid() {
		return nil, ErrInvalidVisitorSettings
	}
	if err := req.Validate(); err != nil {
		return nil, ErrInvalidVisitorSettings.WithCause(err)
	}
	if err := s.ensureFlatSettingsActor(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, err
	}
	settings, err := s.settingsRepo.UpdateFlatPurpose(ctx, societyID, flatID, purpose, req, actorUserID)
	if err != nil {
		return nil, err
	}
	if settings == nil {
		return nil, ErrVisitorSettingsNotFound
	}
	return settings.ToResponse(), nil
}

func (s *VisitorSettingSvc) ResetFlatSettingsToDefault(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureFlatSettingsActor(ctx, societyID, flatID, actorUserID); err != nil {
		return err
	}
	return s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := s.settingsRepo.DeleteFlat(txCtx, societyID, flatID); err != nil {
			return err
		}
		return s.settingsRepo.CreateDefaultFlat(txCtx, societyID, flatID, actorUserID)
	})
}

func (s *VisitorSettingSvc) ResolveApprovalRequirement(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, source models.VisitorEntrySource) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if !purpose.IsValid() || !source.IsValid() {
		return false, ErrInvalidVisitorSettings
	}
	societySettings, err := s.settingsRepo.GetSociety(ctx, societyID)
	if err != nil {
		return false, err
	}
	if societySettings == nil {
		return false, ErrVisitorSettingsNotFound
	}
	if !societySettings.IsActive {
		return false, ErrVisitorSettingsInactive
	}
	if err := ensureSourceEnabled(societySettings, source); err != nil {
		return false, err
	}
	if source == models.VisitorEntrySourceResidentLink {
		return false, nil
	}

	switch societySettings.ApprovalMode {
	case models.VisitorApprovalModeMandatory:
		return true, nil
	case models.VisitorApprovalModeOptional:
		return false, nil
	case models.VisitorApprovalModeHybrid:
		flatSettings, err := s.settingsRepo.GetFlatPurpose(ctx, societyID, flatID, purpose)
		if err != nil {
			return false, err
		}
		if flatSettings == nil {
			return false, ErrVisitorSettingsNotFound
		}
		if !flatSettings.IsEnabled {
			return false, ErrVisitorPurposeDisabled
		}
		return flatSettings.ApprovalRequired, nil
	default:
		return false, ErrInvalidVisitorSettings
	}
}

func (s *VisitorSettingSvc) ensureFlatSettingsActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	if actorUserID <= 0 {
		return ErrVisitorSettingsForbidden
	}

	flat, err := s.flatRepo.Get(ctx, &models.FlatFilter{ID: &flatID, SocietyID: &societyID})
	if err != nil {
		return err
	}
	if flat == nil {
		return ErrVisitorSettingsNotFound
	}

	activeStatus := string(models.SocietyMemberStatusActive)
	member, err := s.memberRepo.Get(ctx, models.GetSocietyMemberFilter{
		SocietyID: &societyID,
		UserID:    &actorUserID,
		Status:    &activeStatus,
	})
	if err != nil {
		return err
	}
	if member != nil && (member.Role == models.SocietyMemberRoleOwner || member.Role == models.SocietyMemberRoleAdmin) {
		return nil
	}

	residentStatus := string(models.FlatResidentStatusActive)
	isPrimary := true
	resident, err := s.residentRepo.Get(ctx, &models.FlatResidentFilter{
		SocietyID: &societyID,
		FlatID:    &flatID,
		UserID:    &actorUserID,
		Status:    &residentStatus,
		IsPrimary: &isPrimary,
	})
	if err != nil {
		return err
	}
	if resident != nil {
		return nil
	}
	return ErrVisitorSettingsForbidden
}

func ensureSourceEnabled(settings *models.SocietyVisitorSettings, source models.VisitorEntrySource) error {
	switch source {
	case models.VisitorEntrySourceResidentLink:
		if !settings.AllowResidentPreApproval {
			return ErrVisitorSourceDisabled
		}
	case models.VisitorEntrySourcePublicQR:
		if !settings.AllowPublicQREntry {
			return ErrVisitorSourceDisabled
		}
	case models.VisitorEntrySourceQuickLink:
		if !settings.AllowPublicQREntry {
			return ErrVisitorSourceDisabled
		}
	case models.VisitorEntrySourceGuardEntry:
		if !settings.AllowGuardEntry {
			return ErrVisitorSourceDisabled
		}
	default:
		return ErrInvalidVisitorSettings
	}
	return nil
}

var _ VisitorSettingService = (*VisitorSettingSvc)(nil)
