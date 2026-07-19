package app

import (
	"context"
	"go-server/internal/config"
	handlers "go-server/internal/handlers/v1"
	"go-server/internal/jobs"
	repository "go-server/internal/repositories"
	service "go-server/internal/services"
	authsvc "go-server/internal/services/authSvc"
	bootstrapsvc "go-server/internal/services/bootstrapSvc"
	flatsvc "go-server/internal/services/flatSvc"
	flatauthz "go-server/internal/services/flatAuthz"
	plansvc "go-server/internal/services/planSvc"
	societysvc "go-server/internal/services/societySvc"
	subscriptionsvc "go-server/internal/services/subscriptionSvc"
	visitorentrysvc "go-server/internal/services/visitorEntrySvc"
	visitorsettingsvc "go-server/internal/services/visitorSettingSvc"
	notificationsvc "go-server/internal/services/notificationSvc"
	"time"

	"go-server/pkg/database"
	"go-server/pkg/logger"

	"go.uber.org/zap"
)

type Dependencies struct {
	V1 *V1Handlers
	V2 *V2Handlers

	Society        societysvc.SocietyService
	Flat           flatsvc.FlatService
	Plan           plansvc.PlanService
	Subscription   subscriptionsvc.SubscriptionService
	VisitorInvite  visitorentrysvc.VisitorInviteService
	VisitorEntry   visitorentrysvc.VisitorEntryService
	VisitorSetting visitorsettingsvc.VisitorSettingService
	Notification   notificationsvc.NotificationService

	cleanupCancel context.CancelFunc
}

type V1Handlers struct {
	Auth           *handlers.AuthHandler
	Bootstrap      *handlers.BootstrapHandler
	Society        *handlers.SocietyHandler
	Flat           *handlers.FlatHandler
	Plan           *handlers.PlanHandler
	Subscription   *handlers.SubscriptionHandler
	VisitorEntry   *handlers.VisitorEntryHandler
	VisitorSetting *handlers.VisitorSettingHandler
	Notification   *handlers.NotificationHandler
}

type V2Handlers struct{}

func (d *Dependencies) Shutdown() {
	logger.Info("shutting down background jobs")
	if d.cleanupCancel != nil {
		d.cleanupCancel()
	}
	if d.Notification != nil {
		if err := d.Notification.Close(); err != nil {
			logger.Warn("failed to close notification service", zap.Error(err))
		}
	}
	logger.Info("background jobs stopped")
}

