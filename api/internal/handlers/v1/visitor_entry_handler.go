package handlers

import (
	"context"
	"net/http"
	"strconv"

	"go-server/internal/models"
	visitorentrysvc "go-server/internal/services/visitorEntrySvc"
	"go-server/pkg/utils"

	"github.com/gin-gonic/gin"
)

type VisitorEntryHandler struct {
	inviteSvc visitorentrysvc.VisitorInviteService
	entrySvc  visitorentrysvc.VisitorEntryService
}

func NewVisitorEntryHandler(inviteSvc visitorentrysvc.VisitorInviteService, entrySvc visitorentrysvc.VisitorEntryService) *VisitorEntryHandler {
	return &VisitorEntryHandler{inviteSvc: inviteSvc, entrySvc: entrySvc}
}

// GetEntryOptions godoc
// @Summary Get visitor entry options
// @Description [Public] Fetches allowed visitor purposes and flat/block options for the public visitor entry form.
// @Tags Visitor Entries
// @Produce json
// @Param societyCode path string true "Society code"
// @Success 200 {object} models.VisitorEntryOptionsAPIResponse "Visitor entry options fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid society code"
// @Failure 404 {object} models.ErrorResponseDoc "Society or flats not found"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Router /v1/public/societies/{societyCode}/visitor-entry-options [get]
func (h *VisitorEntryHandler) GetEntryOptions(c *gin.Context) {
	societyID, ok := parsePublicSocietyID(c)
	if !ok {
		return
	}
	result, err := h.entrySvc.GetEntryOptions(c.Request.Context(), societyID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor entry options fetched successfully", gin.H{"options": result})
}

// CreateInvite godoc
// @Summary Create visitor invite
// @Description [Resident] Creates a pre-approved visitor invite for a flat and returns the invite plus QR token details.
// @Tags Visitor Entries
// @Accept json
// @Produce json
// @Param societyId path int true "Society ID"
// @Param flatId path int true "Flat ID"
// @Param request body models.CreateVisitorInviteRequest true "Visitor invite request"
// @Success 201 {object} models.VisitorInviteTokenAPIResponse "Visitor invite created successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request, validation error, or path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Resident access required"
// @Failure 404 {object} models.ErrorResponseDoc "Society, flat, or visitor settings not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor invite cannot be created in current state"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/flats/{flatId}/visitor-invites [post]
func (h *VisitorEntryHandler) CreateInvite(c *gin.Context) {
	societyID, flatID, ok := visitorEntryFlatPath(c)
	if !ok {
		return
	}
	var req models.CreateVisitorInviteRequest
	if !bindJSON(c, &req) {
		return
	}
	if err := req.Validate(); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	token, invite, err := h.inviteSvc.CreateInvite(c.Request.Context(), societyID, flatID, req.Purpose, userID, req.ExpiresAt)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Visitor invite created successfully", gin.H{"invite": invite, "token": token.QR})
}

// GetInviteByToken godoc
// @Summary Get visitor invite by token
// @Description [Public] Fetches an active visitor invite from its public token before the visitor submits details.
// @Tags Visitor Entries
// @Produce json
// @Param token path string true "Visitor invite token"
// @Success 200 {object} models.VisitorInviteAPIResponse "Visitor invite fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid token"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor invite not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor invite is expired, used, or cancelled"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Router /v1/public/visitor-invites/{token} [get]
func (h *VisitorEntryHandler) GetInviteByToken(c *gin.Context) {
	invite, err := h.inviteSvc.GetInviteByToken(c.Request.Context(), c.Param("token"))
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor invite fetched successfully", gin.H{"invite": invite})
}

// SubmitInviteForm godoc
// @Summary Submit visitor invite form
// @Description [Public] Submits visitor details for an active resident invite and creates the visitor entry.
// @Tags Visitor Entries
// @Accept json
// @Produce json
// @Param token path string true "Visitor invite token"
// @Param request body models.VisitorFormRequest true "Visitor details"
// @Success 201 {object} models.VisitorEntryMutationAPIResponse "Visitor entry created successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request, token, or validation error"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor invite not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor invite is expired, used, or cancelled"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Router /v1/public/visitor-invites/{token}/submit [post]
func (h *VisitorEntryHandler) SubmitInviteForm(c *gin.Context) {
	var req models.VisitorFormRequest
	if !bindJSON(c, &req) {
		return
	}
	result, err := h.inviteSvc.SubmitInviteForm(c.Request.Context(), c.Param("token"), req)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Visitor entry created successfully", result)
}

// CancelInvite godoc
// @Summary Cancel visitor invite
// @Description [Resident] Cancels a visitor invite created for a society before it is used.
// @Tags Visitor Entries
// @Produce json
// @Param societyId path int true "Society ID"
// @Param inviteId path int true "Visitor invite ID"
// @Success 200 {object} models.MessageAPIResponse "Visitor invite cancelled successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Invite owner or resident access required"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor invite not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor invite cannot be cancelled"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-invites/{inviteId}/cancel [post]
func (h *VisitorEntryHandler) CancelInvite(c *gin.Context) {
	societyID, ok := parsePathInt64(c, "societyId")
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
	if err := h.inviteSvc.CancelInvite(c.Request.Context(), societyID, inviteID, userID); handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor invite cancelled successfully", gin.H{"message": "Visitor invite cancelled successfully"})
}

// CreatePublicQREntry godoc
// @Summary Create public QR visitor entry
// @Description [Public] Creates a visitor entry from a society public QR flow. Approval may be required depending on visitor settings.
// @Tags Visitor Entries
// @Accept json
// @Produce json
// @Param societyCode path string true "Society code"
// @Param request body models.VisitorFormRequest true "Visitor details"
// @Success 201 {object} models.VisitorEntryMutationAPIResponse "Visitor entry created successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request, society code, or validation error"
// @Failure 403 {object} models.ErrorResponseDoc "Public QR visitor entry is disabled"
// @Failure 404 {object} models.ErrorResponseDoc "Society, flat, or visitor settings not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor entry cannot be created in current state"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Router /v1/public/societies/{societyCode}/visitor-entries/public-qr [post]
func (h *VisitorEntryHandler) CreatePublicQREntry(c *gin.Context) {
	h.createPublicEntry(c, h.entrySvc.CreatePublicQREntry)
}

// CreateQuickLinkEntry godoc
// @Summary Create quick-link visitor entry
// @Description [Public] Creates a visitor entry from a quick-link flow. Approval may be required depending on visitor settings.
// @Tags Visitor Entries
// @Accept json
// @Produce json
// @Param societyCode path string true "Society code"
// @Param request body models.VisitorFormRequest true "Visitor details"
// @Success 201 {object} models.VisitorEntryMutationAPIResponse "Visitor entry created successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request, society code, or validation error"
// @Failure 403 {object} models.ErrorResponseDoc "Quick-link visitor entry is disabled"
// @Failure 404 {object} models.ErrorResponseDoc "Society, flat, or visitor settings not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor entry cannot be created in current state"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Router /v1/public/societies/{societyCode}/visitor-entries/quick-link [post]
func (h *VisitorEntryHandler) CreateQuickLinkEntry(c *gin.Context) {
	h.createPublicEntry(c, h.entrySvc.CreateQuickLinkEntry)
}

// CreateGuardEntry godoc
// @Summary Create guard visitor entry
// @Description [Owner/Admin/Staff] Creates a visitor entry from the guard desk for a society. Approval may be required depending on visitor settings.
// @Tags Visitor Entries
// @Accept json
// @Produce json
// @Param societyId path int true "Society ID"
// @Param request body models.VisitorFormRequest true "Visitor details"
// @Success 201 {object} models.VisitorEntryMutationAPIResponse "Visitor entry created successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request, validation error, or society ID"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Owner, admin, or staff access required"
// @Failure 404 {object} models.ErrorResponseDoc "Society, flat, or visitor settings not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor entry cannot be created in current state"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-entries/guard [post]
func (h *VisitorEntryHandler) CreateGuardEntry(c *gin.Context) {
	societyID, ok := parsePathInt64(c, "societyId")
	if !ok {
		return
	}
	var req models.VisitorFormRequest
	if !bindJSON(c, &req) {
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	result, err := h.entrySvc.CreateGuardEntry(c.Request.Context(), societyID, req, userID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Visitor entry created successfully", result)
}

// ApproveEntry godoc
// @Summary Approve visitor entry
// @Description [Resident] Approves a waiting visitor entry and returns QR token details for the visitor.
// @Tags Visitor Entries
// @Produce json
// @Param societyId path int true "Society ID"
// @Param entryId path int true "Visitor entry ID"
// @Success 200 {object} models.VisitorEntryMutationAPIResponse "Visitor entry approved successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Resident approval access required"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor entry not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor entry is not waiting for approval"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-entries/{entryId}/approve [post]
func (h *VisitorEntryHandler) ApproveEntry(c *gin.Context) {
	societyID, entryID, ok := visitorEntryPath(c)
	if !ok {
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	result, err := h.entrySvc.ApproveEntry(c.Request.Context(), societyID, entryID, userID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor entry approved successfully", result)
}

// RejectEntry godoc
// @Summary Reject visitor entry
// @Description [Resident] Rejects a waiting visitor entry with a reason.
// @Tags Visitor Entries
// @Accept json
// @Produce json
// @Param societyId path int true "Society ID"
// @Param entryId path int true "Visitor entry ID"
// @Param request body models.RejectVisitorEntryRequest true "Visitor rejection reason"
// @Success 200 {object} models.MessageAPIResponse "Visitor entry rejected successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request, validation error, or path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Resident rejection access required"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor entry not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor entry is not waiting for approval"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-entries/{entryId}/reject [post]
func (h *VisitorEntryHandler) RejectEntry(c *gin.Context) {
	societyID, entryID, ok := visitorEntryPath(c)
	if !ok {
		return
	}
	var req models.RejectVisitorEntryRequest
	if !bindJSON(c, &req) {
		return
	}
	if err := req.Validate(); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	if err := h.entrySvc.RejectEntry(c.Request.Context(), societyID, entryID, req.Reason, userID); handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor entry rejected successfully", gin.H{"message": "Visitor entry rejected successfully"})
}

// ValidateQR godoc
// @Summary Validate visitor QR token
// @Description [Public] Validates a visitor QR token and returns the matching approved visitor entry.
// @Tags Visitor Entries
// @Accept json
// @Produce json
// @Param request body models.QRTokenRequest true "Visitor QR token"
// @Success 200 {object} models.VisitorEntryAPIResponse "Visitor QR validated successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request, token, or visitor entry state"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor entry not found"
// @Failure 409 {object} models.ErrorResponseDoc "QR token is expired, unavailable, or already used"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Router /v1/public/visitor-entries/qr/validate [post]
func (h *VisitorEntryHandler) ValidateQR(c *gin.Context) {
	var req models.QRTokenRequest
	if !bindJSON(c, &req) {
		return
	}
	if err := req.Validate(); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	entry, err := h.entrySvc.ValidateQR(c.Request.Context(), req.Token)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor QR validated successfully", gin.H{"entry": entry})
}

// CheckIn godoc
// @Summary Check in visitor
// @Description [Owner/Admin/Staff] Checks in a visitor using a valid QR token.
// @Tags Visitor Entries
// @Accept json
// @Produce json
// @Param societyId path int true "Society ID"
// @Param request body models.QRTokenRequest true "Visitor QR token"
// @Success 200 {object} models.VisitorEntryAPIResponse "Visitor checked in successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid request, token, or visitor entry state"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Owner, admin, or staff access required"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor entry not found"
// @Failure 409 {object} models.ErrorResponseDoc "QR token is expired, unavailable, or already used"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-entries/check-in [post]
func (h *VisitorEntryHandler) CheckIn(c *gin.Context) {
	var req models.QRTokenRequest
	if !bindJSON(c, &req) {
		return
	}
	if err := req.Validate(); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	entry, err := h.entrySvc.CheckIn(c.Request.Context(), req.Token, userID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor checked in successfully", gin.H{"entry": entry})
}

// CheckOut godoc
// @Summary Check out visitor
// @Description [Owner/Admin/Staff] Checks out a checked-in visitor entry.
// @Tags Visitor Entries
// @Produce json
// @Param societyId path int true "Society ID"
// @Param entryId path int true "Visitor entry ID"
// @Success 200 {object} models.VisitorEntryAPIResponse "Visitor checked out successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path parameter or visitor entry state"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Owner, admin, or staff access required"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor entry not found"
// @Failure 409 {object} models.ErrorResponseDoc "Visitor is not checked in or already checked out"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-entries/{entryId}/check-out [post]
func (h *VisitorEntryHandler) CheckOut(c *gin.Context) {
	societyID, entryID, ok := visitorEntryPath(c)
	if !ok {
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	entry, err := h.entrySvc.CheckOut(c.Request.Context(), societyID, entryID, userID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor checked out successfully", gin.H{"entry": entry})
}

// GetEntry godoc
// @Summary Get visitor entry
// @Description [Owner/Admin/Staff] Fetches one visitor entry by ID.
// @Tags Visitor Entries
// @Produce json
// @Param societyId path int true "Society ID"
// @Param entryId path int true "Visitor entry ID"
// @Success 200 {object} models.VisitorEntryAPIResponse "Visitor entry fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Owner, admin, or staff access required"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor entry not found"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-entries/{entryId} [get]
func (h *VisitorEntryHandler) GetEntry(c *gin.Context) {
	societyID, entryID, ok := visitorEntryPath(c)
	if !ok {
		return
	}
	entry, err := h.entrySvc.GetEntry(c.Request.Context(), societyID, entryID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor entry fetched successfully", gin.H{"entry": entry})
}

// ListEntries godoc
// @Summary List visitor entries
// @Description [Owner/Admin/Staff] Lists visitor entries for a society with optional flat, status, source, purpose, limit, and offset filters.
// @Tags Visitor Entries
// @Produce json
// @Param societyId path int true "Society ID"
// @Param flat_id query int false "Flat ID"
// @Param status query string false "Visitor status" Enums(waiting_approval, approved, rejected, checked_in, checked_out, cancelled, expired, auto_closed)
// @Param source query string false "Visitor entry source" Enums(resident_link, public_qr, guard_entry, quick_link)
// @Param purpose query string false "Visitor purpose" Enums(guest, delivery, cab, service, maintenance, staff, other)
// @Param limit query int false "Maximum records to return" default(50)
// @Param offset query int false "Records to skip" default(0)
// @Success 200 {object} models.VisitorEntriesAPIResponse "Visitor entries fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid query or path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Owner, admin, or staff access required"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-entries [get]
func (h *VisitorEntryHandler) ListEntries(c *gin.Context) {
	societyID, ok := parsePathInt64(c, "societyId")
	if !ok {
		return
	}
	filter, ok := visitorEntryFilterFromQuery(c, societyID)
	if !ok {
		return
	}
	entries, err := h.entrySvc.ListEntries(c.Request.Context(), filter)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor entries fetched successfully", gin.H{"entries": entries})
}

// ListPendingApprovals godoc
// @Summary List pending visitor approvals
// @Description [Resident] Lists visitor entries waiting for approval for a resident flat.
// @Tags Visitor Entries
// @Produce json
// @Param societyId path int true "Society ID"
// @Param flatId path int true "Flat ID"
// @Success 200 {object} models.VisitorEntriesAPIResponse "Pending visitor approvals fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Resident access required"
// @Failure 404 {object} models.ErrorResponseDoc "Flat not found"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/flats/{flatId}/visitor-entries/pending [get]
func (h *VisitorEntryHandler) ListPendingApprovals(c *gin.Context) {
	societyID, flatID, ok := visitorEntryFlatPath(c)
	if !ok {
		return
	}
	userID, ok := currentUserID(c)
	if !ok {
		return
	}
	entries, err := h.entrySvc.ListPendingApprovals(c.Request.Context(), societyID, flatID, userID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Pending visitor approvals fetched successfully", gin.H{"entries": entries})
}

// ListEvents godoc
// @Summary List visitor entry events
// @Description [Owner/Admin/Staff] Lists audit events recorded for a visitor entry.
// @Tags Visitor Entries
// @Produce json
// @Param societyId path int true "Society ID"
// @Param entryId path int true "Visitor entry ID"
// @Success 200 {object} models.VisitorEntryEventsAPIResponse "Visitor entry events fetched successfully"
// @Failure 400 {object} models.ErrorResponseDoc "Invalid path parameter"
// @Failure 401 {object} models.ErrorResponseDoc "Missing, invalid, or expired access token"
// @Failure 403 {object} models.ErrorResponseDoc "Owner, admin, or staff access required"
// @Failure 404 {object} models.ErrorResponseDoc "Visitor entry not found"
// @Failure 500 {object} models.ErrorResponseDoc "Internal server error"
// @Security AccessToken
// @Router /v1/societies/{societyId}/visitor-entries/{entryId}/events [get]
func (h *VisitorEntryHandler) ListEvents(c *gin.Context) {
	societyID, entryID, ok := visitorEntryPath(c)
	if !ok {
		return
	}
	events, err := h.entrySvc.ListEvents(c.Request.Context(), societyID, entryID)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Visitor entry events fetched successfully", gin.H{"events": events})
}

func (h *VisitorEntryHandler) createPublicEntry(c *gin.Context, create func(context.Context, int64, models.VisitorFormRequest) (*models.VisitorEntryMutationResponse, error)) {
	societyID, ok := parsePublicSocietyID(c)
	if !ok {
		return
	}
	var req models.VisitorFormRequest
	if !bindJSON(c, &req) {
		return
	}
	result, err := create(c.Request.Context(), societyID, req)
	if handleServiceError(c, err) {
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Visitor entry created successfully", result)
}

func parsePublicSocietyID(c *gin.Context) (int64, bool) {
	if raw := c.Param("societyId"); raw != "" {
		return parsePathInt64(c, "societyId")
	}
	return parsePathInt64(c, "societyCode")
}

func visitorEntryPath(c *gin.Context) (int64, int64, bool) {
	societyID, ok := parsePathInt64(c, "societyId")
	if !ok {
		return 0, 0, false
	}
	entryID, ok := parsePathInt64(c, "entryId")
	if !ok {
		return 0, 0, false
	}
	return societyID, entryID, true
}

func visitorEntryFlatPath(c *gin.Context) (int64, int64, bool) {
	societyID, ok := parsePathInt64(c, "societyId")
	if !ok {
		return 0, 0, false
	}
	flatID, ok := parsePathInt64(c, "flatId")
	if !ok {
		return 0, 0, false
	}
	return societyID, flatID, true
}

func visitorEntryFilterFromQuery(c *gin.Context, societyID int64) (models.VisitorEntryFilter, bool) {
	filter := models.VisitorEntryFilter{SocietyID: societyID, Limit: 50}
	if raw := c.Query("flat_id"); raw != "" {
		value, err := strconv.ParseInt(raw, 10, 64)
		if err != nil || value <= 0 {
			utils.BadRequestResponse(c, "flat_id must be a positive integer")
			return filter, false
		}
		filter.FlatID = &value
	}
	if raw := c.Query("status"); raw != "" {
		value := models.VisitorStatus(raw)
		if !value.IsValid() {
			utils.BadRequestResponse(c, "invalid status")
			return filter, false
		}
		filter.Status = &value
	}
	if raw := c.Query("source"); raw != "" {
		value := models.VisitorEntrySource(raw)
		if !value.IsValid() {
			utils.BadRequestResponse(c, "invalid source")
			return filter, false
		}
		filter.Source = &value
	}
	if raw := c.Query("purpose"); raw != "" {
		value := models.VisitorPurpose(raw)
		if !value.IsValid() {
			utils.BadRequestResponse(c, "invalid purpose")
			return filter, false
		}
		filter.Purpose = &value
	}
	if raw := c.Query("limit"); raw != "" {
		value, err := strconv.ParseInt(raw, 10, 32)
		if err != nil || value <= 0 {
			utils.BadRequestResponse(c, "limit must be a positive integer")
			return filter, false
		}
		filter.Limit = int32(value)
	}
	if raw := c.Query("offset"); raw != "" {
		value, err := strconv.ParseInt(raw, 10, 32)
		if err != nil || value < 0 {
			utils.BadRequestResponse(c, "offset must be zero or positive")
			return filter, false
		}
		filter.Offset = int32(value)
	}
	return filter, true
}
