package flatsvc

import (
	"context"
	"time"

	"go-server/internal/models"
	notificationsvc "go-server/internal/services/notificationSvc"
	"go-server/pkg/logger"

	"go.uber.org/zap"
)

const memberInviteNotificationTimeout = 10 * time.Second

func (s *FlatSvc) notifyMemberInviteAccepted(
	invite *models.FlatMemberInvite,
	flatNumber string,
	joinedName string,
	residentID int64,
) {
	if invite == nil || s.notifier == nil || invite.InvitedBy <= 0 {
		return
	}

	payload := notificationsvc.MemberInviteAcceptedPayload(invite, flatNumber, joinedName, residentID)
	userIDs := []int64{invite.InvitedBy}

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), memberInviteNotificationTimeout)
		defer cancel()

		if err := s.notifier.SendToUsers(ctx, userIDs, payload); err != nil {
			logger.Warn("failed to dispatch member invite accepted notification", zap.Error(err))
		}
	}()
}
