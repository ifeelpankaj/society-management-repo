package middleware

import (
	"net/http"

	"go-server/internal/models"
	authsvc "go-server/internal/services/authSvc"
	"go-server/pkg/utils"

	"github.com/gin-gonic/gin"
)

func AccessAuthMiddleware(jwtSecret, jwtIssuer string) gin.HandlerFunc {
	return tokenCookieMiddleware(jwtSecret, jwtIssuer, "access_token", authsvc.TokenTypeAccess, "Authentication required. Please login")
}

func RefreshAuthMiddleware(jwtSecret, jwtIssuer string) gin.HandlerFunc {
	return tokenCookieMiddleware(jwtSecret, jwtIssuer, "refresh_token", authsvc.TokenTypeRefresh, "Refresh token missing. Please login again")
}

func tokenCookieMiddleware(jwtSecret, jwtIssuer, cookieName, tokenType, missingMessage string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(cookieName)
		if err != nil || token == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, models.ErrCodeUnauthorized, missingMessage, nil)
			c.Abort()
			return
		}

		claims, err := authsvc.ValidateToken(token, jwtSecret, jwtIssuer, tokenType)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, models.ErrCodeInvalidToken, "Invalid authentication token", err)
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Set("token_type", claims.TokenType)
		c.Set("phone_number", claims.PhoneNumber)
		c.Set("email_verified", claims.EmailVerified)
		c.Set("phone_verified", claims.PhoneVerified)
		c.Next()
	}
}

func GetUserIDFromContext(c *gin.Context) (int64, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	id, ok := userID.(int64)
	return id, ok
}

func GetUserEmailFromContext(c *gin.Context) (string, bool) {
	email, exists := c.Get("email")
	if !exists {
		return "", false
	}
	value, ok := email.(string)
	return value, ok
}

func GetUserRoleFromContext(c *gin.Context) (string, bool) {
	role, exists := c.Get("role")
	if !exists {
		return "", false
	}
	value, ok := role.(string)
	return value, ok
}

func GetUserPhoneNumberFromContext(c *gin.Context) (string, bool) {
	phoneNumber, exists := c.Get("phone_number")
	if !exists {
		return "", false
	}
	value, ok := phoneNumber.(string)
	return value, ok
}

func GetUserEmailVerifiedFromContext(c *gin.Context) (bool, bool) {
	emailVerified, exists := c.Get("email_verified")
	if !exists {
		return false, false
	}
	value, ok := emailVerified.(bool)
	return value, ok
}

func GetUserPhoneVerifiedFromContext(c *gin.Context) (bool, bool) {
	phoneVerified, exists := c.Get("phone_verified")
	if !exists {
		return false, false
	}
	value, ok := phoneVerified.(bool)
	return value, ok
}
