package handlers

import (
	"net/http"

	"go-server/internal/models"
	flatsvc "go-server/internal/services/flatSvc"
	"go-server/pkg/utils"
	"go-server/pkg/validator"

	"github.com/gin-gonic/gin"
)

type MemberInviteHandler struct {
	flatSvc flatsvc.FlatService
}

func NewMemberInviteHandler(flatSvc flatsvc.FlatService) *MemberInviteHandler {
	return &MemberInviteHandler{flatSvc: flatSvc}
}

// ListFlatResidentsForResident godoc
// @Summary List flat residents (resident)
// @Description [Resident] Lists active members for a flat. Requires permission to view flat visitor data.
// @Tags Flat Members
// @Produce json
// @Param societyId path int true "Society ID"
// @Param flatId path int true "Flat ID"
// @Param role query string false "Resident role: owner, tenant, family"
// @Param is_primary query bool false "Primary resident flag"
// @Param search query string false "Search user, contact, flat, block, role, or status"
// @Param limit query int false "Limit" default(20)
// @Param offset query int false "Offset" default(0)
// @Success 200 {object} models.FlatResidentsAPIResponse "Residents fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path or query parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Resident access required"
// @Failure 404 {object} models.ErrorResponseDoc "Flat not found"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/flats/{flatId}/members [get]
func (h *MemberInviteHandler) ListFlatResidentsForResident(c *gin.Context) {
	societyID, flatID, ok := parseSocietyFlatPath(c)
	if !ok {
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	filter, ok := flatResidentFilterFromSocietyFlatPath(c)
	if !ok {
		return
	}
	result, err := h.flatSvc.ListFlatResidentsForActor(c.Request.Context(), societyID, flatID, userID, filter)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Residents fetched successfully", gin.H{"residents": result})
}

// ListPendingMemberInvites godoc
// @Summary List pending flat member invites
// @Description [Resident] Lists pending member invites for a flat. Requires flat owner or primary resident access.
// @Tags Flat Members
// @Produce json
// @Param societyId path int true "Society ID"
// @Param flatId path int true "Flat ID"
// @Success 200 {object} models.FlatMemberInvitesAPIResponse "Member invites fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Flat member management access required"
// @Failure 404 {object} models.ErrorResponseDoc "Flat not found"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/flats/{flatId}/member-invites [get]
func (h *MemberInviteHandler) ListPendingMemberInvites(c *gin.Context) {
	societyID, flatID, ok := parseSocietyFlatPath(c)
	if !ok {
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	result, err := h.flatSvc.ListPendingMemberInvites(c.Request.Context(), societyID, flatID, userID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Member invites fetched successfully", gin.H{"invites": result})
}

// CreateMemberInvite godoc
// @Summary Create flat member invite
// @Description [Resident] Creates a member invite for a flat and returns the invite plus shareable token details.
// @Tags Flat Members
// @Accept json
// @Produce json
// @Param societyId path int true "Society ID"
// @Param flatId path int true "Flat ID"
// @Param request body models.CreateFlatMemberInviteRequest true "Member invite request"
// @Success 201 {object} models.FlatMemberInviteTokenAPIResponse "Member invite created successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request or path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Flat member management access required"
// @Failure 404 {object} models.ErrorResponseDoc "Flat not found"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/flats/{flatId}/member-invites [post]
func (h *MemberInviteHandler) CreateMemberInvite(c *gin.Context) {
	societyID, flatID, ok := parseSocietyFlatPath(c)
	if !ok {
		return
	}
	var req models.CreateFlatMemberInviteRequest
	if !bindJSON(c, &req) {
		return
	}
	req.Sanitize()
	if err := req.Validate(); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	if validationErrors := validator.ValidateStruct(&req); len(validationErrors) > 0 {
		utils.ValidationErrorResponse(c, validationErrors.ToMap())
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	token, invite, err := h.flatSvc.CreateMemberInvite(c.Request.Context(), societyID, flatID, userID, &req)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Member invite created successfully", gin.H{"invite": invite, "token": token})
}

// CancelMemberInvite godoc
// @Summary Cancel flat member invite
// @Description [Resident] Cancels a pending member invite for a flat.
// @Tags Flat Members
// @Produce json
// @Param societyId path int true "Society ID"
// @Param flatId path int true "Flat ID"
// @Param inviteId path int true "Member invite ID"
// @Success 200 {object} models.MessageAPIResponse "Member invite cancelled successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Flat member management access required"
// @Failure 404 {object} models.ErrorResponseDoc "Member invite not found"
// @Failure 409 {object} models.ErrorResponseDoc "Member invite cannot be cancelled"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/flats/{flatId}/member-invites/{inviteId}/cancel [post]
func (h *MemberInviteHandler) CancelMemberInvite(c *gin.Context) {
	societyID, flatID, ok := parseSocietyFlatPath(c)
	if !ok {
		return
	}
	inviteID, ok := parsePathInt64(c, "inviteId")
	if !ok {
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	if err := h.flatSvc.CancelMemberInvite(c.Request.Context(), societyID, flatID, inviteID, userID); handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Member invite cancelled successfully", gin.H{"message": "Member invite cancelled successfully"})
}

// GetPublicMemberInviteByToken godoc
// @Summary Get flat member invite by token
// @Description [Public] Fetches an active flat member invite from its public token before acceptance.
// @Tags Flat Members
// @Produce json
// @Param token path string true "Member invite token"
// @Success 200 {object} models.PublicFlatMemberInviteAPIResponse "Member invite fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid token"
// @Failure 404 {object} models.ErrorResponseDoc "Member invite not found"
// @Failure 409 {object} models.ErrorResponseDoc "Member invite is expired, accepted, or cancelled"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Router /v1/public/flat-member-invites/{token} [get]
func (h *MemberInviteHandler) GetPublicMemberInviteByToken(c *gin.Context) {
	invite, err := h.flatSvc.GetPublicMemberInviteByToken(c.Request.Context(), c.Param("token"))
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Member invite fetched successfully", gin.H{"invite": invite})
}

// AcceptMemberInvite godoc
// @Summary Accept flat member invite
// @Description [User] Accepts a flat member invite using the public token. The authenticated user becomes an active flat resident.
// @Tags Flat Members
// @Produce json
// @Param token path string true "Member invite token"
// @Success 200 {object} models.AcceptFlatMemberInviteAPIResponse "Member invite accepted successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid token"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 404 {object} models.ErrorResponseDoc "Member invite not found"
// @Failure 409 {object} models.ErrorResponseDoc "Member invite unavailable or resident conflict"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/public/flat-member-invites/{token}/accept [post]
func (h *MemberInviteHandler) AcceptMemberInvite(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	result, err := h.flatSvc.AcceptMemberInvite(c.Request.Context(), c.Param("token"), userID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Member invite accepted successfully", gin.H{"acceptance": result})
}

func parseSocietyFlatPath(c *gin.Context) (int64, int64, bool) {
	societyID, ok := parsePathInt64(c, "societyId")
	if !ok {
		return 0, 0, false
	}
	flatID, ok := parsePathInt64(c, "flatId")
	return societyID, flatID, ok
}
