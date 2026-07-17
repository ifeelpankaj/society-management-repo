package bootstrapsvc

import (
	"testing"

	"go-server/internal/models"
)

func TestResolveDefaultDashboard(t *testing.T) {
	tests := []struct {
		name             string
		user             *models.UserResponse
		memberships      []*models.SocietyMemberResponse
		wantKind         models.DashboardKind
		wantPath         string
		wantSocietyID    int64
		wantSocietyIDSet bool
	}{
		{
			name:     "developer gets developer dashboard",
			user:     &models.UserResponse{GlobalRole: models.GlobalRoleDeveloper},
			wantKind: models.DashboardKindDeveloper,
			wantPath: "/developer",
		},
		{
			name:     "super admin gets developer dashboard",
			user:     &models.UserResponse{GlobalRole: models.GlobalRoleSuperAdmin},
			wantKind: models.DashboardKindDeveloper,
			wantPath: "/developer",
		},
		{
			name: "single active admin gets society dashboard",
			user: &models.UserResponse{GlobalRole: models.GlobalRoleUser},
			memberships: []*models.SocietyMemberResponse{
				{SocietyID: 42, Role: models.SocietyMemberRoleAdmin, Status: models.SocietyMemberStatusActive},
			},
			wantKind:         models.DashboardKindSocietyAdmin,
			wantPath:         "/dashboard/42",
			wantSocietyID:    42,
			wantSocietyIDSet: true,
		},
		{
			name: "single active owner selects society",
			user: &models.UserResponse{GlobalRole: models.GlobalRoleUser},
			memberships: []*models.SocietyMemberResponse{
				{SocietyID: 84, Role: models.SocietyMemberRoleOwner, Status: models.SocietyMemberStatusActive},
			},
			wantKind: models.DashboardKindSelectSociety,
			wantPath: "/select-society",
		},
		{
			name: "multiple active admin memberships select society",
			user: &models.UserResponse{GlobalRole: models.GlobalRoleUser},
			memberships: []*models.SocietyMemberResponse{
				{SocietyID: 42, Role: models.SocietyMemberRoleAdmin, Status: models.SocietyMemberStatusActive},
				{SocietyID: 84, Role: models.SocietyMemberRoleAdmin, Status: models.SocietyMemberStatusActive},
			},
			wantKind: models.DashboardKindSelectSociety,
			wantPath: "/select-society",
		},
		{
			name: "active owner with active admin selects society",
			user: &models.UserResponse{GlobalRole: models.GlobalRoleUser},
			memberships: []*models.SocietyMemberResponse{
				{SocietyID: 42, Role: models.SocietyMemberRoleAdmin, Status: models.SocietyMemberStatusActive},
				{SocietyID: 84, Role: models.SocietyMemberRoleOwner, Status: models.SocietyMemberStatusActive},
			},
			wantKind: models.DashboardKindSelectSociety,
			wantPath: "/select-society",
		},
		{
			name: "no eligible membership gets onboarding",
			user: &models.UserResponse{GlobalRole: models.GlobalRoleUser},
			memberships: []*models.SocietyMemberResponse{
				{SocietyID: 42, Role: models.SocietyMemberRoleStaff, Status: models.SocietyMemberStatusActive},
				{SocietyID: 84, Role: models.SocietyMemberRoleAdmin, Status: models.SocietyMemberStatusSuspended},
			},
			wantKind: models.DashboardKindOnboarding,
			wantPath: "/onboarding",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ResolveDefaultDashboard(tt.user, tt.memberships)
			if got == nil {
				t.Fatal("expected dashboard, got nil")
			}
			if got.Kind != tt.wantKind {
				t.Fatalf("kind = %q, want %q", got.Kind, tt.wantKind)
			}
			if got.Path != tt.wantPath {
				t.Fatalf("path = %q, want %q", got.Path, tt.wantPath)
			}
			if tt.wantSocietyIDSet {
				if got.SocietyID == nil {
					t.Fatal("expected society_id, got nil")
				}
				if *got.SocietyID != tt.wantSocietyID {
					t.Fatalf("society_id = %d, want %d", *got.SocietyID, tt.wantSocietyID)
				}
			} else if got.SocietyID != nil {
				t.Fatalf("society_id = %d, want nil", *got.SocietyID)
			}
		})
	}
}
