package models

import (
	"errors"
	"strings"
	"time"
)

type UpdateUserRequest struct {
	ID int64 `json:"-"`

	FirstName   *string    `json:"first_name,omitempty" validate:"omitempty,min=2,max=100,alphanumeric_space"`
	LastName    *string    `json:"last_name,omitempty" validate:"omitempty,max=100,alphanumeric_space"`
	PhoneNumber *string    `json:"phone_number,omitempty" validate:"omitempty,phone_intl,max=20"`
	AvatarURL   *string    `json:"avatar_url,omitempty" validate:"omitempty,url,max=500"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Gender      *string    `json:"gender,omitempty" validate:"omitempty,oneof=male female other prefer_not_to_say"`
	Timezone    *string    `json:"timezone,omitempty" validate:"omitempty,max=100"`
	Language    *string    `json:"language,omitempty" validate:"omitempty,max=20"`
}

func (r *UpdateUserRequest) Sanitize() {
	if r.FirstName != nil {
		v := strings.TrimSpace(*r.FirstName)
		r.FirstName = &v
	}

	if r.LastName != nil {
		v := strings.TrimSpace(*r.LastName)
		r.LastName = &v
	}

	if r.PhoneNumber != nil {
		v := strings.TrimSpace(*r.PhoneNumber)
		r.PhoneNumber = &v
	}

	if r.AvatarURL != nil {
		v := strings.TrimSpace(*r.AvatarURL)
		r.AvatarURL = &v
	}

	if r.Gender != nil {
		v := strings.ToLower(strings.TrimSpace(*r.Gender))
		r.Gender = &v
	}

	if r.Timezone != nil {
		v := strings.TrimSpace(*r.Timezone)
		r.Timezone = &v
	}

	if r.Language != nil {
		v := strings.ToLower(strings.TrimSpace(*r.Language))
		r.Language = &v
	}
}

func (r *UpdateUserRequest) Validate() error {
	if r.FirstName == nil &&
		r.LastName == nil &&
		r.PhoneNumber == nil &&
		r.AvatarURL == nil &&
		r.DateOfBirth == nil &&
		r.Gender == nil &&
		r.Timezone == nil &&
		r.Language == nil {
		return errors.New("at least one field must be provided for update")
	}

	if r.FirstName != nil && strings.TrimSpace(*r.FirstName) == "" {
		return errors.New("first_name cannot be empty")
	}

	return nil
}
