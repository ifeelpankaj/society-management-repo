package repository

import (
	"context"
	"encoding/json"
	"errors"
	"go-server/internal/db"
	"go-server/internal/models"
	"go-server/pkg/database"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id int64) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByPhoneNumber(ctx context.Context, phone string) (*models.User, error)
	EmailExists(ctx context.Context, email string) (bool, error)
	PhoneExists(ctx context.Context, phone string) (bool, error)
	MarkEmailVerified(ctx context.Context, userID int64) error
	UpdatePasswordHash(ctx context.Context, userID int64, passwordHash string) error
	UpdateLastLogin(ctx context.Context, userID int64) error
}

type userRepository struct {
	db *database.Database
}

func NewUserRepository(db *database.Database) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	metadata, err := json.Marshal(user.Metadata)
	if err != nil {
		return err
	}
	if string(metadata) == "null" {
		metadata = []byte("{}")
	}

	row, err := GetQueries(ctx, r.db).CreateUser(ctx, db.CreateUserParams{
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		FullName:      user.FullName,
		Email:         user.Email,
		PhoneNumber:   user.PhoneNumber,
		PasswordHash:  user.PasswordHash,
		AuthProvider:  db.AuthProvider(user.AuthProvider),
		GlobalRole:    db.GlobalRole(user.GlobalRole),
		EmailVerified: user.EmailVerified,
		PhoneVerified: user.PhoneVerified,
		IsActive:      user.IsActive,
		IsBlocked:     user.IsBlocked,
		Timezone:      user.Timezone,
		Language:      user.Language,
		Metadata:      metadata,
	})
	if err != nil {
		return err
	}

	*user = *userFromDB(row)
	return nil
}

func (r *userRepository) GetByID(ctx context.Context, id int64) (*models.User, error) {
	row, err := GetQueries(ctx, r.db).GetUserByID(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return userFromDB(row), nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	row, err := GetQueries(ctx, r.db).GetUserByEmail(ctx, email)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return userFromDB(row), nil
}

func (r *userRepository) GetByPhoneNumber(ctx context.Context, phone string) (*models.User, error) {
	row, err := GetQueries(ctx, r.db).GetUserByPhoneNumber(ctx, &phone)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return userFromDB(row), nil
}

func (r *userRepository) EmailExists(ctx context.Context, email string) (bool, error) {
	return GetQueries(ctx, r.db).EmailExists(ctx, email)
}

func (r *userRepository) PhoneExists(ctx context.Context, phone string) (bool, error) {
	return GetQueries(ctx, r.db).PhoneExists(ctx, &phone)
}

func userFromDB(row db.User) *models.User {
	metadata := map[string]any{}
	if len(row.Metadata) > 0 {
		_ = json.Unmarshal(row.Metadata, &metadata)
	}

	return &models.User{
		ID:                row.ID,
		FirstName:         row.FirstName,
		LastName:          row.LastName,
		FullName:          row.FullName,
		Email:             row.Email,
		PhoneNumber:       row.PhoneNumber,
		PasswordHash:      row.PasswordHash,
		AuthProvider:      models.AuthProvider(row.AuthProvider),
		ProviderID:        row.ProviderID,
		GlobalRole:        models.GlobalRole(row.GlobalRole),
		EmailVerified:     row.EmailVerified,
		PhoneVerified:     row.PhoneVerified,
		IsActive:          row.IsActive,
		IsBlocked:         row.IsBlocked,
		BlockedReason:     row.BlockedReason,
		AvatarURL:         row.AvatarUrl,
		DateOfBirth:       pgDateToTimePtr(row.DateOfBirth),
		Gender:            row.Gender,
		Timezone:          row.Timezone,
		Language:          row.Language,
		LastLoginAt:       pgTimestamptzToTimePtr(row.LastLoginAt),
		PasswordChangedAt: pgTimestamptzToTimePtr(row.PasswordChangedAt),
		DeletedAt:         pgTimestamptzToTimePtr(row.DeletedAt),
		Metadata:          metadata,
		CreatedAt:         pgTimestamptzToTime(row.CreatedAt),
		UpdatedAt:         pgTimestamptzToTime(row.UpdatedAt),
	}
}

func pgDateToTimePtr(date pgtype.Date) *time.Time {
	if !date.Valid {
		return nil
	}
	value := date.Time
	return &value
}

func pgTimestamptzToTimePtr(value pgtype.Timestamptz) *time.Time {
	if !value.Valid {
		return nil
	}
	result := value.Time
	return &result
}

func pgTimestamptzToTime(value pgtype.Timestamptz) time.Time {
	if !value.Valid {
		return time.Time{}
	}
	return value.Time
}
func (r *userRepository) MarkEmailVerified(ctx context.Context, userID int64) error {
	return GetQueries(ctx, r.db).MarkUserEmailVerified(ctx, userID)
}

func (r *userRepository) UpdatePasswordHash(ctx context.Context, userID int64, passwordHash string) error {
	return GetQueries(ctx, r.db).UpdateUserPasswordHash(ctx, db.UpdateUserPasswordHashParams{
		ID:           userID,
		PasswordHash: &passwordHash,
	})
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, userID int64) error {
	return GetQueries(ctx, r.db).UpdateUserLastLogin(ctx, userID)
}
