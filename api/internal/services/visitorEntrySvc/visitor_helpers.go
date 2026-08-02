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
)

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
