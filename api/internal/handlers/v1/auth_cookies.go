package handlers

import (
	"net/http"
	"time"

	"go-server/internal/config"

	"github.com/gin-gonic/gin"
)

func setAccessTokenCookie(c *gin.Context, cfg *config.AuthConfig, token string) {
	c.SetSameSite(http.SameSiteLaxMode)

	c.SetCookie(
		"access_token",
		token,
		int(cfg.AccessExpiry/time.Second),
		"/",
		"",
		cfg.IsProduction,
		true,
	)
}

func setRefreshTokenCookie(c *gin.Context, cfg *config.AuthConfig, token string) {
	c.SetSameSite(http.SameSiteLaxMode)

	c.SetCookie(
		"refresh_token",
		token,
		int(cfg.RefreshExpiry/time.Second),
		"/api/v1/auth/refresh",
		"",
		cfg.IsProduction,
		true,
	)
}

func clearAuthCookies(c *gin.Context, cfg *config.AuthConfig) {
	c.SetSameSite(http.SameSiteLaxMode)

	c.SetCookie("access_token", "", -1, "/", "", cfg.IsProduction, true)
	c.SetCookie("refresh_token", "", -1, "/api/v1/auth/refresh", "", cfg.IsProduction, true)
}
