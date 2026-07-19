package notificationsvc

import (
	"strconv"

	"go-server/internal/models"
)

const (
	VisitorEventPending  = "visitor.pending"
	VisitorEventApproved = "visitor.approved"
	VisitorEventRejected = "visitor.rejected"
	VisitorEventCheckIn  = "visitor.checkin"
	VisitorEventCheckOut = "visitor.checkout"
)

func VisitorPendingPayload(entry *models.VisitorEntry) models.NotificationPayload {
	return models.NotificationPayload{
		Title: "Visitor approval needed",
		Body:  "A visitor is waiting for your approval.",
		Data:  visitorEntryData(entry, VisitorEventPending),
	}
}

func VisitorApprovedPayload(entry *models.VisitorEntry) models.NotificationPayload {
	return models.NotificationPayload{
		Title: "Visitor approved",
		Body:  "A resident approved a visitor entry.",
		Data:  visitorEntryData(entry, VisitorEventApproved),
	}
}

func VisitorRejectedPayload(entry *models.VisitorEntry) models.NotificationPayload {
	return models.NotificationPayload{
		Title: "Visitor rejected",
		Body:  "A visitor entry was declined.",
		Data:  visitorEntryData(entry, VisitorEventRejected),
	}
}

func VisitorCheckInPayload(entry *models.VisitorEntry) models.NotificationPayload {
	return models.NotificationPayload{
		Title: "Visitor checked in",
		Body:  "A visitor has entered the society.",
		Data:  visitorEntryData(entry, VisitorEventCheckIn),
	}
}

func VisitorCheckOutPayload(entry *models.VisitorEntry) models.NotificationPayload {
	return models.NotificationPayload{
		Title: "Visitor checked out",
		Body:  "A visitor has left the society.",
		Data:  visitorEntryData(entry, VisitorEventCheckOut),
	}
}

func visitorEntryData(entry *models.VisitorEntry, eventType string) map[string]string {
	if entry == nil {
		return map[string]string{"type": eventType}
	}

	return map[string]string{
		"type":       eventType,
		"society_id": strconv.FormatInt(entry.SocietyID, 10),
		"flat_id":    strconv.FormatInt(entry.FlatID, 10),
		"entry_id":   strconv.FormatInt(entry.ID, 10),
	}
}
