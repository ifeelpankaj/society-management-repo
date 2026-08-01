package repository

import (
	"context"
	"errors"
	"time"

	"go-server/internal/db"
	"go-server/internal/models"
	"go-server/pkg/database"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type FlatMemberInviteRepository interface {
	Create(ctx context.Context, societyID int64, flatID int64, invitedBy int64, role models.FlatMemberInviteRole, phone, email *string, fullName, tokenHash string, expiresAt time.Time) (*models.FlatMemberInvite, error)
	GetByID(ctx context.Context, societyID int64, inviteID int64) (*models.FlatMemberInvite, error)
	GetByTokenHash(ctx context.Context, tokenHash string) (*models.FlatMemberInvite, error)
	ListPending(ctx context.Context, societyID int64, flatID int64) ([]*models.FlatMemberInvite, error)
	Cancel(ctx context.Context, societyID int64, flatID int64, inviteID int64) (*models.FlatMemberInvite, error)
	Accept(ctx context.Context, inviteID int64) (*models.FlatMemberInvite, error)
	ExpireOld(ctx context.Context) error
}

type flatMemberInviteRepository struct {
	db *database.Database
}

func NewFlatMemberInviteRepository(db *database.Database) FlatMemberInviteRepository {
	return &flatMemberInviteRepository{db: db}
}

func (r *flatMemberInviteRepository) Create(ctx context.Context, societyID int64, flatID int64, invitedBy int64, role models.FlatMemberInviteRole, phone, email *string, fullName, tokenHash string, expiresAt time.Time) (*models.FlatMemberInvite, error) {
	row, err := GetQueries(ctx, r.db).CreateFlatMemberInvite(ctx, db.CreateFlatMemberInviteParams{
		SocietyID: societyID,
		FlatID:    flatID,
		InvitedBy: invitedBy,
		Role:      db.FlatMemberInviteRole(role),
		Phone:     phone,
		Email:     email,
		FullName:  fullName,
		TokenHash: tokenHash,
		ExpiresAt: pgTimestamptzFromTime(expiresAt),
	})
	return flatMemberInviteFromDBNoRows(row, err)
}

func (r *flatMemberInviteRepository) GetByID(ctx context.Context, societyID int64, inviteID int64) (*models.FlatMemberInvite, error) {
	row, err := GetQueries(ctx, r.db).GetFlatMemberInviteByID(ctx, db.GetFlatMemberInviteByIDParams{
		ID: inviteID, SocietyID: societyID,
	})
	return flatMemberInviteFromDBNoRows(row, err)
}

func (r *flatMemberInviteRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*models.FlatMemberInvite, error) {
	row, err := GetQueries(ctx, r.db).GetFlatMemberInviteByTokenHash(ctx, tokenHash)
	return flatMemberInviteFromDBNoRows(row, err)
}

func (r *flatMemberInviteRepository) ListPending(ctx context.Context, societyID int64, flatID int64) ([]*models.FlatMemberInvite, error) {
	rows, err := GetQueries(ctx, r.db).ListPendingFlatMemberInvites(ctx, db.ListPendingFlatMemberInvitesParams{
		SocietyID: societyID,
		FlatID:    flatID,
	})
	if err != nil {
		return nil, err
	}
	items := make([]*models.FlatMemberInvite, 0, len(rows))
	for _, row := range rows {
		items = append(items, flatMemberInviteFromDB(row))
	}
	return items, nil
}

func (r *flatMemberInviteRepository) Cancel(ctx context.Context, societyID int64, flatID int64, inviteID int64) (*models.FlatMemberInvite, error) {
	row, err := GetQueries(ctx, r.db).CancelFlatMemberInvite(ctx, db.CancelFlatMemberInviteParams{
		ID: inviteID, SocietyID: societyID, FlatID: flatID,
	})
	return flatMemberInviteFromDBNoRows(row, err)
}

func (r *flatMemberInviteRepository) Accept(ctx context.Context, inviteID int64) (*models.FlatMemberInvite, error) {
	row, err := GetQueries(ctx, r.db).AcceptFlatMemberInvite(ctx, inviteID)
	return flatMemberInviteFromDBNoRows(row, err)
}

func (r *flatMemberInviteRepository) ExpireOld(ctx context.Context) error {
	return GetQueries(ctx, r.db).ExpireOldFlatMemberInvites(ctx)
}

func flatMemberInviteFromDBNoRows(row db.FlatMemberInvite, err error) (*models.FlatMemberInvite, error) {
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return flatMemberInviteFromDB(row), nil
}

func flatMemberInviteFromDB(row db.FlatMemberInvite) *models.FlatMemberInvite {
	return &models.FlatMemberInvite{
		ID:        row.ID,
		SocietyID: row.SocietyID,
		FlatID:    row.FlatID,
		InvitedBy: row.InvitedBy,
		Role:      models.FlatMemberInviteRole(row.Role),
		Phone:     row.Phone,
		Email:     row.Email,
		FullName:  row.FullName,
		Status:    models.FlatMemberInviteStatus(row.Status),
		ExpiresAt: pgTimestamptzToTime(row.ExpiresAt),
		CreatedAt: pgTimestamptzToTime(row.CreatedAt),
		UpdatedAt: pgTimestamptzToTime(row.UpdatedAt),
	}
}

func pgTimestamptzFromTime(value time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: value, Valid: true}
}
