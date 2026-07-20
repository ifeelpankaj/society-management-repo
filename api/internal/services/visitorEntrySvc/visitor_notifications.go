package visitorentrysvc

import (
	"context"
	"time"

	"go-server/internal/models"
	notificationsvc "go-server/internal/services/notificationSvc"
	"go-server/pkg/logger"

	"go.uber.org/zap"
)

const notificationDispatchTimeout = 10 * time.Second

func (s *VisitorEntrySvc) notifyVisitorPending(entry *models.VisitorEntry) {
	if entry == nil || s.notifier == nil {
		return
	}

	userIDs, err := s.listFlatResidentUserIDs(entry.SocietyID, entry.FlatID)
	if err != nil {
		logger.Warn("failed to resolve resident recipients for pending visitor notification", zap.Error(err))
		return
	}

	s.dispatchNotification(userIDs, notificationsvc.VisitorPendingPayload(entry))
}

func (s *VisitorEntrySvc) notifyVisitorApproved(entry *models.VisitorEntry) {
	if entry == nil || s.notifier == nil {
		return
	}

	userIDs, err := s.listSocietyStaffUserIDs(entry.SocietyID)
	if err != nil {
		logger.Warn("failed to resolve staff recipients for approved visitor notification", zap.Error(err))
		return
	}

	s.dispatchNotification(userIDs, notificationsvc.VisitorApprovedPayload(entry))
}

func (s *VisitorEntrySvc) notifyVisitorRejected(entry *models.VisitorEntry) {
	if entry == nil || s.notifier == nil {
		return
	}

	userIDs, err := s.listFlatResidentUserIDs(entry.SocietyID, entry.FlatID)
	if err != nil {
		logger.Warn("failed to resolve resident recipients for rejected visitor notification", zap.Error(err))
		return
	}

	if entry.HandledByGuardID != nil {
		userIDs = appendUniqueUserID(userIDs, *entry.HandledByGuardID)
	}
	if entry.CreatedBy != nil {
		userIDs = appendUniqueUserID(userIDs, *entry.CreatedBy)
	}

	s.dispatchNotification(userIDs, notificationsvc.VisitorRejectedPayload(entry))
}

func (s *VisitorEntrySvc) notifyVisitorCheckIn(entry *models.VisitorEntry) {
	if entry == nil || s.notifier == nil {
		return
	}

	residents, err := s.listFlatResidentUserIDs(entry.SocietyID, entry.FlatID)
	if err != nil {
		logger.Warn("failed to resolve recipients for check-in notification", zap.Error(err))
		return
	}

	staff, err := s.listSocietyStaffUserIDs(entry.SocietyID)
	if err != nil {
		logger.Warn("failed to resolve recipients for check-in notification", zap.Error(err))
		return
	}

	s.dispatchNotification(mergeUserIDs(residents, staff), notificationsvc.VisitorCheckInPayload(entry))
}

func (s *VisitorEntrySvc) notifyVisitorCheckOut(entry *models.VisitorEntry) {
	if entry == nil || s.notifier == nil {
		return
	}

	residents, err := s.listFlatResidentUserIDs(entry.SocietyID, entry.FlatID)
	if err != nil {
		logger.Warn("failed to resolve recipients for check-out notification", zap.Error(err))
		return
	}

	staff, err := s.listSocietyStaffUserIDs(entry.SocietyID)
	if err != nil {
		logger.Warn("failed to resolve recipients for check-out notification", zap.Error(err))
		return
	}

	s.dispatchNotification(mergeUserIDs(residents, staff), notificationsvc.VisitorCheckOutPayload(entry))
}

func (s *VisitorEntrySvc) dispatchNotification(userIDs []int64, payload models.NotificationPayload) {
	if len(userIDs) == 0 {
		return
	}

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), notificationDispatchTimeout)
		defer cancel()

		if err := s.notifier.SendToUsers(ctx, userIDs, payload); err != nil {
			logger.Warn("failed to dispatch visitor push notification", zap.Error(err))
		}
	}()
}

func (s *VisitorEntrySvc) listFlatResidentUserIDs(societyID int64, flatID int64) ([]int64, error) {
	active := string(models.FlatResidentStatusActive)
	residents, err := s.residentRepo.List(context.Background(), &models.FlatResidentFilter{
		SocietyID: &societyID,
		FlatID:    &flatID,
		Status:    &active,
	})
	if err != nil {
		return nil, err
	}

	userIDs := make([]int64, 0, len(residents))
	seen := make(map[int64]struct{}, len(residents))
	for _, resident := range residents {
		if _, exists := seen[resident.UserID]; exists {
			continue
		}
		seen[resident.UserID] = struct{}{}
		userIDs = append(userIDs, resident.UserID)
	}
	return userIDs, nil
}

func (s *VisitorEntrySvc) listSocietyStaffUserIDs(societyID int64) ([]int64, error) {
	staffRole := string(models.SocietyMemberRoleStaff)
	activeStatus := string(models.SocietyMemberStatusActive)
	members, err := s.memberRepo.List(context.Background(), models.ListSocietyMembersFilter{
		SocietyID: societyID,
		Role:      &staffRole,
		Status:    &activeStatus,
		Limit:     500,
	})
	if err != nil {
		return nil, err
	}

	userIDs := make([]int64, 0, len(members))
	seen := make(map[int64]struct{}, len(members))
	for _, member := range members {
		if _, exists := seen[member.UserID]; exists {
			continue
		}
		seen[member.UserID] = struct{}{}
		userIDs = append(userIDs, member.UserID)
	}
	return userIDs, nil
}

func mergeUserIDs(groups ...[]int64) []int64 {
	total := 0
	for _, group := range groups {
		total += len(group)
	}

	merged := make([]int64, 0, total)
	seen := make(map[int64]struct{}, total)
	for _, group := range groups {
		for _, userID := range group {
			if _, exists := seen[userID]; exists {
				continue
			}
			seen[userID] = struct{}{}
			merged = append(merged, userID)
		}
	}
	return merged
}

func appendUniqueUserID(userIDs []int64, userID int64) []int64 {
	for _, existing := range userIDs {
		if existing == userID {
			return userIDs
		}
	}
	return append(userIDs, userID)
}
