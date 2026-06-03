package routes

import (
	"go-server/internal/app"

	"github.com/gin-gonic/gin"
)

func SetupPublicRoutesV1(rg *gin.RouterGroup, h *app.V1Handlers) {
	public := rg.Group("/public")
	{
		public.GET("/societies/:societyCode/claim-options", h.Society.GetPublicClaimOptions)
	}
}
