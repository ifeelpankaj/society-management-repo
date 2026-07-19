package handlers

import (
	"net/http"

	"go-server/internal/models"
	notificationsvc "go-server/internal/services/notificationSvc"
	"go-server/pkg/utils"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	notificationSvc notificationsvc.NotificationService
}

func NewNotificationHandler(notificationSvc notificationsvc.NotificationService) *NotificationHandler {
	return &NotificationHandler{notificationSvc: notificationSvc}
}

// RegisterDeviceToken godoc
// @Summary Register or refresh a device push token
// @Description Stores the authenticated user's FCM device token for push notifications.
// @Tags Notifications
// @Accept json
// @Produce json
// @Param request body models.RegisterDeviceTokenRequest true "Device token payload"
// @Success 200 {object} models.RegisterDeviceTokenAPIResponse "Device token registered successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid device token request"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/me/device-tokens [post]
func (h *NotificationHandler) RegisterDeviceToken(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	var req models.RegisterDeviceTokenRequest
	if !bindJSON(c, &req) {
		return
	}

	result, err := h.notificationSvc.RegisterDeviceToken(c.Request.Context(), userID, req)
	if handleServiceError(c, err) {
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Device token registered successfully", gin.H{"device_token": result})
}

// UnregisterDeviceToken godoc
// @Summary Unregister a device push token
// @Description Removes the authenticated user's FCM device token, typically on logout.
// @Tags Notifications
// @Accept json
// @Produce json
// @Param request body models.UnregisterDeviceTokenRequest true "Device token payload"
// @Success 200 {object} models.MessageAPIResponse "Device token removed successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid device token request"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/me/device-tokens [delete]
func (h *NotificationHandler) UnregisterDeviceToken(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	var req models.UnregisterDeviceTokenRequest
	if !bindJSON(c, &req) {
		return
	}

	if handleServiceError(c, h.notificationSvc.UnregisterDeviceToken(c.Request.Context(), userID, req.Token)) {
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Device token removed successfully", nil)
}
