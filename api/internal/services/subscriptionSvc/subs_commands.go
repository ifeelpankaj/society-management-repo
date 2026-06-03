package subscriptionsvc

import (
	"context"

	"go-server/internal/models"
	service "go-server/internal/services"
)

func (s *SubscriptionSvc) CreatePendingSubscription(ctx context.Context, societyID, planID, createdBy int64) (*models.SocietySubscriptionResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	sub, err := s.subRepo.CreatePending(ctx, societyID, planID, createdBy)
	if err != nil {
		return nil, ErrSubscriptionConflict.WithCause(err)
	}
	if sub == nil {
		return nil, ErrSubscriptionNotFound
	}
	return sub.ToResponse(), nil
}

func (s *SubscriptionSvc) CreateTrialSubscription(ctx context.Context, societyID, planID, createdBy int64, req *models.CreateTrialSubscriptionRequest) (*models.SocietySubscriptionResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil || req.TrialEndsAt.Before(req.StartsAt) {
		return nil, ErrInvalidSubscription
	}
	if req.EndsAt != nil && !req.EndsAt.After(req.StartsAt) {
		return nil, ErrInvalidSubscription
	}
	sub, err := s.subRepo.CreateTrial(ctx, societyID, planID, createdBy, req)
	if err != nil {
		return nil, ErrSubscriptionConflict.WithCause(err)
	}
	if sub == nil {
		return nil, ErrSubscriptionNotFound
	}
	return sub.ToResponse(), nil
}

func (s *SubscriptionSvc) ActivateSubscription(ctx context.Context, subscriptionID, activatedBy int64, req *models.ActivateSubscriptionRequest) (*models.SocietySubscriptionResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil || !req.EndsAt.After(req.StartsAt) {
		return nil, ErrInvalidSubscription
	}
	sub, err := s.subRepo.Activate(ctx, subscriptionID, activatedBy, req)
	if err != nil {
		return nil, err
	}
	if sub == nil {
		return nil, ErrSubscriptionNotFound
	}
	return sub.ToResponse(), nil
}

func (s *SubscriptionSvc) RenewSubscription(ctx context.Context, subscriptionID, renewedBy int64, req *models.RenewSubscriptionRequest) (*models.SocietySubscriptionResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil || !req.EndsAt.After(req.StartsAt) {
		return nil, ErrInvalidSubscription
	}
	sub, err := s.subRepo.Renew(ctx, subscriptionID, renewedBy, req)
	if err != nil {
		return nil, err
	}
	if sub == nil {
		return nil, ErrSubscriptionNotFound
	}
	return sub.ToResponse(), nil
}

func (s *SubscriptionSvc) CancelSubscription(ctx context.Context, subscriptionID, cancelledBy int64, req *models.CancelSubscriptionRequest) (*models.SocietySubscriptionResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil {
		return nil, ErrInvalidSubscription
	}
	req.Sanitize()
	if req.Reason == "" {
		return nil, ErrInvalidSubscription
	}
	sub, err := s.subRepo.Cancel(ctx, subscriptionID, cancelledBy, req)
	if err != nil {
		return nil, err
	}
	if sub == nil {
		return nil, ErrSubscriptionNotFound
	}
	return sub.ToResponse(), nil
}

func (s *SubscriptionSvc) ExpireSubscription(ctx context.Context, subscriptionID int64) (*models.SocietySubscriptionResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	sub, err := s.subRepo.Expire(ctx, subscriptionID)
	if err != nil {
		return nil, err
	}
	if sub == nil {
		return nil, ErrSubscriptionNotFound
	}
	return sub.ToResponse(), nil
}

func (s *SubscriptionSvc) ChangeSubscriptionPlan(ctx context.Context, subscriptionID, newPlanID, changedBy int64) (*models.SocietySubscriptionResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	sub, err := s.subRepo.ChangePlan(ctx, subscriptionID, newPlanID)
	if err != nil {
		return nil, ErrSubscriptionConflict.WithCause(err)
	}
	if sub == nil {
		return nil, ErrSubscriptionNotFound
	}
	return sub.ToResponse(), nil
}
