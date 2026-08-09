package visitorentrysvc

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strconv"
	"time"

	"go-server/internal/models"
	societysvc "go-server/internal/services/societySvc"

	"github.com/jackc/pgx/v5/pgconn"
)

const qrDisplayTokenMetadataKey = "qr_display_token"

func (s *VisitorEntrySvc) makeQR(ctx context.Context, societyID int64) (*qrToken, error) {
	settings, err := s.settingSvc.GetSocietySettings(ctx, societyID)
	if err != nil {
		return nil, err
	}
	if settings == nil || settings.QRExpiryMinutes <= 0 {
		return nil, ErrVisitorQRUnavailable
	}
	token, hash, err := newToken()
	if err != nil {
		return nil, err
	}
	return &qrToken{token: token, hash: hash, expiresAt: time.Now().Add(time.Duration(settings.QRExpiryMinutes) * time.Minute)}, nil
}

func (s *VisitorEntrySvc) recordEvents(ctx context.Context, entry *models.VisitorEntry, actorUserID *int64, events ...models.VisitorEventType) error {
	for _, eventType := range events {
		if _, err := s.eventRepo.Create(ctx, entry.ID, entry.SocietyID, actorUserID, eventType, nil, nil); err != nil {
			return err
		}
	}
	return nil
}

type qrToken struct {
	token     string
	hash      string
	expiresAt time.Time
}

func (q *qrToken) response() *models.QRTokenResponse {
	return &models.QRTokenResponse{Token: q.token, ExpiresAt: q.expiresAt}
}

func newToken() (string, string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", "", err
	}
	token := hex.EncodeToString(raw)
	return token, hashToken(token), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func inviteUsable(invite *models.VisitorInvite) bool {
	return invite != nil && invite.Status == models.VisitorInviteStatusActive && invite.ExpiresAt.After(time.Now())
}

func blockKey(block *string) string {
	if block == nil {
		return ""
	}
	return *block
}

func istDayRange(now time.Time) (time.Time, time.Time) {
	loc, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		loc = time.UTC
	}
	local := now.In(loc)
	start := time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, loc)
	return start, start.Add(24 * time.Hour)
}

func guardActor(source models.VisitorEntrySource, actorUserID *int64) *int64 {
	if source == models.VisitorEntrySourceGuardEntry {
		return actorUserID
	}
	return nil
}

func ParseVisitorEntryFilterValue[T ~string](raw string, validate func(T) bool) (*T, error) {
	if raw == "" {
		return nil, nil
	}
	value := T(raw)
	if !validate(value) {
		return nil, ErrInvalidVisitorRequest
	}
	return &value, nil
}

func ParsePositiveInt64(raw string) (*int64, error) {
	if raw == "" {
		return nil, nil
	}
	value, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || value <= 0 {
		return nil, ErrInvalidVisitorRequest
	}
	return &value, nil
}

