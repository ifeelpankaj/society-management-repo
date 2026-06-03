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
}
