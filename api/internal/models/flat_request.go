package models

import (
	"errors"
	"strings"
)

type CreateFlatRequest struct {
	Block      *string        `json:"block,omitempty" validate:"omitempty,max=50"`
	Floor      *string        `json:"floor,omitempty" validate:"omitempty,max=50"`
	FlatNumber string         `json:"flat_number" validate:"required,max=50"`
	Metadata   map[string]any `json:"metadata,omitempty"`
}

func (r *CreateFlatRequest) Sanitize() {
	r.Block = trimPtr(r.Block)
	r.Floor = trimPtr(r.Floor)
	r.FlatNumber = strings.TrimSpace(r.FlatNumber)
}

func (r *CreateFlatRequest) Validate() error {
	if strings.TrimSpace(r.FlatNumber) == "" {
		return errors.New("flat_number is required")
	}
	return nil
}

type BulkCreateFlatsRequest struct {
	Flats []CreateFlatRequest `json:"flats" validate:"required,min=1,dive"`
}

func (r *BulkCreateFlatsRequest) Sanitize() {
	for i := range r.Flats {
		r.Flats[i].Sanitize()
	}
}

func (r *BulkCreateFlatsRequest) Validate() error {
	if len(r.Flats) == 0 {
		return errors.New("at least one flat is required")
	}
	for i := range r.Flats {
		if err := r.Flats[i].Validate(); err != nil {
			return err
		}
	}
	return nil
}

type UpdateFlatRequest struct {
	Block      *string        `json:"block,omitempty" validate:"omitempty,max=50"`
	Floor      *string        `json:"floor,omitempty" validate:"omitempty,max=50"`
	FlatNumber *string        `json:"flat_number,omitempty" validate:"omitempty,max=50"`
	Status     *FlatStatus    `json:"status,omitempty"`
	IsActive   *bool          `json:"is_active,omitempty"`
	Metadata   map[string]any `json:"metadata,omitempty"`
}

func (r *UpdateFlatRequest) Sanitize() {
	r.Block = trimPtr(r.Block)
	r.Floor = trimPtr(r.Floor)
	r.FlatNumber = trimPtr(r.FlatNumber)
}

func (r *UpdateFlatRequest) Validate() error {
	if r.Block == nil && r.Floor == nil && r.FlatNumber == nil && r.Status == nil && r.IsActive == nil && r.Metadata == nil {
		return errors.New("at least one field must be provided")
	}
	if r.Status != nil && !r.Status.IsValid() {
		return errors.New("invalid flat status")
	}
	return nil
}

type SubmitFlatClaimRequest struct {
	SocietyID        int64            `json:"society_id" validate:"required,gt=0"`
	FlatID           int64            `json:"flat_id" validate:"required,gt=0"`
	RequestedRole    FlatResidentRole `json:"requested_role" validate:"required"`
	RequestedPrimary bool             `json:"requested_primary"`
	Note             *string          `json:"note,omitempty" validate:"omitempty,max=500"`
	Metadata         map[string]any   `json:"metadata,omitempty"`
}

func (r *SubmitFlatClaimRequest) Sanitize() {
	r.Note = trimPtr(r.Note)
}

func (r *SubmitFlatClaimRequest) Validate() error {
	if r.SocietyID <= 0 || r.FlatID <= 0 {
		return errors.New("society_id and flat_id are required")
	}
	if !r.RequestedRole.IsValid() {
		return errors.New("invalid requested role")
	}
	return nil
}

type RejectFlatClaimRequest struct {
	Reason string `json:"reason" validate:"required,max=500"`
}

func (r *RejectFlatClaimRequest) Sanitize() {
	r.Reason = strings.TrimSpace(r.Reason)
}

type AddFlatResidentRequest struct {
	Role      FlatResidentRole `json:"role" validate:"required"`
	IsPrimary bool             `json:"is_primary"`
	Metadata  map[string]any   `json:"metadata,omitempty"`
}

func (r *AddFlatResidentRequest) Validate() error {
	if !r.Role.IsValid() {
		return errors.New("invalid resident role")
	}
	return nil
}

type UpdateFlatResidentRoleRequest struct {
	Role FlatResidentRole `json:"role" validate:"required"`
}

func (r *UpdateFlatResidentRoleRequest) Validate() error {
	if !r.Role.IsValid() {
		return errors.New("invalid resident role")
	}
	return nil
}

type FlatFilter struct {
	ID        *int64
	SocietyID *int64

	Block      *string
	Floor      *string
	FlatNumber *string
	Status     *string
	IsActive   *bool

	Search     string
	SearchMode string

	Limit  int32
	Offset int32
}

type FlatResidentFilter struct {
	ID        *int64
	SocietyID *int64
	FlatID    *int64
	UserID    *int64

	Role      *string
	Status    *string
	IsPrimary *bool

	Search     string
	SearchMode string

	Limit  int32
	Offset int32
}

type FlatClaimFilter struct {
	ID        *int64
	SocietyID *int64
	FlatID    *int64
	UserID    *int64

	Status *string

	Search     string
	SearchMode string

	Limit  int32
	Offset int32
}
