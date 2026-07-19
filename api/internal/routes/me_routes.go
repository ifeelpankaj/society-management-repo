package routes

import (
	"go-server/internal/handlers/v1"
	"go-server/internal/middlewares/guards"

	"github.com/gin-gonic/gin"
)

func SetupMeRoutesV1(rg *gin.RouterGroup, h *handlers.NotificationHandler, g *guards.Guards) {
	me := rg.Group("/me")
	me.Use(g.Authenticated()...)
	{
		me.POST("/device-tokens", h.RegisterDeviceToken)
		me.DELETE("/device-tokens", h.UnregisterDeviceToken)
	}
}
