package routes

import (
	"go-server/internal/app"
	"go-server/internal/middlewares/guards"
	"go-server/internal/models"

	"github.com/gin-gonic/gin"
)

func SetupAdminRoutesV1(rg *gin.RouterGroup, h *app.V1Handlers, g *guards.Guards) {
	ownerAdminRoles := []string{
		string(models.SocietyMemberRoleOwner),
		string(models.SocietyMemberRoleAdmin),
	}
	ownerAdminStaffRoles := []string{
		string(models.SocietyMemberRoleOwner),
		string(models.SocietyMemberRoleAdmin),
		string(models.SocietyMemberRoleStaff),
	}

	ownerOnly := rg.Group("/societies/:societyId")
	ownerOnly.Use(g.SocietyRolesForParam("societyId", string(models.SocietyMemberRoleOwner))...)
	{
		ownerOnly.DELETE("", h.Society.DeleteSociety)
	}

	admin := rg.Group("/societies/:societyId")
	admin.Use(g.SocietyRolesForParam("societyId", ownerAdminRoles...)...)
	{
		admin.PATCH("", h.Society.UpdateSociety)
		admin.POST("/members", h.Society.AddMember)
		admin.PATCH("/members/:userId/role", h.Society.ChangeMemberRole)
		admin.POST("/members/:userId/suspend", h.Society.SuspendMember)
		admin.POST("/members/:userId/reactivate", h.Society.ReactivateMember)
		admin.DELETE("/members/:userId", h.Society.RemoveMember)
		admin.POST("/transfer-ownership", h.Society.TransferOwnership)
		admin.GET("/members/summary", h.Society.GetSocietyMemberSummary)
		admin.GET("/members/:memberId", h.Society.GetSocietyMember)
		admin.GET("/members", h.Society.ListSocietyMembers)
		admin.GET("/onboarding/bootstrap", h.Society.GetOnboardingBootstrap)
		admin.GET("/dashboard/bootstrap", h.Society.GetDashboardBootstrap)

	}

	staffRead := rg.Group("/societies/:societyId")
	staffRead.Use(g.SocietyRolesForParam("societyId", ownerAdminStaffRoles...)...)
	{
		staffRead.GET("", h.Society.GetSociety)
		staffRead.GET("/flats", h.Flat.ListSocietyFlats)
		staffRead.GET("/flats/stats", h.Flat.GetFlatStats)
		staffRead.GET("/flats/:flatId", h.Flat.GetFlat)
		staffRead.GET("/flats/:flatId/residents/:residentId", h.Flat.GetFlatResident)
		staffRead.GET("/flat-claims", h.Flat.ListSocietyFlatClaims)
		staffRead.GET("/flat-claims/:claimId", h.Flat.GetSocietyFlatClaim)
	}

	operationalAdmin := rg.Group("/societies/:societyId")
	operationalAdmin.Use(g.SocietyRolesForParam("societyId", ownerAdminRoles...)...)
	operationalAdmin.Use(g.SocietyOperationalForParam("societyId")...)
	{
		operationalAdmin.POST("/guards", h.Society.CreateGuard)

		operationalAdmin.POST("/flats", h.Flat.CreateFlat)
		operationalAdmin.POST("/flats/bulk", h.Flat.BulkCreateFlats)
		operationalAdmin.PATCH("/flats/:flatId", h.Flat.UpdateFlat)
		operationalAdmin.DELETE("/flats/:flatId", h.Flat.DeleteFlat)
		operationalAdmin.POST("/flats/:flatId/block", h.Flat.BlockFlat)
		operationalAdmin.POST("/flats/:flatId/unblock", h.Flat.UnblockFlat)

		operationalAdmin.POST("/flat-claims/:claimId/approve", h.Flat.ApproveFlatClaim)
		operationalAdmin.POST("/flat-claims/:claimId/reject", h.Flat.RejectFlatClaim)

		operationalAdmin.POST("/flats/:flatId/residents/users/:userId", h.Flat.AddResidentToFlat)
		operationalAdmin.DELETE("/flats/:flatId/residents/:residentId", h.Flat.RemoveResidentFromFlat)
		operationalAdmin.POST("/flats/:flatId/residents/:residentId/primary", h.Flat.ChangePrimaryResident)
		operationalAdmin.PATCH("/flats/:flatId/residents/:residentId/role", h.Flat.UpdateFlatResidentRole)
		operationalAdmin.POST("/flats/:flatId/residents/:residentId/move-out", h.Flat.MoveOutResident)
	}
}
