package bootstrapsvc

import (
	"context"
	"fmt"

	"go-server/internal/models"
	service "go-server/internal/services"
	authsvc "go-server/internal/services/authSvc"
	flatsvc "go-server/internal/services/flatSvc"
	societysvc "go-server/internal/services/societySvc"
)

type BootstrapService interface {
	GetBootstrap(ctx context.Context, userID int64) (*models.BootstrapResponse, error)
}

type bootstrapService struct {
	sessionSvc authsvc.SessionSvc
	societySvc societysvc.SocietyService
	flatSvc    flatsvc.FlatResidentQueryService
}

func NewBootstrapService(
	sessionSvc authsvc.SessionSvc,
	societySvc societysvc.SocietyService,
	flatSvc flatsvc.FlatResidentQueryService,
) BootstrapService {
	return &bootstrapService{
		sessionSvc: sessionSvc,
		societySvc: societySvc,
		flatSvc:    flatSvc,
	}
}

func (s *bootstrapService) GetBootstrap(ctx context.Context, userID int64) (*models.BootstrapResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	user, err := s.sessionSvc.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	memberships, err := s.societySvc.ListMyMemberships(ctx, userID)
	if err != nil {
		return nil, err
	}

	residences, err := s.flatSvc.ListMyResidences(ctx, userID, &models.FlatResidentFilter{})
	if err != nil {
		return nil, err
	}

	return &models.BootstrapResponse{
		User:             user,
		Memberships:      memberships,
		Residences:       residences,
		DefaultDashboard: ResolveDefaultDashboard(user, memberships),
	}, nil
}

func ResolveDefaultDashboard(user *models.UserResponse, memberships []*models.SocietyMemberResponse) *models.DefaultDashboardResponse {
	if user != nil {
		switch user.GlobalRole {
		case models.GlobalRoleDeveloper, models.GlobalRoleSuperAdmin:
			return &models.DefaultDashboardResponse{
				Kind: models.DashboardKindDeveloper,
				Path: "/developer",
			}
		}
	}

	if hasActiveOwnerMembership(memberships) {
		return &models.DefaultDashboardResponse{
			Kind: models.DashboardKindSelectSociety,
			Path: "/select-society",
		}
	}

	adminMemberships := activeAdminMemberships(memberships)
	if len(adminMemberships) == 1 {
		societyID := adminMemberships[0].SocietyID
		return &models.DefaultDashboardResponse{
			Kind:      models.DashboardKindSocietyAdmin,
			Path:      fmt.Sprintf("/dashboard/%d", societyID),
			SocietyID: &societyID,
		}
	}

	if len(adminMemberships) > 1 {
		return &models.DefaultDashboardResponse{
			Kind: models.DashboardKindSelectSociety,
			Path: "/select-society",
		}
	}

	return &models.DefaultDashboardResponse{
		Kind: models.DashboardKindOnboarding,
		Path: "/onboarding",
	}
}

func activeAdminMemberships(memberships []*models.SocietyMemberResponse) []*models.SocietyMemberResponse {
	admins := make([]*models.SocietyMemberResponse, 0, len(memberships))
	for _, membership := range memberships {
		if membership == nil || membership.Status != models.SocietyMemberStatusActive {
			continue
		}
		if membership.Role == models.SocietyMemberRoleAdmin {
			admins = append(admins, membership)
		}
	}
	return admins
}

func hasActiveOwnerMembership(memberships []*models.SocietyMemberResponse) bool {
	for _, membership := range memberships {
		if membership == nil || membership.Status != models.SocietyMemberStatusActive {
			continue
		}
		if membership.Role == models.SocietyMemberRoleOwner {
			return true
		}
	}
	return false
}

var _ BootstrapService = (*bootstrapService)(nil)
