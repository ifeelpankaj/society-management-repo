package routes

import (
	"go-server/internal/app"

	"github.com/gin-gonic/gin"
)

func SetupPublicRoutesV1(rg *gin.RouterGroup, h *app.V1Handlers) {
	public := rg.Group("/public")
	{
		public.GET("/societies/:societyCode/claim-options", h.Society.GetPublicClaimOptions)
		public.GET("/societies/:societyCode/visitor-entry-options", h.VisitorEntry.GetEntryOptions)
		public.GET("/visitor-invites/:token", h.VisitorEntry.GetInviteByToken)
		public.POST("/visitor-invites/:token/submit", h.VisitorEntry.SubmitInviteForm)
		public.POST("/societies/:societyCode/visitor-entries/public-qr", h.VisitorEntry.CreatePublicQREntry)
		public.POST("/societies/:societyCode/visitor-entries/quick-link", h.VisitorEntry.CreateQuickLinkEntry)
		public.POST("/visitor-entries/qr/validate", h.VisitorEntry.ValidateQR)
	}
}
