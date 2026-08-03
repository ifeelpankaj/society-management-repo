package routes

import (
	"go-server/internal/app"
	"go-server/internal/middlewares/guards"

	"github.com/gin-gonic/gin"
)

func SetupResidentRoutesV1(rg *gin.RouterGroup, h *app.V1Handlers, g *guards.Guards) {
	plans := rg.Group("/plans")
	{
		plans.GET("", h.Plan.ListPlans)
		plans.GET("/lookup", h.Plan.GetPlan)
	}

	resident := rg.Group("")
	resident.Use(g.Authenticated()...)
	{
		resident.POST("/societies", h.Society.CreateSocietyRequest)
		resident.GET("/societies/my", h.Society.ListMySocieties)

		resident.POST("/flat-claims", h.Flat.SubmitFlatClaim)
		resident.POST("/flat-claims/:claimId/cancel", h.Flat.CancelMyFlatClaim)
		resident.GET("/me/flat-claims", h.Flat.ListMyFlatClaims)
		resident.GET("/me/residences", h.Flat.ListMyResidences)
	}

	residentSociety := rg.Group("")
	residentSociety.Use(g.Authenticated()...)
	residentSociety.Use(g.OperationalSocietyForParam("societyId")...)
	{
		residentSociety.GET("/societies/:societyId/flats/:flatId/visitor-settings", h.VisitorSetting.GetFlatSettings)
		residentSociety.PATCH("/societies/:societyId/flats/:flatId/visitor-settings/:purpose", h.VisitorSetting.UpdateFlatPurposeSetting)
		residentSociety.POST("/societies/:societyId/flats/:flatId/visitor-settings/reset", h.VisitorSetting.ResetFlatSettingsToDefault)
		residentSociety.GET("/societies/:societyId/flats/:flatId/members", h.MemberInvite.ListFlatResidentsForResident)
		residentSociety.GET("/societies/:societyId/flats/:flatId/member-invites", h.MemberInvite.ListPendingMemberInvites)
		residentSociety.POST("/societies/:societyId/flats/:flatId/member-invites", h.MemberInvite.CreateMemberInvite)
		residentSociety.POST("/societies/:societyId/flats/:flatId/member-invites/:inviteId/cancel", h.MemberInvite.CancelMemberInvite)
		residentSociety.POST("/societies/:societyId/flats/:flatId/visitor-invites", h.VisitorEntry.CreateInvite)
		residentSociety.POST("/societies/:societyId/visitor-invites/:inviteId/cancel", h.VisitorEntry.CancelInvite)
		residentSociety.GET("/societies/:societyId/flats/:flatId/visitor-context", h.VisitorEntry.GetFlatVisitorContextForResident)
		residentSociety.GET("/societies/:societyId/flats/:flatId/visitor-entries/pending", h.VisitorEntry.ListPendingApprovals)
		residentSociety.GET("/societies/:societyId/flats/:flatId/visitor-entries", h.VisitorEntry.ListFlatVisitorEntries)
		residentSociety.GET("/societies/:societyId/flats/:flatId/visitor-entries/:entryId", h.VisitorEntry.GetFlatVisitorEntry)
		residentSociety.POST("/societies/:societyId/visitor-entries/:entryId/approve", h.VisitorEntry.ApproveEntry)
		residentSociety.POST("/societies/:societyId/visitor-entries/:entryId/reject", h.VisitorEntry.RejectEntry)
	}
}
