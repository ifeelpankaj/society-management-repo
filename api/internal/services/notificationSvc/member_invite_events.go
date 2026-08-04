package notificationsvc

import (
	"strconv"

	"go-server/internal/models"
)

const MemberInviteEventAccepted = "member_invite.accepted"

func MemberInviteAcceptedPayload(
	invite *models.FlatMemberInvite,
	flatNumber string,
	joinedName string,
	residentID int64,
) models.NotificationPayload {
	body := joinedName + " joined your flat"
	if flatNumber != "" {
		body = joinedName + " joined flat " + flatNumber
	}
	if invite != nil && invite.Role != "" {
		body += " as " + string(invite.Role)
	}

	return models.NotificationPayload{
		Title: "Member joined your flat",
		Body:  body,
		Data:  memberInviteData(invite, residentID, MemberInviteEventAccepted),
	}
}

func memberInviteData(invite *models.FlatMemberInvite, residentID int64, eventType string) map[string]string {
	data := map[string]string{"type": eventType}
	if invite == nil {
		return data
	}
	data["society_id"] = strconv.FormatInt(invite.SocietyID, 10)
	data["flat_id"] = strconv.FormatInt(invite.FlatID, 10)
	data["invite_id"] = strconv.FormatInt(invite.ID, 10)
	if residentID > 0 {
		data["resident_id"] = strconv.FormatInt(residentID, 10)
	}
	return data
}