func IsInvalidStateNoRows(err error) bool {
	return errors.Is(err, ErrVisitorInvalidState)
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func qrDisplayTokenFromMetadata(metadata map[string]any) (string, bool) {
	if metadata == nil {
		return "", false
	}
	value, ok := metadata[qrDisplayTokenMetadataKey].(string)
	return value, ok && value != ""
}

func (s *VisitorEntrySvc) ensureSocietyActive(ctx context.Context, societyID int64) error {
	active := string(models.SocietyStatusActive)
	id := societyID
	society, err := s.societyRepo.Get(ctx, models.GetSocietyFilter{ID: &id, Status: &active})
	if err != nil {
		return err
	}
	if society == nil {
		return societysvc.ErrSocietyInactive
	}
	return nil
}

func (s *VisitorEntrySvc) ensureEntryFlat(ctx context.Context, societyID int64, flatID int64) error {
	if flatID <= 0 {
		return ErrInvalidVisitorRequest
	}
	active := true
	occupied := string(models.FlatStatusOccupied)
	flat, err := s.flatRepo.Get(ctx, &models.FlatFilter{ID: &flatID, SocietyID: &societyID, Status: &occupied, IsActive: &active})
	if err != nil {
		return err
	}
	if flat == nil {
		return ErrVisitorFlatNotFound
	}
	return nil
}

func (s *VisitorEntrySvc) attachQRDisplayToken(ctx context.Context, societyID int64, entryID int64, qr *qrToken) (*models.VisitorEntry, error) {
	return s.entryRepo.MergeMetadata(ctx, societyID, entryID, map[string]any{qrDisplayTokenMetadataKey: qr.token})
}

func (s *VisitorEntrySvc) resolveExistingQR(ctx context.Context, societyID int64, entry *models.VisitorEntry) (*models.QRTokenResponse, error) {
	if entry == nil || entry.QRExpiresAt == nil {
		return nil, ErrVisitorQRUnavailable
	}
	if time.Now().After(*entry.QRExpiresAt) {
		result, err := s.GenerateQR(ctx, societyID, entry.ID)
		if err != nil {
			return nil, err
		}
		if result != nil && result.QR != nil {
			if _, err := s.attachQRDisplayToken(ctx, societyID, entry.ID, &qrToken{
				token: result.QR.Token, hash: hashToken(result.QR.Token), expiresAt: result.QR.ExpiresAt,
			}); err != nil {
				return nil, err
			}
		}
		return result.QR, nil
	}
	if token, ok := qrDisplayTokenFromMetadata(entry.Metadata); ok {
		return &models.QRTokenResponse{Token: token, ExpiresAt: *entry.QRExpiresAt}, nil
	}
	qr, err := s.makeQR(ctx, societyID)
	if err != nil {
		return nil, err
	}
	updated, err := s.entryRepo.GenerateQR(ctx, societyID, entry.ID, qr.hash, qr.expiresAt)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, ErrVisitorQRUnavailable
	}
	if _, err := s.attachQRDisplayToken(ctx, societyID, entry.ID, qr); err != nil {
		return nil, err
	}
	return qr.response(), nil
}

func (s *VisitorEntrySvc) idempotentInviteSubmitResponse(ctx context.Context, invite *models.VisitorInvite) (*models.VisitorEntryMutationResponse, error) {
	existing, err := s.entryRepo.GetByInviteID(ctx, invite.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, ErrVisitorInviteUnavailable
	}
	qr, err := s.resolveExistingQR(ctx, invite.SocietyID, existing)
	if err != nil {
		return nil, err
	}
	return &models.VisitorEntryMutationResponse{Entry: existing, QR: qr, IdempotentReplay: true}, nil
}

func (s *VisitorEntrySvc) lockEntryForApproval(ctx context.Context, societyID int64, entryID int64) error {
	locked, err := s.entryRepo.GetForUpdate(ctx, societyID, entryID)
	if err != nil {
		return err
	}
	if locked == nil || locked.Status != models.VisitorStatusWaitingApproval {
		return ErrVisitorInvalidState
	}
	return nil
}

func (s *VisitorEntrySvc) resolveExpectedCheckout(
	ctx context.Context,
	societyID int64,
	flatID int64,
	purpose models.VisitorPurpose,
	expectedAt *time.Time,
	provided *time.Time,
) (*time.Time, error) {
	if provided != nil {
		if expectedAt != nil && provided.Before(*expectedAt) {
			return nil, ErrInvalidVisitorRequest.WithCause(errors.New("expected_checkout_at must be after expected_at"))
		}
		return provided, nil
	}

	durationMinutes, err := s.settingSvc.ResolveVisitDurationMinutes(ctx, societyID, flatID, purpose)
	if err != nil {
		return nil, err
	}

	base := time.Now()
	if expectedAt != nil {
		base = *expectedAt
	}
	checkout := base.Add(time.Duration(durationMinutes) * time.Minute)
	return &checkout, nil
}

func (s *VisitorEntrySvc) applyExpectedCheckout(
	ctx context.Context,
	societyID int64,
	req *models.VisitorFormRequest,
) error {
	if req == nil {
		return ErrInvalidVisitorRequest
	}
	checkout, err := s.resolveExpectedCheckout(ctx, societyID, req.FlatID, req.Purpose, req.ExpectedAt, req.ExpectedCheckoutAt)
	if err != nil {
		return err
	}
	req.ExpectedCheckoutAt = checkout
	return nil
}

func entryFlatIDPtr(flatID int64) *int64 {
	if flatID <= 0 {
		return nil
	}
	value := flatID
	return &value
}
