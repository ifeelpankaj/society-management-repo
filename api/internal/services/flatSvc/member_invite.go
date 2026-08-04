package flatsvc

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"go-server/internal/models"
	service "go-server/internal/services"
	flatauthz "go-server/internal/services/flatAuthz"
)

func (s *FlatSvc) ListFlatResidentsForActor(ctx context.Context, societyID int64, flatID int64, actorUserID int64, filter *models.FlatResidentFilter) ([]*models.FlatResidentResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureCanViewFlatMembers(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, err
	}
	if filter == nil {
		filter = &models.FlatResidentFilter{}
	}
	filter.SocietyID = &societyID
	filter.FlatID = &flatID
	active := string(models.FlatResidentStatusActive)
	if filter.Status == nil {
		filter.Status = &active
	}
	return s.ListFlatResidents(ctx, filter)
}

func (s *FlatSvc) ListPendingMemberInvites(ctx context.Context, societyID int64, flatID int64, actorUserID int64) ([]*models.FlatMemberInviteResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureCanManageFlatMembers(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, err
	}
	if err := s.memberInviteRepo.ExpireOld(ctx); err != nil {
		return nil, err
	}
	invites, err := s.memberInviteRepo.ListPending(ctx, societyID, flatID)
	if err != nil {
		return nil, err
	}
	items := make([]*models.FlatMemberInviteResponse, 0, len(invites))
	for _, invite := range invites {
		items = append(items, invite.ToResponse())
	}
	return items, nil
}

func (s *FlatSvc) CreateMemberInvite(ctx context.Context, societyID int64, flatID int64, actorUserID int64, req *models.CreateFlatMemberInviteRequest) (*models.FlatMemberInviteTokenResponse, *models.FlatMemberInviteResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil {
		return nil, nil, ErrInvalidMemberInviteRequest
	}
	req.Sanitize()
	if err := req.Validate(); err != nil {
		return nil, nil, ErrInvalidMemberInviteRequest.WithCause(err)
	}
	if err := s.ensureCanManageFlatMembers(ctx, societyID, flatID, actorUserID); err != nil {
		return nil, nil, err
	}
	if err := s.ensureFlatOperational(ctx, societyID); err != nil {
		return nil, nil, err
	}

	token, tokenHash, err := newMemberInviteToken()
	if err != nil {
		return nil, nil, err
	}
	expiry := time.Now().Add(s.memberInviteTTL)

	invite, err := s.memberInviteRepo.Create(ctx, societyID, flatID, actorUserID, req.Role, req.Phone, req.Email, req.FullName, tokenHash, expiry)
	if err != nil {
		return nil, nil, err
	}
	return &models.FlatMemberInviteTokenResponse{Token: token, ExpiresAt: expiry}, invite.ToResponse(), nil
}

func (s *FlatSvc) CancelMemberInvite(ctx context.Context, societyID int64, flatID int64, inviteID int64, actorUserID int64) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.ensureCanManageFlatMembers(ctx, societyID, flatID, actorUserID); err != nil {
		return err
	}
	cancelled, err := s.memberInviteRepo.Cancel(ctx, societyID, flatID, inviteID)
	if err != nil {
		return err
	}
	if cancelled == nil {
		return ErrMemberInviteUnavailable
	}
	return nil
}

func (s *FlatSvc) GetMemberInviteByToken(ctx context.Context, rawToken string) (*models.FlatMemberInvite, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if err := s.memberInviteRepo.ExpireOld(ctx); err != nil {
		return nil, err
	}
	invite, err := s.memberInviteRepo.GetByTokenHash(ctx, hashMemberInviteToken(rawToken))
	if err != nil {
		return nil, err
	}
	if invite == nil {
		return nil, ErrMemberInviteNotFound
	}
	if !memberInviteUsable(invite) {
		return nil, ErrMemberInviteUnavailable
	}
	return invite, nil
}