func InitializeDependencies(db *database.Database, cfg *config.Config) (*Dependencies, error) {
	logger.Info("initializing application dependencies")

	userRepo := repository.NewUserRepository(db)
	verificationRepo := repository.NewVerificationRepository(db)
	societyRepo := repository.NewSocietyRepository(db)
	societyMemberRepo := repository.NewSocietyMemberRepository(db)
	flatRepo := repository.NewFlatRepository(db)
	flatClaimRepo := repository.NewFlatClaimRepository(db)
	flatResidentRepo := repository.NewFlatResidentRepository(db)
	planRepo := repository.NewPlanRepository(db)
	subscriptionRepo := repository.NewSubscriptionRepository(db)
	visitorSettingRepo := repository.NewVisitorSettingRepository(db)
	visitorRepo := repository.NewVisitorRepository(db)
	visitorInviteRepo := repository.NewVisitorInviteRepository(db)
	visitorEntryRepo := repository.NewVisitorEntryRepository(db)
	visitorEntryEventRepo := repository.NewVisitorEntryEventRepository(db)
	deviceTokenRepo := repository.NewDeviceTokenRepository(db)
	txManager := repository.NewTransactionManager(db)

	emailSvc, err := service.NewEmailService(cfg)
	if err != nil {
		logger.Error("failed to initialize email service", zap.Error(err))
		return nil, err
	}

	notificationSvc, err := notificationsvc.NewNotificationService(context.Background(), deviceTokenRepo, cfg)
	if err != nil {
		logger.Error("failed to initialize notification service", zap.Error(err))
		return nil, err
	}

	registrationSvc := authsvc.NewRegistrationService(
		userRepo,
		verificationRepo,
		txManager,
		emailSvc,
		&cfg.Auth,
	)

	verificationSvc := authsvc.NewVerificationService(
		userRepo,
		verificationRepo,
		txManager,
		emailSvc,
		&cfg.Auth,
	)

	sessionSvc := authsvc.NewSessionService(
		userRepo,
		&cfg.Auth,
	)

	passwordSvc := authsvc.NewPasswordService(
		userRepo,
		verificationRepo,
		txManager,
		emailSvc,
		&cfg.Auth,
	)

	planSvc := plansvc.NewPlanService(planRepo)
	subscriptionSvc := subscriptionsvc.NewSubscriptionService(subscriptionRepo, societyRepo)
	flatVisitorAuthz := flatauthz.New(societyMemberRepo, flatResidentRepo, flatRepo)
	visitorSettingSvc := visitorsettingsvc.NewVisitorSettingService(
		visitorSettingRepo,
		societyMemberRepo,
		flatResidentRepo,
		flatRepo,
		flatVisitorAuthz,
		txManager,
	)
	visitorInviteSvc, visitorEntrySvc := visitorentrysvc.NewVisitorService(
		visitorRepo,
		visitorInviteRepo,
		visitorEntryRepo,
		visitorEntryEventRepo,
		visitorSettingSvc,
		societyMemberRepo,
		flatResidentRepo,
		flatRepo,
		societyRepo,
		flatVisitorAuthz,
		notificationSvc,
		txManager,
	)

	societySvc := societysvc.NewSocietyService(
		societyRepo,
		societyMemberRepo,
		flatRepo,
		userRepo,
		txManager,
		flatResidentRepo,
		flatClaimRepo,
		planSvc,
		subscriptionSvc,
		visitorSettingSvc,
	)

	flatSvc := flatsvc.NewFlatService(
		flatRepo,
		flatClaimRepo,
		flatResidentRepo,
		societyMemberRepo,
		txManager,
		societySvc,
		subscriptionSvc,
		visitorSettingSvc,
	)

	bootstrapSvc := bootstrapsvc.NewBootstrapService(
		sessionSvc,
		societySvc,
		flatSvc,
	)

	cleanupCtx, cleanupCancel := context.WithCancel(context.Background())
	verificationCleanupJob := jobs.NewVerificationCleanupJob(verificationRepo)
	go verificationCleanupJob.Start(cleanupCtx, time.Hour)

	v1Handlers := &V1Handlers{
		Auth: handlers.NewAuthHandler(
			registrationSvc,
			verificationSvc,
			sessionSvc,
			passwordSvc,
			&cfg.Auth,
		),
		Bootstrap:      handlers.NewBootstrapHandler(bootstrapSvc),
		Society:        handlers.NewSocietyHandler(societySvc),
		Flat:           handlers.NewFlatHandler(flatSvc),
		Plan:           handlers.NewPlanHandler(planSvc),
		Subscription:   handlers.NewSubscriptionHandler(subscriptionSvc),
		VisitorEntry:   handlers.NewVisitorEntryHandler(visitorInviteSvc, visitorEntrySvc),
		VisitorSetting: handlers.NewVisitorSettingHandler(visitorSettingSvc),
		Notification:   handlers.NewNotificationHandler(notificationSvc),
	}

	v2Handlers := &V2Handlers{}

	logger.Info("dependencies initialized successfully")

	return &Dependencies{
		V1:             v1Handlers,
		V2:             v2Handlers,
		Society:        societySvc,
		Flat:           flatSvc,
		Plan:           planSvc,
		Subscription:   subscriptionSvc,
		VisitorInvite:  visitorInviteSvc,
		VisitorEntry:   visitorEntrySvc,
		VisitorSetting: visitorSettingSvc,
		Notification:   notificationSvc,
		cleanupCancel:  cleanupCancel,
	}, nil
}
