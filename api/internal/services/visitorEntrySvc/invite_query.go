package visitorentrysvc

import (
	"context"

	"go-server/internal/models"
	service "go-server/internal/services"
)

func (s *VisitorEntrySvc) GetInviteByToken(ctx context.Context, rawToken string) (*models.VisitorInvite, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	invite, err := s.inviteRepo.GetByTokenHash(ctx, hashToken(rawToken))
	if err != nil {
		return nil, err
	}
	if invite == nil {
		return nil, ErrVisitorInviteNotFound
	}
	if !inviteUsable(invite) {
		return nil, ErrVisitorInviteUnavailable
	}
	return invite, nil
}

func (s *VisitorEntrySvc) GetPublicInviteByToken(ctx context.Context, rawToken string) (*models.PublicVisitorInviteView, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	invite, err := s.GetInviteByToken(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	flat, err := s.flatRepo.Get(ctx, &models.FlatFilter{ID: &invite.FlatID, SocietyID: &invite.SocietyID})
	if err != nil {
		return nil, err
	}
	if flat == nil {
		return nil, ErrVisitorFlatNotFound
	}
	society, err := s.societyRepo.Get(ctx, models.GetSocietyFilter{ID: &invite.SocietyID})
	if err != nil {
		return nil, err
	}
	if society == nil {
		return nil, ErrVisitorFlatNotFound
	}
	return &models.PublicVisitorInviteView{
		ID:          invite.ID,
		Purpose:     invite.Purpose,
		Status:      invite.Status,
		ExpiresAt:   invite.ExpiresAt,
		SocietyName: society.Name,
		FlatNumber:  flat.FlatNumber,
		Block:       flat.Block,
		Floor:       flat.Floor,
	}, nil
}