func (s *FlatSvc) GetPublicMemberInviteByToken(ctx context.Context, rawToken string) (*models.PublicFlatMemberInviteView, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	invite, err := s.GetMemberInviteByToken(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	flat, err := s.flatRepo.Get(ctx, &models.FlatFilter{ID: &invite.FlatID, SocietyID: &invite.SocietyID})
	if err != nil {
		return nil, err
	}
	if flat == nil {
		return nil, ErrFlatNotFound
	}
	societyName := ""
	if flat.SocietyName != nil {
		societyName = *flat.SocietyName
	}
	return &models.PublicFlatMemberInviteView{
		ID:          invite.ID,
		Role:        invite.Role,
		FullName:    invite.FullName,
		Phone:       invite.Phone,
		Email:       invite.Email,
		Status:      invite.Status,
		ExpiresAt:   invite.ExpiresAt,
		SocietyName: societyName,
		FlatNumber:  flat.FlatNumber,
		Block:       flat.Block,
		Floor:       flat.Floor,
	}, nil
}

func (s *FlatSvc) AcceptMemberInvite(ctx context.Context, rawToken string, userID int64) (*models.AcceptFlatMemberInviteResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if userID <= 0 {
		return nil, ErrMemberInviteForbidden
	}

	invite, err := s.GetMemberInviteByToken(ctx, rawToken)
	if err != nil {
		return nil, err
	}

	var accepted *models.FlatMemberInvite
	var resident *models.FlatResident
	err = s.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := s.ensureFlatOperational(txCtx, invite.SocietyID); err != nil {
			return err
		}
		if s.subscriptionSvc != nil {
			if err := s.subscriptionSvc.CanAddResidentWithLock(txCtx, invite.SocietyID, 1); err != nil {
				return err
			}
		}
		active := string(models.FlatResidentStatusActive)
		existing, err := s.residentRepo.Get(txCtx, &models.FlatResidentFilter{
			SocietyID: &invite.SocietyID,
			FlatID:    &invite.FlatID,
			UserID:    &userID,
			Status:    &active,
		})
		if err != nil {
			return err
		}
		if existing != nil {
			return ErrResidentConflict
		}
		if err := s.ensureFlatAssignable(txCtx, invite.SocietyID, invite.FlatID); err != nil {
			return err
		}
		accepted, err = s.memberInviteRepo.Accept(txCtx, invite.ID)
		if err != nil {
			return err
		}
		if accepted == nil {
			return ErrMemberInviteUnavailable
		}
		if _, err := s.memberRepo.UpsertResident(txCtx, invite.SocietyID, userID, invite.InvitedBy); err != nil {
			return err
		}
		resident = &models.FlatResident{
			SocietyID: invite.SocietyID,
			FlatID:    invite.FlatID,
			UserID:    userID,
			Role:      invite.Role.ToResidentRole(),
			Status:    models.FlatResidentStatusActive,
			IsPrimary: false,
			CreatedBy: &invite.InvitedBy,
		}
		if err := s.residentRepo.Add(txCtx, resident); err != nil {
			return ErrResidentConflict.WithCause(err)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	residentResp, err := s.GetFlatResident(ctx, &models.FlatResidentFilter{ID: &resident.ID, SocietyID: &invite.SocietyID})
	if err != nil {
		return nil, err
	}

	s.dispatchMemberInviteAcceptedNotification(ctx, accepted, residentResp)

	return &models.AcceptFlatMemberInviteResponse{
		Invite:   accepted.ToResponse(),
		Resident: residentResp,
	}, nil
}

func (s *FlatSvc) JoinMemberInvite(ctx context.Context, rawToken string, req *models.JoinFlatMemberInviteRequest) (*models.JoinFlatMemberInviteResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()

	if req == nil {
		return nil, ErrInvalidMemberInviteRequest
	}
	req.Sanitize()

	invite, err := s.GetMemberInviteByToken(ctx, rawToken)
	if err != nil {
		return nil, err
	}

	var user *models.UserResponse
	if req.IsRegisterFlow() {
		if s.memberInviteUserCreator == nil {
			return nil, ErrMemberInviteForbidden
		}
		if invite.Email == nil || strings.TrimSpace(*invite.Email) == "" {
			return nil, ErrInvalidMemberInviteRequest
		}
		if !strings.EqualFold(strings.TrimSpace(req.Email), strings.TrimSpace(*invite.Email)) {
			return nil, ErrInvalidMemberInviteRequest.WithCause(errors.New("email must match the invite"))
		}
		if invite.Phone == nil || strings.TrimSpace(*invite.Phone) == "" {
			return nil, ErrInvalidMemberInviteRequest.WithCause(errors.New("invite is missing phone number"))
		}
		user, err = s.memberInviteUserCreator.CreateResidentUser(ctx, &models.ResidentRegisterRequest{
			FirstName:   req.FirstName,
			LastName:    req.LastName,
			Email:       req.Email,
			PhoneNumber: strings.TrimSpace(*invite.Phone),
			Password:    req.Password,
		})
	} else {
		if s.memberInviteUserAuthenticator == nil {
			return nil, ErrMemberInviteForbidden
		}
		loginReq, err := loginRequestFromIdentifier(req.Identifier, req.Password)
		if err != nil {
			return nil, ErrInvalidMemberInviteRequest.WithCause(err)
		}
		user, err = s.memberInviteUserAuthenticator.AuthenticateCredentials(ctx, loginReq)
	}
	if err != nil {
		return nil, err
	}
	if user == nil || user.ID <= 0 {
		return nil, ErrMemberInviteForbidden
	}

	acceptance, err := s.AcceptMemberInvite(ctx, rawToken, user.ID)
	if err != nil {
		return nil, err
	}

	return &models.JoinFlatMemberInviteResponse{
		User:       user,
		Acceptance: acceptance,
	}, nil
}

func (s *FlatSvc) dispatchMemberInviteAcceptedNotification(
	ctx context.Context,
	invite *models.FlatMemberInvite,
	resident *models.FlatResidentResponse,
) {
	if invite == nil {
		return
	}

	flatNumber := ""
	flat, err := s.flatRepo.Get(ctx, &models.FlatFilter{ID: &invite.FlatID, SocietyID: &invite.SocietyID})
	if err == nil && flat != nil {
		flatNumber = flat.FlatNumber
	}

	joinedName := invite.FullName
	if resident != nil && resident.UserName != nil && strings.TrimSpace(*resident.UserName) != "" {
		joinedName = *resident.UserName
	}

	var residentID int64
	if resident != nil {
		residentID = resident.ID
	}

	s.notifyMemberInviteAccepted(invite, flatNumber, joinedName, residentID)
}

func loginRequestFromIdentifier(identifier, password string) (*models.LoginRequest, error) {
	identifier = strings.TrimSpace(identifier)
	password = strings.TrimSpace(password)
	if identifier == "" || password == "" {
		return nil, errors.New("identifier and password are required")
	}

	req := &models.LoginRequest{Password: password}
	if strings.Contains(identifier, "@") {
		req.Email = strings.ToLower(identifier)
		return req, nil
	}

	req.PhoneNumber = identifier
	return req, nil
}

func (s *FlatSvc) ExpireOldMemberInvites(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, service.DefaultTimeout)
	defer cancel()
	return s.memberInviteRepo.ExpireOld(ctx)
}

func newMemberInviteToken() (string, string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", "", err
	}
	token := hex.EncodeToString(raw)
	return token, hashMemberInviteToken(token), nil
}

func hashMemberInviteToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func memberInviteUsable(invite *models.FlatMemberInvite) bool {
	return invite != nil && invite.Status == models.FlatMemberInviteStatusPending && invite.ExpiresAt.After(time.Now())
}

func (s *FlatSvc) ensureCanManageFlatMembers(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	if s.flatAuthz == nil {
		return ErrMemberInviteForbidden
	}
	return mapFlatAuthzError(s.flatAuthz.CanManageFlatMembers(ctx, societyID, flatID, actorUserID))
}

func (s *FlatSvc) ensureCanViewFlatMembers(ctx context.Context, societyID int64, flatID int64, actorUserID int64) error {
	if s.flatAuthz == nil {
		return ErrMemberInviteForbidden
	}
	return mapFlatAuthzError(s.flatAuthz.CanViewFlatVisitors(ctx, societyID, flatID, actorUserID))
}

func mapFlatAuthzError(err error) error {
	if err == nil {
		return nil
	}
	var appErr *models.AppError
	if !errors.As(err, &appErr) {
		return err
	}
	switch appErr.Code {
	case flatauthz.ErrForbidden.Code, flatauthz.ErrViewForbidden.Code, flatauthz.ErrManageForbidden.Code:
		return ErrMemberInviteForbidden
	case flatauthz.ErrFlatNotFound.Code:
		return ErrFlatNotFound
	default:
		return err
	}
}
