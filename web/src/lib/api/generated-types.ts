export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Health check
         * @description Checks if the API server is running.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description API server is healthy */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.HealthCheckResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Liveness check
         * @description Checks if the API process is alive.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description API process is alive */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.LivenessResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Readiness check
         * @description Checks if the API server and database are ready.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description API and database are ready */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ReadinessResponseDoc"];
                    };
                };
                /** @description Database connection failed */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.HealthErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Change password
         * @description Changes the authenticated user's password after verifying the current password, then clears auth cookies.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Change password payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.ChangePasswordRequest"];
                };
            };
            responses: {
                /** @description Password changed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ChangePasswordAPIResponse"];
                    };
                };
                /** @description Password mismatch, password reuse, or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request password reset OTP
         * @description Always returns a generic success message. If the email exists, sends a password reset OTP.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Forgot password payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.ForgotPasswordRequest"];
                };
            };
            responses: {
                /** @description Password reset instructions response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ForgotPasswordAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Login
         * @description Authenticates a verified active user and sets access_token and refresh_token HTTP-only cookies.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Login payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.LoginRequest"];
                };
            };
            responses: {
                /** @description Login successful */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.LoginAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid credentials */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Email not verified or account disabled */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout
         * @description Clears access_token and refresh_token cookies. This route is public and succeeds even if cookies are absent.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Logout successful */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.LogoutAPIResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get current user profile
         * @description Returns the authenticated user's profile. Does not refresh or rotate tokens.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Profile fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.GetProfileAPIResponse"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Account disabled */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh access token
         * @description Validates the refresh_token cookie and reissues only the access_token cookie.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Access token refreshed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.RefreshTokenAPIResponse"];
                    };
                };
                /** @description Missing, invalid, or expired refresh token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Account disabled */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Register a new user
         * @description Creates a user account and sends an email verification OTP.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Registration payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.RegisterRequest"];
                };
            };
            responses: {
                /** @description Account created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.RegisterAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Email or phone already exists */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/resend-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resend email verification OTP
         * @description Sends a fresh email verification OTP for an unverified user.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Resend OTP payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.ResendOTPRequest"];
                };
            };
            responses: {
                /** @description OTP sent successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ResendOTPAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description User not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Email already verified */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reset password
         * @description Resets a user's password using a valid password reset OTP and clears auth cookies on success.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Reset password payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.ResetPasswordRequest"];
                };
            };
            responses: {
                /** @description Password reset successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ResetPasswordAPIResponse"];
                    };
                };
                /** @description Invalid OTP, password reuse, or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description User or active OTP not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Too many OTP attempts */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/resident/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Register resident without OTP
         * @description Creates a resident user for the public flat claim flow, marks the email verified, and sets auth cookies immediately. This does not create a society membership or flat resident.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Resident registration payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.ResidentRegisterRequest"];
                };
            };
            responses: {
                /** @description Resident account created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.LoginAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Email or phone already exists */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/verify-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify email OTP
         * @description Verifies the registration email OTP and marks the user's email as verified.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Email verification payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.VerifyOTPRequest"];
                };
            };
            responses: {
                /** @description Email verified successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.VerifyOTPAPIResponse"];
                    };
                };
                /** @description Invalid OTP or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description User or OTP not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Too many OTP attempts */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/bootstrap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Bootstrap authenticated session
         * @description Returns the authenticated user, memberships, residences, and the default dashboard destination.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Bootstrap fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.BootstrapAPIResponse"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Account disabled or blocked */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/developer/dashboard/bootstrap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get developer dashboard bootstrap
         * @description [Developer] Returns platform summary data for the developer dashboard.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Developer dashboard bootstrap fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.DeveloperDashboardBootstrapAPIResponse"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Developer access required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/flat-claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List flat claims
         * @description [Owner/Admin/Staff/Developer] Lists flat claims with flexible filters and rich joined data.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Claim ID */
                    id?: number;
                    /** @description Society ID */
                    society_id?: number;
                    /** @description Flat ID */
                    flat_id?: number;
                    /** @description User ID */
                    user_id?: number;
                    /** @description Claim status: pending, approved, rejected, cancelled */
                    status?: string;
                    /** @description Search user, contact, flat, block, or status */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat claims fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatClaimsAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Submit flat claim
         * @description [User] Submits a pending claim for a flat.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Submit flat claim payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.SubmitFlatClaimRequest"];
                };
            };
            responses: {
                /** @description Flat claim submitted successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatClaimAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Duplicate pending claim or flat unavailable */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/flat-claims/{claimId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get flat claim
         * @description [User/Developer] Fetches one flat claim with joined user, flat, and society data.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Claim ID */
                    claimId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat claim fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatClaimAPIResponse"];
                    };
                };
                /** @description Invalid claim ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat claim not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/flat-claims/{claimId}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cancel my flat claim
         * @description [User] Cancels the authenticated user's pending flat claim.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Claim ID */
                    claimId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat claim cancelled successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatClaimAPIResponse"];
                    };
                };
                /** @description Invalid claim ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat claim not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid claim transition */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/flat-residents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List flat residents
         * @description [Owner/Admin/Staff/Developer] Lists flat residents with flexible filters and joined user, flat, and society data.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Resident ID */
                    id?: number;
                    /** @description Society ID */
                    society_id?: number;
                    /** @description Flat ID */
                    flat_id?: number;
                    /** @description User ID */
                    user_id?: number;
                    /** @description Resident role: owner, tenant, family */
                    role?: string;
                    /** @description Resident status: active, inactive, moved_out */
                    status?: string;
                    /** @description Primary resident flag */
                    is_primary?: boolean;
                    /** @description Search user, contact, flat, block, role, or status */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Residents fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatResidentsAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/flats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List flats
         * @description [User/Developer] Lists flats with flexible admin/developer filters.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Flat ID */
                    id?: number;
                    /** @description Society ID */
                    society_id?: number;
                    /** @description Block */
                    block?: string;
                    /** @description Floor */
                    floor?: string;
                    /** @description Flat number */
                    flat_number?: string;
                    /** @description Flat status: vacant, occupied, blocked */
                    status?: string;
                    /** @description Active state */
                    is_active?: boolean;
                    /** @description Search flat number, block, floor, status, society name/code */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flats fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatsAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me/flat-claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List my flat claims
         * @description [User] Lists flat claims submitted by the authenticated user.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Society ID */
                    society_id?: number;
                    /** @description Flat ID */
                    flat_id?: number;
                    /** @description Claim status */
                    status?: string;
                    /** @description Search text */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description My flat claims fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatClaimsAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me/residences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List my residences
         * @description [User] Lists flat residences for the authenticated user with joined flat and society data.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Society ID */
                    society_id?: number;
                    /** @description Flat ID */
                    flat_id?: number;
                    /** @description Resident role */
                    role?: string;
                    /** @description Resident status */
                    status?: string;
                    /** @description Primary resident flag */
                    is_primary?: boolean;
                    /** @description Search text */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description My residences fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.MyResidencesAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List plans
         * @description [Developer/User] Lists plans with flexible filters.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Plan code */
                    code?: string;
                    /** @description Billing cycle */
                    billing_cycle?: string;
                    /** @description Active state */
                    is_active?: boolean;
                    /** @description Search text */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Plans fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PlansAPIResponse"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create plan
         * @description [Developer] Creates a subscription plan.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Create plan payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.CreatePlanRequest"];
                };
            };
            responses: {
                /** @description Plan created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PlanAPIResponse"];
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Duplicate plan */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/plans/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get plan
         * @description [Developer/User] Fetches a plan by flexible filter.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Plan ID */
                    id?: number;
                    /** @description Plan code */
                    code?: string;
                    /** @description Plan name */
                    name?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Plan fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PlanAPIResponse"];
                    };
                };
                /** @description Plan not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/plans/{planId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update plan
         * @description [Developer] Updates a subscription plan.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Plan ID */
                    planId: number;
                };
                cookie?: never;
            };
            /** @description Update plan payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.UpdatePlanRequest"];
                };
            };
            responses: {
                /** @description Plan updated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PlanAPIResponse"];
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Plan not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/v1/plans/{planId}/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Activate plan
         * @description [Developer] Activates a subscription plan.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Plan ID */
                    planId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Plan activated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PlanAPIResponse"];
                    };
                };
                /** @description Plan not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/plans/{planId}/deactivate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Deactivate plan
         * @description [Developer] Deactivates a subscription plan.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Plan ID */
                    planId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Plan deactivated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PlanAPIResponse"];
                    };
                };
                /** @description Plan not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/public/societies/{societyCode}/claim-options": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get public resident claim options
         * @description Public QR flow endpoint that resolves an active society code and returns safe society details plus active flats for resident claims.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society code */
                    societyCode: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Claim options fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PublicClaimOptionsAPIResponse"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List societies
         * @description [Developer] Lists societies with flexible filters for admin/developer panels.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Society status */
                    status?: string;
                    /** @description Search text */
                    search?: string;
                    /** @description Society name */
                    name?: string;
                    /** @description Society code */
                    code?: string;
                    /** @description City */
                    city?: string;
                    /** @description State */
                    state?: string;
                    /** @description Country */
                    country?: string;
                    /** @description Pincode */
                    pincode?: string;
                    /** @description Created by user ID */
                    created_by?: number;
                    /** @description Approved by user ID */
                    approved_by?: number;
                    /** @description Rejected by user ID */
                    rejected_by?: number;
                    /** @description Suspended by user ID */
                    suspended_by?: number;
                    /** @description Created from RFC3339 timestamp */
                    created_from?: string;
                    /** @description Created to RFC3339 timestamp */
                    created_to?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                    /** @description Sort by: created_at, updated_at, name, city, status */
                    sort_by?: string;
                    /** @description Sort order: asc, desc */
                    sort_order?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Societies fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PaginatedSocietiesAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create society request
         * @description [User] Creates a pending society request and assigns the requester as owner.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Create society payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.CreateSocietyRequest"];
                };
            };
            responses: {
                /** @description Society request created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Duplicate society request */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/my": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List my societies
         * @description [User] Lists societies where the authenticated user has a membership.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description My societies fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.MySocietiesAPIResponse"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get society
         * @description [User/Developer] Fetches one society by ID. Developer routes may use the same handler with broader guards.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Society fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyDetailAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Soft delete society
         * @description [User] Soft-deletes a society. Requires active owner membership.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Society deleted successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.MessageAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update society
         * @description [User] Updates society profile fields. Requires active owner/admin membership.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            /** @description Update society payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.UpdateSocietyRequest"];
                };
            };
            responses: {
                /** @description Society updated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/v1/societies/{societyId}/allmember": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all society members for developer
         * @description [Developer] Lists society members with filters without requiring owner/admin society membership.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Search full name, email, phone, role, or status */
                    search?: string;
                    /** @description Member role */
                    role?: string;
                    /** @description Member status */
                    status?: string;
                    /** @description User ID */
                    user_id?: number;
                    /** @description Invited by user ID */
                    invited_by?: number;
                    /** @description Removed by user ID */
                    removed_by?: number;
                    /** @description Joined from RFC3339 timestamp */
                    joined_from?: string;
                    /** @description Joined to RFC3339 timestamp */
                    joined_to?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                    /** @description Sort by: joined_at, role, status */
                    sort_by?: string;
                    /** @description Sort order: asc, desc */
                    sort_order?: string;
                };
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Members fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PaginatedMembersAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Approve society
         * @description [Developer] Approves a pending society request. Transition allowed: pending -> active.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Society approved successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid society lifecycle transition */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/dashboard/bootstrap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get society dashboard bootstrap
         * @description [Owner/Admin] Returns dashboard summary data for a society.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Society dashboard bootstrap fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyDashboardBootstrapAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flat-claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List society flat claims
         * @description [Owner/Admin/Staff] Lists flat claims inside one society with flexible filters and rich joined data.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Flat ID */
                    flat_id?: number;
                    /** @description User ID */
                    user_id?: number;
                    /** @description Claim status: pending, approved, rejected, cancelled */
                    status?: string;
                    /** @description Search user, contact, flat, block, or status */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat claims fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatClaimsAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flat-claims/{claimId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get society flat claim
         * @description [Owner/Admin/Staff] Fetches one flat claim inside a society with joined user, flat, and society data.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Claim ID */
                    claimId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat claim fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatClaimAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat claim not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flat-claims/{claimId}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Approve flat claim
         * @description [Owner/Admin/Staff] Transactionally approves a pending flat claim, activates society membership, creates flat resident, marks flat occupied, and returns rich joined data.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Claim ID */
                    claimId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat claim approved successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatApprovalAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat claim or flat not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat unavailable, duplicate resident, or primary resident conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flat-claims/{claimId}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reject flat claim
         * @description [Owner/Admin/Staff] Rejects a pending flat claim with a reason.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Claim ID */
                    claimId: number;
                };
                cookie?: never;
            };
            /** @description Reject flat claim payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.RejectFlatClaimRequest"];
                };
            };
            responses: {
                /** @description Flat claim rejected successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatClaimAPIResponse"];
                    };
                };
                /** @description Invalid request or path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat claim not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid claim transition */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List society flats
         * @description [Owner/Admin/Staff] Lists flats inside one society with paginated metadata.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Block */
                    block?: string;
                    /** @description Floor */
                    floor?: string;
                    /** @description Flat number */
                    flat_number?: string;
                    /** @description Flat status: vacant, occupied, blocked */
                    status?: string;
                    /** @description Active state */
                    is_active?: boolean;
                    /** @description Search flat number, block, floor, or status */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flats fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PaginatedFlatsAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create flat
         * @description [Owner/Admin/Staff] Creates a flat inside a society.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            /** @description Create flat payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.CreateFlatRequest"];
                };
            };
            responses: {
                /** @description Flat created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Duplicate flat */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Bulk create flats
         * @description [Owner/Admin/Staff] Creates multiple flats inside a society in one request.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            /** @description Bulk create flats payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.BulkCreateFlatsRequest"];
                };
            };
            responses: {
                /** @description Flats created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.BulkFlatsAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Duplicate flat */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get flat stats
         * @description [Owner/Admin/Staff/Developer] Returns flat counts by status and active state for a society.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat stats fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatStatsAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get flat
         * @description [User/Developer] Fetches one flat with society context.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Deactivate flat
         * @description [Owner/Admin/Staff] Deactivates a flat. This is not a hard delete.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat deleted successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.MessageAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update flat
         * @description [Owner/Admin/Staff] Updates flat details, status, active state, or metadata.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                };
                cookie?: never;
            };
            /** @description Update flat payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.UpdateFlatRequest"];
                };
            };
            responses: {
                /** @description Flat updated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}/block": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Block flat
         * @description [Owner/Admin/Staff] Blocks an active flat so it cannot receive claims or residents.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat blocked successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid flat transition */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}/residents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List flat residents for a society flat
         * @description [Owner/Admin/Staff] Lists residents for the flat identified in the path.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Resident role: owner, tenant, family */
                    role?: string;
                    /** @description Resident status: active, inactive, moved_out */
                    status?: string;
                    /** @description Primary resident flag */
                    is_primary?: boolean;
                    /** @description Search user, contact, flat, block, role, or status */
                    search?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                };
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Residents fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatResidentsAPIResponse"];
                    };
                };
                /** @description Invalid path or query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}/residents/users/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Add resident to flat
         * @description [Owner/Admin/Staff] Manually adds a user as an active resident of a flat.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                    /** @description User ID */
                    userId: number;
                };
                cookie?: never;
            };
            /** @description Add flat resident payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.AddFlatResidentRequest"];
                };
            };
            responses: {
                /** @description Resident added successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatResidentAPIResponse"];
                    };
                };
                /** @description Invalid request or path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat or user not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Duplicate resident, blocked flat, or primary resident conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}/residents/{residentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get flat resident
         * @description [User/Developer] Fetches one flat resident with joined user, flat, and society data.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                    /** @description Resident ID */
                    residentId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Resident fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatResidentAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Resident not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Remove resident from flat
         * @description [Owner/Admin/Staff] Marks an active resident inactive and marks the flat vacant if this was the last active resident.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                    /** @description Resident ID */
                    residentId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Resident removed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.MessageAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Resident not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}/residents/{residentId}/move-out": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Move out resident
         * @description [Owner/Admin/Staff] Marks a resident moved out and marks the flat vacant if this was the last active resident.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                    /** @description Resident ID */
                    residentId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Resident moved out successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatResidentAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Resident not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}/residents/{residentId}/primary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Change primary resident
         * @description [Owner/Admin/Staff] Transactionally changes the active primary resident for a flat.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                    /** @description Resident ID */
                    residentId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Primary resident changed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatResidentAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Resident not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Primary resident conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}/residents/{residentId}/role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update flat resident role
         * @description [Owner/Admin/Staff] Updates an active flat resident role.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                    /** @description Resident ID */
                    residentId: number;
                };
                cookie?: never;
            };
            /** @description Update flat resident role payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.UpdateFlatResidentRoleRequest"];
                };
            };
            responses: {
                /** @description Resident role updated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatResidentAPIResponse"];
                    };
                };
                /** @description Invalid request or path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Resident not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/v1/societies/{societyId}/flats/{flatId}/unblock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Unblock flat
         * @description [Owner/Admin/Staff] Unblocks a blocked flat and returns it to vacant state.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Flat ID */
                    flatId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Flat unblocked successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.FlatAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Flat not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid flat transition */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/guards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create guard
         * @description [Owner/Admin] Creates a verified staff user for guard access without OTP or invite token.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            /** @description Create guard payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.CreateGuardRequest"];
                };
            };
            responses: {
                /** @description Guard created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.GuardAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Duplicate email, phone, or member */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List society members
         * @description [User] Lists society members with filters for owner/admin member management screens.
         */
        get: {
            parameters: {
                query?: {
                    /** @description Search full name, email, phone, role, or status */
                    search?: string;
                    /** @description Member role */
                    role?: string;
                    /** @description Member status */
                    status?: string;
                    /** @description User ID */
                    user_id?: number;
                    /** @description Invited by user ID */
                    invited_by?: number;
                    /** @description Removed by user ID */
                    removed_by?: number;
                    /** @description Joined from RFC3339 timestamp */
                    joined_from?: string;
                    /** @description Joined to RFC3339 timestamp */
                    joined_to?: string;
                    /** @description Limit */
                    limit?: number;
                    /** @description Offset */
                    offset?: number;
                    /** @description Sort by: joined_at, role, status */
                    sort_by?: string;
                    /** @description Sort order: asc, desc */
                    sort_order?: string;
                };
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Members fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.PaginatedMembersAPIResponse"];
                    };
                };
                /** @description Invalid query parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Add society member
         * @description [User] Adds a member to a society. Requires active owner/admin membership.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            /** @description Add member payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.AddSocietyMemberRequest"];
                };
            };
            responses: {
                /** @description Member added successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyMemberAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Duplicate member or owner protection */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/members/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get society member summary
         * @description [User] Returns member counts for a society.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Member summary fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyMemberSummaryAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/members/{memberId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get society member
         * @description [User] Fetches one society member by member ID inside a society.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Member ID */
                    memberId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Member fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyMemberAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Member not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/members/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove member
         * @description [User] Removes a member from the society. Requires active owner/admin membership and protects the last owner.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description User ID */
                    userId: number;
                };
                cookie?: never;
            };
            /** @description Removal reason */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["models.SocietyReasonRequest"];
                };
            };
            responses: {
                /** @description Member removed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.MessageAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Member not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Owner protection conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/members/{userId}/reactivate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reactivate member
         * @description [User] Reactivates a suspended or removed member. Requires active owner/admin membership.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description User ID */
                    userId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Member reactivated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyMemberAPIResponse"];
                    };
                };
                /** @description Invalid path parameter */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Member not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/members/{userId}/role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Change member role
         * @description [User] Changes a member role. Requires active owner/admin membership and protects the last owner.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description User ID */
                    userId: number;
                };
                cookie?: never;
            };
            /** @description Change role payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.ChangeSocietyMemberRoleRequest"];
                };
            };
            responses: {
                /** @description Member role changed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyMemberAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Member not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Owner protection conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/v1/societies/{societyId}/members/{userId}/suspend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Suspend member
         * @description [User] Suspends a member. Requires active owner/admin membership and protects the last owner.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description User ID */
                    userId: number;
                };
                cookie?: never;
            };
            /** @description Suspension reason */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["models.SocietyReasonRequest"];
                };
            };
            responses: {
                /** @description Member suspended successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyMemberAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Member not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Owner protection conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/onboarding/bootstrap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get society onboarding bootstrap
         * @description [Owner/Admin] Returns whether the society has the required flats and staff setup.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Society onboarding bootstrap fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyOnboardingBootstrapAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/reactivate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reactivate society
         * @description [Developer] Reactivates a suspended society. Transition allowed: suspended -> active.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Society reactivated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid society lifecycle transition */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reject society
         * @description [Developer] Rejects a pending society request. Transition allowed: pending -> rejected.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            /** @description Rejection reason */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.SocietyReasonRequest"];
                };
            };
            responses: {
                /** @description Society rejected successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid society lifecycle transition */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restore soft-deleted society
         * @description [Developer] Restores a soft-deleted society to pending status.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Society restored successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyAPIResponse"];
                    };
                };
                /** @description Invalid society ID */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society is not soft-deleted */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/subscriptions/plans/{planId}/pending": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create pending subscription */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Plan ID */
                    planId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Subscription created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionAPIResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/subscriptions/plans/{planId}/trial": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create trial subscription */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                    /** @description Plan ID */
                    planId: number;
                };
                cookie?: never;
            };
            /** @description Trial subscription payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.CreateTrialSubscriptionRequest"];
                };
            };
            responses: {
                /** @description Trial subscription created successfully */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionAPIResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/suspend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Suspend society
         * @description [Developer] Suspends an active society. Transition allowed: active -> suspended.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            /** @description Suspension reason */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.SocietyReasonRequest"];
                };
            };
            responses: {
                /** @description Society suspended successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Society not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Invalid society lifecycle transition */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/societies/{societyId}/transfer-ownership": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Transfer society ownership
         * @description [User] Transfers ownership to another user and leaves exactly one active owner.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Society ID */
                    societyId: number;
                };
                cookie?: never;
            };
            /** @description Transfer ownership payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.TransferOwnershipRequest"];
                };
            };
            responses: {
                /** @description Ownership transferred successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SocietyMemberAPIResponse"];
                    };
                };
                /** @description Invalid request or validation error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Missing, invalid, or expired access token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Insufficient society role */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Owner protection conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
                /** @description Internal server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.ErrorResponseDoc"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List subscriptions */
        get: {
            parameters: {
                query?: {
                    /** @description Society ID */
                    society_id?: number;
                    /** @description Plan ID */
                    plan_id?: number;
                    /** @description Subscription status */
                    status?: string;
                    /** @description Search text */
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Subscriptions fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionsAPIResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get subscription */
        get: {
            parameters: {
                query?: {
                    /** @description Subscription ID */
                    id?: number;
                    /** @description Society ID */
                    society_id?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Subscription fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionAPIResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get subscription stats */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Subscription stats fetched successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionStatsAPIResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/{subscriptionId}/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Activate subscription */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Subscription ID */
                    subscriptionId: number;
                };
                cookie?: never;
            };
            /** @description Activate subscription payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.ActivateSubscriptionRequest"];
                };
            };
            responses: {
                /** @description Subscription activated successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionAPIResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/{subscriptionId}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel subscription */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Subscription ID */
                    subscriptionId: number;
                };
                cookie?: never;
            };
            /** @description Cancel subscription payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.CancelSubscriptionRequest"];
                };
            };
            responses: {
                /** @description Subscription cancelled successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionAPIResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/{subscriptionId}/expire": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Expire subscription */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Subscription ID */
                    subscriptionId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Subscription expired successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionAPIResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/{subscriptionId}/plans/{planId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Change subscription plan */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Subscription ID */
                    subscriptionId: number;
                    /** @description New plan ID */
                    planId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Subscription plan changed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionAPIResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/subscriptions/{subscriptionId}/renew": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Renew subscription */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Subscription ID */
                    subscriptionId: number;
                };
                cookie?: never;
            };
            /** @description Renew subscription payload */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["models.RenewSubscriptionRequest"];
                };
            };
            responses: {
                /** @description Subscription renewed successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["models.SubscriptionAPIResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        "models.ActivateSubscriptionRequest": {
            ends_at: string;
            metadata?: {
                [key: string]: unknown;
            };
            starts_at: string;
        };
        "models.AddFlatResidentRequest": {
            is_primary?: boolean;
            metadata?: {
                [key: string]: unknown;
            };
            role: components["schemas"]["models.FlatResidentRole"];
        };
        "models.AddSocietyMemberRequest": {
            metadata?: {
                [key: string]: unknown;
            };
            role: components["schemas"]["models.SocietyMemberRole"];
            society_id: number;
            user_id: number;
        };
        "models.ApproveFlatClaimResponse": {
            claim?: components["schemas"]["models.FlatClaimResponse"];
            flat?: components["schemas"]["models.FlatResponse"];
            resident?: components["schemas"]["models.FlatResidentResponse"];
        };
        /** @enum {string} */
        "models.AuthProvider": "email" | "google" | "apple" | "phone";
        /** @enum {string} */
        "models.BillingCycle": "monthly" | "yearly";
        "models.BootstrapAPIResponse": {
            data?: components["schemas"]["models.BootstrapData"];
            /** @example Bootstrap fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.BootstrapData": {
            defaultDashboard?: components["schemas"]["models.DefaultDashboardResponse"];
            memberships?: components["schemas"]["models.SocietyMemberResponse"][];
            residences?: components["schemas"]["models.FlatResidentResponse"][];
            user?: components["schemas"]["models.UserResponse"];
        };
        "models.BulkCreateFlatsRequest": {
            flats: components["schemas"]["models.CreateFlatRequest"][];
        };
        "models.BulkCreateFlatsResponse": {
            items?: components["schemas"]["models.FlatResponse"][];
            total?: number;
        };
        "models.BulkFlatsAPIResponse": {
            data?: components["schemas"]["models.BulkFlatsData"];
            /** @example Flats created successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.BulkFlatsData": {
            flats?: components["schemas"]["models.BulkCreateFlatsResponse"];
        };
        "models.CancelSubscriptionRequest": {
            metadata?: {
                [key: string]: unknown;
            };
            reason: string;
        };
        "models.ChangePasswordAPIResponse": {
            data?: components["schemas"]["models.MessageData"];
            /** @example Password changed successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.ChangePasswordRequest": {
            confirm_password: string;
            current_password: string;
            new_password: string;
        };
        "models.ChangeSocietyMemberRoleRequest": {
            role: components["schemas"]["models.SocietyMemberRole"];
            society_id: number;
            user_id: number;
        };
        "models.CreateFlatRequest": {
            block?: string;
            flat_number: string;
            floor?: string;
            metadata?: {
                [key: string]: unknown;
            };
        };
        "models.CreateGuardRequest": {
            email: string;
            first_name: string;
            last_name?: string;
            password: string;
            phone_number: string;
        };
        "models.CreateGuardResponse": {
            member?: components["schemas"]["models.SocietyMemberResponse"];
            user?: components["schemas"]["models.UserResponse"];
        };
        "models.CreatePlanRequest": {
            billing_cycle: components["schemas"]["models.BillingCycle"];
            code: string;
            currency: string;
            description?: string;
            features?: {
                [key: string]: unknown;
            };
            max_admins?: number;
            max_flats: number;
            max_residents: number;
            max_staff?: number;
            name: string;
            price_amount_paise?: number;
        };
        "models.CreateSocietyRequest": {
            address_line1?: string;
            address_line2?: string;
            city?: string;
            country?: string;
            email?: string;
            landmark?: string;
            metadata?: {
                [key: string]: unknown;
            };
            name: string;
            phone_number?: string;
            pincode?: string;
            society_code?: string;
            state?: string;
            total_blocks?: number;
            total_flats?: number;
        };
        "models.CreateTrialSubscriptionRequest": {
            ends_at?: string;
            metadata?: {
                [key: string]: unknown;
            };
            starts_at: string;
            trial_ends_at: string;
        };
        /** @enum {string} */
        "models.DashboardKind": "developer" | "society_admin" | "select_society" | "onboarding";
        "models.DefaultDashboardResponse": {
            kind?: components["schemas"]["models.DashboardKind"];
            path?: string;
            society_id?: number;
        };
        "models.DevOTPMessageData": {
            /** @example 123456 */
            dev_otp?: string;
            /** @example Please verify your email using the OTP sent to your email address */
            message?: string;
        };
        "models.DeveloperDashboardBootstrapAPIResponse": {
            data?: components["schemas"]["models.DeveloperDashboardBootstrapData"];
            /** @example Developer dashboard bootstrap fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.DeveloperDashboardBootstrapData": {
            dashboard?: components["schemas"]["models.DeveloperDashboardBootstrapResponse"];
        };
        "models.DeveloperDashboardBootstrapResponse": {
            plan_stats?: components["schemas"]["models.DeveloperDashboardPlanStatsResponse"];
            recent_pending_societies?: components["schemas"]["models.SocietyResponse"][];
            recent_subscriptions?: components["schemas"]["models.SocietySubscriptionResponse"][];
            residence_stats?: components["schemas"]["models.DeveloperDashboardResidenceStatsResponse"];
            society_stats?: components["schemas"]["models.DeveloperDashboardSocietyStatsResponse"];
            subscription_stats?: components["schemas"]["models.SubscriptionStatsResponse"];
        };
        "models.DeveloperDashboardPlanStatsResponse": {
            active?: number;
            inactive?: number;
            total?: number;
        };
        "models.DeveloperDashboardResidenceStatsResponse": {
            active_residents?: number;
            total_residents?: number;
        };
        "models.DeveloperDashboardSocietyStatsResponse": {
            active?: number;
            pending?: number;
            rejected?: number;
            suspended?: number;
            total?: number;
        };
        "models.ErrorData": {
            code?: string;
            details?: {
                [key: string]: unknown;
            };
            message?: string;
        };
        "models.ErrorResponseDoc": {
            error?: components["schemas"]["models.ErrorData"];
            /** @example false */
            success?: boolean;
        };
        "models.FlatAPIResponse": {
            data?: components["schemas"]["models.FlatData"];
            /** @example Flat fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.FlatApprovalAPIResponse": {
            data?: components["schemas"]["models.FlatApprovalData"];
            /** @example Flat claim approved successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.FlatApprovalData": {
            approval?: components["schemas"]["models.ApproveFlatClaimResponse"];
        };
        "models.FlatClaimAPIResponse": {
            data?: components["schemas"]["models.FlatClaimData"];
            /** @example Flat claim fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.FlatClaimData": {
            claim?: components["schemas"]["models.FlatClaimResponse"];
        };
        "models.FlatClaimResponse": {
            block?: string;
            cancelled_at?: string;
            created_at?: string;
            flat_id?: number;
            flat_number?: string;
            flat_status?: components["schemas"]["models.FlatStatus"];
            floor?: string;
            id?: number;
            note?: string;
            rejection_reason?: string;
            requested_primary?: boolean;
            requested_role?: components["schemas"]["models.FlatResidentRole"];
            reviewed_at?: string;
            reviewed_by?: number;
            society_code?: string;
            society_id?: number;
            society_name?: string;
            status?: components["schemas"]["models.FlatClaimStatus"];
            updated_at?: string;
            user_email?: string;
            user_id?: number;
            user_name?: string;
            user_phone?: string;
        };
        "models.FlatClaimStatsResponse": {
            approved_claims?: number;
            cancelled_claims?: number;
            pending_claims?: number;
            rejected_claims?: number;
            total_claims?: number;
        };
        /** @enum {string} */
        "models.FlatClaimStatus": "pending" | "approved" | "rejected" | "cancelled";
        "models.FlatClaimsAPIResponse": {
            data?: components["schemas"]["models.FlatClaimsData"];
            /** @example Flat claims fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.FlatClaimsData": {
            claims?: components["schemas"]["models.FlatClaimResponse"][];
        };
        "models.FlatData": {
            flat?: components["schemas"]["models.FlatResponse"];
        };
        "models.FlatResidentAPIResponse": {
            data?: components["schemas"]["models.FlatResidentData"];
            /** @example Resident fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.FlatResidentData": {
            resident?: components["schemas"]["models.FlatResidentResponse"];
        };
        "models.FlatResidentResponse": {
            block?: string;
            created_at?: string;
            created_by?: number;
            flat_id?: number;
            flat_number?: string;
            floor?: string;
            id?: number;
            is_primary?: boolean;
            moved_in_at?: string;
            moved_out_at?: string;
            role?: components["schemas"]["models.FlatResidentRole"];
            society_code?: string;
            society_id?: number;
            society_name?: string;
            status?: components["schemas"]["models.FlatResidentStatus"];
            updated_at?: string;
            user_email?: string;
            user_id?: number;
            user_name?: string;
            user_phone?: string;
        };
        /** @enum {string} */
        "models.FlatResidentRole": "owner" | "tenant" | "family";
        /** @enum {string} */
        "models.FlatResidentStatus": "active" | "inactive" | "moved_out";
        "models.FlatResidentsAPIResponse": {
            data?: components["schemas"]["models.FlatResidentsData"];
            /** @example Residents fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.FlatResidentsData": {
            residents?: components["schemas"]["models.FlatResidentResponse"][];
        };
        "models.FlatResponse": {
            block?: string;
            created_at?: string;
            created_by?: number;
            flat_number?: string;
            floor?: string;
            id?: number;
            is_active?: boolean;
            society_code?: string;
            society_id?: number;
            society_name?: string;
            status?: components["schemas"]["models.FlatStatus"];
            updated_at?: string;
        };
        "models.FlatStatsAPIResponse": {
            data?: components["schemas"]["models.FlatStatsData"];
            /** @example Flat stats fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.FlatStatsData": {
            stats?: components["schemas"]["models.FlatStatsResponse"];
        };
        "models.FlatStatsResponse": {
            active_flats?: number;
            blocked_flats?: number;
            inactive_flats?: number;
            occupied_flats?: number;
            society_id?: number;
            total_flats?: number;
            vacant_flats?: number;
        };
        /** @enum {string} */
        "models.FlatStatus": "vacant" | "occupied" | "blocked";
        "models.FlatsAPIResponse": {
            data?: components["schemas"]["models.FlatsData"];
            /** @example Flats fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.FlatsData": {
            flats?: components["schemas"]["models.FlatResponse"][];
        };
        "models.ForgotPasswordAPIResponse": {
            data?: components["schemas"]["models.DevOTPMessageData"];
            /** @example if this email exists, password reset instructions have been sent */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.ForgotPasswordRequest": {
            email: string;
        };
        "models.GetProfileAPIResponse": {
            data?: components["schemas"]["models.UserData"];
            /** @example Profile fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        /** @enum {string} */
        "models.GlobalRole": "user" | "developer" | "super_admin";
        "models.GuardAPIResponse": {
            data?: components["schemas"]["models.GuardData"];
            /** @example Guard created successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.GuardData": {
            guard?: components["schemas"]["models.CreateGuardResponse"];
        };
        "models.HealthCheckResponseDoc": {
            /** @example go-server */
            app?: string;
            /** @example development */
            environment?: string;
            /** @example healthy */
            status?: string;
            /** @example 2026-05-26T02:55:50Z */
            timestamp?: string;
            /** @example 1.0.0 */
            version?: string;
        };
        "models.HealthErrorResponseDoc": {
            /** @example database connection failed */
            error?: string;
            /** @example not_ready */
            status?: string;
        };
        "models.LivenessResponseDoc": {
            /** @example alive */
            status?: string;
            /** @example 2026-05-26T02:55:50Z */
            timestamp?: string;
        };
        "models.LoginAPIResponse": {
            data?: components["schemas"]["models.UserData"];
            /** @example Login successful */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.LoginRequest": {
            email?: string;
            password: string;
            phone_number?: string;
        };
        "models.LogoutAPIResponse": {
            data?: components["schemas"]["models.MessageData"];
            /** @example Logout successful */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.MessageAPIResponse": {
            data?: components["schemas"]["models.MessageData"];
            /** @example Request completed successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.MessageData": {
            /** @example Request completed successfully */
            message?: string;
        };
        "models.MyResidencesAPIResponse": {
            data?: components["schemas"]["models.MyResidencesData"];
            /** @example My residences fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.MyResidencesData": {
            residences?: components["schemas"]["models.FlatResidentResponse"][];
        };
        "models.MySocietiesAPIResponse": {
            data?: components["schemas"]["models.MySocietiesData"];
            /** @example My societies fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.MySocietiesData": {
            societies?: components["schemas"]["models.MySocietyResponse"][];
        };
        "models.MySocietyResponse": {
            member?: components["schemas"]["models.SocietyMemberResponse"];
            society?: components["schemas"]["models.SocietyResponse"];
        };
        "models.PaginatedFlatsAPIResponse": {
            data?: components["schemas"]["models.PaginatedFlatsData"];
            /** @example Flats fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.PaginatedFlatsData": {
            flats?: components["schemas"]["models.PaginatedFlatsResponse"];
        };
        "models.PaginatedFlatsResponse": {
            items?: components["schemas"]["models.FlatResponse"][];
            limit?: number;
            offset?: number;
            total?: number;
        };
        "models.PaginatedMembersAPIResponse": {
            data?: components["schemas"]["models.PaginatedMembersData"];
            /** @example Members fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.PaginatedMembersData": {
            members?: components["schemas"]["models.PaginatedMembersResponse"];
        };
        "models.PaginatedMembersResponse": {
            items?: components["schemas"]["models.SocietyMemberResponse"][];
            limit?: number;
            offset?: number;
            total?: number;
        };
        "models.PaginatedSocietiesAPIResponse": {
            data?: components["schemas"]["models.PaginatedSocietiesData"];
            /** @example Societies fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.PaginatedSocietiesData": {
            societies?: components["schemas"]["models.PaginatedSocietiesResponse"];
        };
        "models.PaginatedSocietiesResponse": {
            items?: components["schemas"]["models.SocietyResponse"][];
            limit?: number;
            offset?: number;
            total?: number;
        };
        "models.PlanAPIResponse": {
            data?: components["schemas"]["models.PlanData"];
            /** @example Plan fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.PlanData": {
            plan?: components["schemas"]["models.PlanResponse"];
        };
        "models.PlanResponse": {
            billing_cycle?: components["schemas"]["models.BillingCycle"];
            code?: string;
            created_at?: string;
            currency?: string;
            description?: string;
            features?: {
                [key: string]: unknown;
            };
            id?: number;
            is_active?: boolean;
            max_admins?: number;
            max_flats?: number;
            max_residents?: number;
            max_staff?: number;
            name?: string;
            price_amount_paise?: number;
            updated_at?: string;
        };
        "models.PlansAPIResponse": {
            data?: components["schemas"]["models.PlansData"];
            /** @example Plans fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.PlansData": {
            plans?: components["schemas"]["models.PlanResponse"][];
        };
        "models.PublicClaimFlatResponse": {
            block?: string;
            flat_number?: string;
            floor?: string;
            id?: number;
            status?: components["schemas"]["models.FlatStatus"];
        };
        "models.PublicClaimOptionsAPIResponse": {
            data?: components["schemas"]["models.PublicClaimOptionsData"];
            /** @example Claim options fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.PublicClaimOptionsData": {
            flats?: components["schemas"]["models.PublicClaimFlatResponse"][];
            society?: components["schemas"]["models.PublicClaimSocietyResponse"];
        };
        "models.PublicClaimSocietyResponse": {
            city?: string;
            country?: string;
            id?: number;
            name?: string;
            pincode?: string;
            society_code?: string;
            state?: string;
            total_flats?: number;
        };
        "models.ReadinessResponseDoc": {
            /** @example connected */
            database?: string;
            /** @example ready */
            status?: string;
            /** @example 2026-05-26T02:55:50Z */
            timestamp?: string;
        };
        "models.RefreshTokenAPIResponse": {
            data?: components["schemas"]["models.MessageData"];
            /** @example Access token refreshed successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.RegisterAPIResponse": {
            data?: components["schemas"]["models.UserMessageData"];
            /** @example Account created successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.RegisterRequest": {
            email: string;
            first_name: string;
            last_name?: string;
            password: string;
            phone_number: string;
        };
        "models.RejectFlatClaimRequest": {
            reason: string;
        };
        "models.RenewSubscriptionRequest": {
            ends_at: string;
            metadata?: {
                [key: string]: unknown;
            };
            starts_at: string;
        };
        "models.ResendOTPAPIResponse": {
            data?: components["schemas"]["models.DevOTPMessageData"];
            /** @example verification OTP sent successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.ResendOTPRequest": {
            email: string;
        };
        "models.ResetPasswordAPIResponse": {
            data?: components["schemas"]["models.MessageData"];
            /** @example Password reset successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.ResetPasswordRequest": {
            confirm_password: string;
            email: string;
            new_password: string;
            otp: string;
        };
        "models.ResidentRegisterRequest": {
            email: string;
            first_name: string;
            last_name?: string;
            password: string;
            phone_number: string;
        };
        "models.SocietyAPIResponse": {
            data?: components["schemas"]["models.SocietyData"];
            /** @example Society request created successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SocietyDashboardBootstrapAPIResponse": {
            data?: components["schemas"]["models.SocietyDashboardBootstrapData"];
            /** @example Society dashboard bootstrap fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SocietyDashboardBootstrapData": {
            dashboard?: components["schemas"]["models.SocietyDashboardBootstrapResponse"];
        };
        "models.SocietyDashboardBootstrapResponse": {
            claim_stats?: components["schemas"]["models.FlatClaimStatsResponse"];
            current_subscription?: components["schemas"]["models.SocietySubscriptionResponse"];
            flat_stats?: components["schemas"]["models.FlatStatsResponse"];
            member_stats?: components["schemas"]["models.SocietyDashboardMemberStatsResponse"];
            plan_ads?: components["schemas"]["models.PlanResponse"][];
            recent_pending_claims?: components["schemas"]["models.FlatClaimResponse"][];
            society?: components["schemas"]["models.SocietyResponse"];
            subscription_usage?: components["schemas"]["models.SocietyDashboardSubscriptionUsageResponse"];
        };
        "models.SocietyDashboardMemberStatsResponse": {
            admins?: number;
            owners?: number;
            residents?: number;
            staff?: number;
            total_active_members?: number;
        };
        "models.SocietyDashboardQuotaUsageResponse": {
            limit?: number;
            percent?: number;
            remaining?: number;
            used?: number;
        };
        "models.SocietyDashboardSubscriptionUsageResponse": {
            admins?: components["schemas"]["models.SocietyDashboardQuotaUsageResponse"];
            flats?: components["schemas"]["models.SocietyDashboardQuotaUsageResponse"];
            residents?: components["schemas"]["models.SocietyDashboardQuotaUsageResponse"];
            staff?: components["schemas"]["models.SocietyDashboardQuotaUsageResponse"];
        };
        "models.SocietyData": {
            society?: components["schemas"]["models.SocietyResponse"];
        };
        "models.SocietyDetailAPIResponse": {
            data?: components["schemas"]["models.SocietyDetailData"];
            /** @example Society fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SocietyDetailData": {
            society?: components["schemas"]["models.SocietyDetailResponse"];
        };
        "models.SocietyDetailResponse": {
            address_line1?: string;
            address_line2?: string;
            approved_at?: string;
            approved_by?: number;
            city?: string;
            country?: string;
            created_at?: string;
            created_by?: number;
            email?: string;
            id?: number;
            landmark?: string;
            members_count?: number;
            name?: string;
            phone_number?: string;
            pincode?: string;
            rejected_at?: string;
            rejected_by?: number;
            rejection_reason?: string;
            society_code?: string;
            state?: string;
            status?: components["schemas"]["models.SocietyStatus"];
            suspended_at?: string;
            suspended_by?: number;
            suspension_reason?: string;
            total_blocks?: number;
            total_flats?: number;
            updated_at?: string;
        };
        "models.SocietyMemberAPIResponse": {
            data?: components["schemas"]["models.SocietyMemberData"];
            /** @example Member fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SocietyMemberData": {
            member?: components["schemas"]["models.SocietyMemberResponse"];
        };
        "models.SocietyMemberResponse": {
            created_at?: string;
            id?: number;
            invited_by?: number;
            joined_at?: string;
            remove_reason?: string;
            removed_at?: string;
            removed_by?: number;
            role?: components["schemas"]["models.SocietyMemberRole"];
            society_id?: number;
            status?: components["schemas"]["models.SocietyMemberStatus"];
            updated_at?: string;
            user_email?: string;
            user_full_name?: string;
            user_id?: number;
            user_phone?: string;
        };
        /** @enum {string} */
        "models.SocietyMemberRole": "owner" | "admin" | "staff" | "resident";
        /** @enum {string} */
        "models.SocietyMemberStatus": "pending" | "active" | "suspended" | "removed";
        "models.SocietyMemberSummaryAPIResponse": {
            data?: components["schemas"]["models.SocietyMemberSummaryData"];
            /** @example Member summary fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SocietyMemberSummaryData": {
            summary?: components["schemas"]["models.SocietyMemberSummaryResponse"];
        };
        "models.SocietyMemberSummaryResponse": {
            active_members?: number;
            admins?: number;
            owners?: number;
            pending_members?: number;
            removed_members?: number;
            residents?: number;
            staff?: number;
            suspended_members?: number;
            total_members?: number;
        };
        "models.SocietyOnboardingBootstrapAPIResponse": {
            data?: components["schemas"]["models.SocietyOnboardingBootstrapData"];
            /** @example Society onboarding bootstrap fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SocietyOnboardingBootstrapData": {
            onboarding?: components["schemas"]["models.SocietyOnboardingBootstrapResponse"];
        };
        "models.SocietyOnboardingBootstrapResponse": {
            flat_count?: number;
            has_flats?: boolean;
            has_staff?: boolean;
            is_onboarded?: boolean;
            missing_steps?: string[];
            next_path?: string;
            society?: components["schemas"]["models.SocietyResponse"];
            staff_count?: number;
        };
        "models.SocietyReasonRequest": {
            reason: string;
        };
        "models.SocietyResponse": {
            address_line1?: string;
            address_line2?: string;
            approved_at?: string;
            approved_by?: number;
            city?: string;
            country?: string;
            created_at?: string;
            created_by?: number;
            email?: string;
            id?: number;
            landmark?: string;
            name?: string;
            phone_number?: string;
            pincode?: string;
            rejected_at?: string;
            rejected_by?: number;
            rejection_reason?: string;
            society_code?: string;
            state?: string;
            status?: components["schemas"]["models.SocietyStatus"];
            suspended_at?: string;
            suspended_by?: number;
            suspension_reason?: string;
            total_blocks?: number;
            total_flats?: number;
            updated_at?: string;
        };
        /** @enum {string} */
        "models.SocietyStatus": "pending" | "active" | "suspended" | "rejected";
        "models.SocietySubscriptionResponse": {
            activated_at?: string;
            activated_by?: number;
            billing_cycle?: components["schemas"]["models.BillingCycle"];
            cancellation_reason?: string;
            cancelled_at?: string;
            cancelled_by?: number;
            created_at?: string;
            created_by?: number;
            currency?: string;
            current_plan_code?: string;
            current_plan_name?: string;
            ends_at?: string;
            expired_at?: string;
            features?: {
                [key: string]: unknown;
            };
            id?: number;
            max_admins?: number;
            max_flats?: number;
            max_residents?: number;
            max_staff?: number;
            plan_code?: string;
            plan_id?: number;
            plan_name?: string;
            price_amount_paise?: number;
            society_code?: string;
            society_id?: number;
            society_name?: string;
            starts_at?: string;
            status?: components["schemas"]["models.SubscriptionStatus"];
            trial_ends_at?: string;
            updated_at?: string;
        };
        "models.SubmitFlatClaimRequest": {
            flat_id: number;
            metadata?: {
                [key: string]: unknown;
            };
            note?: string;
            requested_primary?: boolean;
            requested_role: components["schemas"]["models.FlatResidentRole"];
            society_id: number;
        };
        "models.SubscriptionAPIResponse": {
            data?: components["schemas"]["models.SubscriptionData"];
            /** @example Subscription fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SubscriptionData": {
            subscription?: components["schemas"]["models.SocietySubscriptionResponse"];
        };
        "models.SubscriptionStatsAPIResponse": {
            data?: components["schemas"]["models.SubscriptionStatsData"];
            /** @example Subscription stats fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SubscriptionStatsData": {
            stats?: components["schemas"]["models.SubscriptionStatsResponse"];
        };
        "models.SubscriptionStatsResponse": {
            active_subscriptions?: number;
            cancelled_subscriptions?: number;
            expired_subscriptions?: number;
            pending_subscriptions?: number;
            total_subscriptions?: number;
            trial_subscriptions?: number;
        };
        /** @enum {string} */
        "models.SubscriptionStatus": "pending" | "trial" | "active" | "expired" | "cancelled";
        "models.SubscriptionsAPIResponse": {
            data?: components["schemas"]["models.SubscriptionsData"];
            /** @example Subscriptions fetched successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.SubscriptionsData": {
            subscriptions?: components["schemas"]["models.SocietySubscriptionResponse"][];
        };
        "models.TransferOwnershipRequest": {
            new_owner_user_id: number;
        };
        "models.UpdateFlatRequest": {
            block?: string;
            flat_number?: string;
            floor?: string;
            is_active?: boolean;
            metadata?: {
                [key: string]: unknown;
            };
            status?: components["schemas"]["models.FlatStatus"];
        };
        "models.UpdateFlatResidentRoleRequest": {
            role: components["schemas"]["models.FlatResidentRole"];
        };
        "models.UpdatePlanRequest": {
            billing_cycle?: components["schemas"]["models.BillingCycle"];
            code?: string;
            currency?: string;
            description?: string;
            features?: {
                [key: string]: unknown;
            };
            max_admins?: number;
            max_flats?: number;
            max_residents?: number;
            max_staff?: number;
            name?: string;
            price_amount_paise?: number;
        };
        "models.UpdateSocietyRequest": {
            address_line1?: string;
            address_line2?: string;
            city?: string;
            country?: string;
            email?: string;
            landmark?: string;
            metadata?: {
                [key: string]: unknown;
            };
            name?: string;
            phone_number?: string;
            pincode?: string;
            state?: string;
            total_blocks?: number;
            total_flats?: number;
        };
        "models.UserData": {
            user?: components["schemas"]["models.UserResponse"];
        };
        "models.UserMessageData": {
            /** @example 123456 */
            dev_otp?: string;
            /** @example Please verify your email using the OTP sent to your email address */
            message?: string;
            user?: components["schemas"]["models.UserResponse"];
        };
        "models.UserResponse": {
            auth_provider?: components["schemas"]["models.AuthProvider"];
            avatar_url?: string;
            blocked_reason?: string;
            created_at?: string;
            date_of_birth?: string;
            email?: string;
            email_verified?: boolean;
            first_name?: string;
            full_name?: string;
            gender?: string;
            global_role?: components["schemas"]["models.GlobalRole"];
            id?: number;
            is_active?: boolean;
            is_blocked?: boolean;
            language?: string;
            last_login_at?: string;
            last_name?: string;
            phone_number?: string;
            phone_verified?: boolean;
            timezone?: string;
            updated_at?: string;
        };
        "models.VerifyOTPAPIResponse": {
            data?: components["schemas"]["models.UserData"];
            /** @example Email verified successfully */
            message?: string;
            /** @example true */
            success?: boolean;
        };
        "models.VerifyOTPRequest": {
            email: string;
            otp: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
