package visitorsettingsvc

import (
	"context"
	"errors"

	"go-server/internal/models"
	repository "go-server/internal/repositories"
	flatauthz "go-server/internal/services/flatAuthz"
	service "go-server/internal/services"
)

type VisitorSettingService interface {
	CreateDefaultSocietySettings(ctx context.Context, societyID int64, actorUserID int64) error
	GetSocietySettings(ctx context.Context, societyID int64) (*models.SocietyVisitorSettingsResponse, error)
	UpdateSocietySettings(ctx context.Context, societyID int64, req models.UpdateSocietyVisitorSettingsRequest, actorUserID int64) (*models.SocietyVisitorSettingsResponse, error)
	CreateDefaultFlatSettings(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error
	EnsureDefaultFlatSettingsIfMissing(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error
	GetFlatSettings(ctx context.Context, societyID int64, flatID int64) ([]models.FlatVisitorSettingsResponse, error)
	GetFlatSettingsForActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64) ([]models.FlatVisitorSettingsResponse, error)
	UpdateFlatPurposeSetting(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, req models.UpdateFlatVisitorSettingRequest, actorUserID int64) (*models.FlatVisitorSettingsResponse, error)
	ResetFlatSettingsToDefault(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error
	ResolveApprovalRequirement(ctx context.Context, societyID int64, flatID int64, purpose models.VisitorPurpose, source models.VisitorEntrySource) (bool, error)
	ListSocietyFlatSettings(ctx context.Context, filter models.SocietyFlatVisitorSettingsFilter) (*models.SocietyFlatVisitorSettingsListResult, error)
}

type VisitorSettingSvc struct {
	settingsRepo repository.VisitorSettingRepository
	memberRepo   repository.SocietyMemberRepository
	residentRepo repository.FlatResidentRepository
	flatRepo     repository.FlatRepository
	flatAuthz    *flatauthz.FlatVisitorAuthz
	txManager    repository.TransactionManager
}

func NewVisitorSettingService(
	settingsRepo repository.VisitorSettingRepository,
	memberRepo repository.SocietyMemberRepository,
	residentRepo repository.FlatResidentRepository,
	flatRepo repository.FlatRepository,
	flatAuthz *flatauthz.FlatVisitorAuthz,
	txManager repository.TransactionManager,
) VisitorSettingService {
	return &VisitorSettingSvc{
		settingsRepo: settingsRepo,
		memberRepo:   memberRepo,
		residentRepo: residentRepo,
		flatRepo:     flatRepo,
		flatAuthz:    flatAuthz,
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

func (s *VisitorSettingSvc) EnsureDefaultFlatSettingsIfMissing(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	items, err := s.settingsRepo.ListFlat(ctx, societyID, flatID)
	if err != nil {
		return err
	}
	if len(items) > 0 {
		return nil
	}

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
	if err := s.EnsureDefaultFlatSettingsIfMissing(ctx, societyID, flatID, actorUserID); err != nil {
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
	return mapFlatAuthzError(s.flatAuthz.CanManageFlatVisitors(ctx, societyID, flatID, actorUserID))
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
	case flatauthz.ErrForbidden.Code:
		return ErrVisitorSettingsForbidden
	case flatauthz.ErrFlatNotFound.Code:
		return ErrVisitorSettingsNotFound
	default:
		return err
	}
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

func (s *VisitorSettingSvc) ListSocietyFlatSettings(ctx context.Context, filter models.SocietyFlatVisitorSettingsFilter) (*models.SocietyFlatVisitorSettingsListResult, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	if filter.Limit <= 0 {
		filter.Limit = 50
	}
	settings, err := s.settingsRepo.ListSocietyFlat(ctx, filter)
	if err != nil {
		return nil, err
	}
	total, err := s.settingsRepo.CountSocietyFlat(ctx, filter)
	if err != nil {
		return nil, err
	}
	return &models.SocietyFlatVisitorSettingsListResult{
		Settings: settings,
		Total:    total,
		Limit:    filter.Limit,
		Offset:   filter.Offset,
	}, nil
}

var _ VisitorSettingService = (*VisitorSettingSvc)(nil)
