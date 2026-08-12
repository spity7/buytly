/**
 * Shared OpenAPI component schemas, parameters, and responses.
 * Consumed by swagger-jsdoc for Orval / client generation.
 *
 * @swagger
 * components:
 *   parameters:
 *     PageParam:
 *       in: query
 *       name: page
 *       description: Page number (1-based)
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *         example: 1
 *     LimitParam:
 *       in: query
 *       name: limit
 *       description: Items per page (max 100)
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *         example: 20
 *     ObjectIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       description: MongoDB ObjectId (24-char hex)
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *         example: '507f1f77bcf86cd799439011'
 *     PropertyIdParam:
 *       in: path
 *       name: propertyId
 *       required: true
 *       description: Property MongoDB ObjectId
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *         example: '507f1f77bcf86cd799439012'
 *     MediaIdParam:
 *       in: path
 *       name: mediaId
 *       required: true
 *       description: Media item MongoDB ObjectId
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *         example: '507f1f77bcf86cd799439013'
 *
 *   responses:
 *     ValidationError:
 *       description: Request validation failed
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: Validation failed
 *             errors:
 *               - field: email
 *                 message: Invalid email
 *     Unauthorized:
 *       description: Authentication required or invalid credentials
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: Invalid email or password
 *     Forbidden:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: Not authorized
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: Resource not found
 *     Conflict:
 *       description: Resource conflict (e.g. duplicate)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: Email already registered
 *     TooManyRequests:
 *       description: Rate limit exceeded
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: Too many requests, please try again later
 *
 *   schemas:
 *     ObjectId:
 *       type: string
 *       description: MongoDB ObjectId
 *       pattern: '^[0-9a-fA-F]{24}$'
 *       example: '507f1f77bcf86cd799439011'
 *
 *     PaginationMeta:
 *       type: object
 *       required: [page, limit, total, totalPages]
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 150
 *         totalPages:
 *           type: integer
 *           example: 8
 *
 *     ErrorResponse:
 *       type: object
 *       required: [success, message]
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Validation failed
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: email
 *               message:
 *                 type: string
 *                 example: Invalid email
 *
 *     MessageResponse:
 *       type: object
 *       required: [success, message, data]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: If the email exists, a reset link has been sent
 *
 *     UserRole:
 *       type: string
 *       enum: [buyer, seller, agent, admin]
 *       example: buyer
 *
 *     Avatar:
 *       type: object
 *       properties:
 *         gcsKey:
 *           type: string
 *           example: avatars/abc123.jpg
 *         mimeType:
 *           type: string
 *           example: image/jpeg
 *         size:
 *           type: integer
 *           example: 245760
 *         url:
 *           type: string
 *           format: uri
 *           description: Signed GCS URL (present when resolved)
 *           example: https://storage.googleapis.com/bucket/avatars/abc123.jpg?X-Goog-Signature=...
 *
 *     UserPreferences:
 *       type: object
 *       properties:
 *         budgetMin:
 *           type: number
 *           example: 100000
 *         budgetMax:
 *           type: number
 *           example: 500000
 *         locations:
 *           type: array
 *           items:
 *             type: string
 *           example: [Dubai, Abu Dhabi]
 *         propertyTypes:
 *           type: array
 *           items:
 *             type: string
 *             enum: [apartment, villa, townhouse, land, commercial, duplex, studio]
 *           example: [apartment, villa]
 *
 *     UserSocialLinks:
 *       type: object
 *       properties:
 *         instagram:
 *           type: string
 *           maxLength: 500
 *           example: https://instagram.com/johndoe
 *         linkedin:
 *           type: string
 *           maxLength: 500
 *           example: https://linkedin.com/in/johndoe
 *         website:
 *           type: string
 *           maxLength: 500
 *           example: johndoe.com
 *
 *     User:
 *       type: object
 *       description: Authenticated user profile (public fields)
 *       properties:
 *         id:
 *           $ref: '#/components/schemas/ObjectId'
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         phoneCountryCode:
 *           type: string
 *           example: '+961'
 *         phoneNumber:
 *           type: string
 *           example: '501234567'
 *         phone:
 *           type: string
 *           description: Full E.164 phone (country code + number)
 *           example: '+971501234567'
 *         avatar:
 *           $ref: '#/components/schemas/Avatar'
 *         socialLinks:
 *           $ref: '#/components/schemas/UserSocialLinks'
 *         preferences:
 *           $ref: '#/components/schemas/UserPreferences'
 *         isActive:
 *           type: boolean
 *           example: true
 *         isEmailVerified:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2026-01-15T10:30:00.000Z'
 *
 *     UserPublicProfile:
 *       type: object
 *       description: Limited public user profile
 *       properties:
 *         id:
 *           $ref: '#/components/schemas/ObjectId'
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         avatar:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     SavedSearch:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/ObjectId'
 *         name:
 *           type: string
 *           example: Dubai apartments under 500k
 *         filters:
 *           type: object
 *           additionalProperties: true
 *           example:
 *             city: Dubai
 *             maxPrice: 500000
 *             type: apartment
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     TokenPair:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token (short-lived)
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           description: Opaque refresh token (long-lived)
 *           example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 *
 *     AuthData:
 *       allOf:
 *         - $ref: '#/components/schemas/TokenPair'
 *         - type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *
 *     AuthSuccessResponse:
 *       type: object
 *       required: [success, message, data]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           $ref: '#/components/schemas/AuthData'
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 *
 *     RegisterRequest:
 *       type: object
 *       required: [email, password, confirmPassword]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 128
 *           example: SecurePass123
 *         confirmPassword:
 *           type: string
 *           minLength: 8
 *           example: SecurePass123
 *         firstName:
 *           type: string
 *           maxLength: 50
 *           example: John
 *         lastName:
 *           type: string
 *           maxLength: 50
 *           example: Doe
 *         phoneCountryCode:
 *           type: string
 *           example: '+961'
 *         phoneNumber:
 *           type: string
 *           example: '501234567'
 *         role:
 *           type: string
 *           enum: [buyer, seller, agent]
 *           default: buyer
 *           example: buyer
 *
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: SecurePass123
 *
 *     PropertyType:
 *       type: string
 *       enum: [apartment, villa, townhouse, land, commercial, duplex, studio]
 *       example: apartment
 *
 *     ListingType:
 *       type: string
 *       enum: [sale, rent]
 *       example: sale
 *
 *     PropertyStatus:
 *       type: string
 *       enum: [draft, pending, active, sold, rented, archived]
 *       example: active
 *
 *     PropertyLocation:
 *       type: object
 *       required: [coordinates]
 *       properties:
 *         type:
 *           type: string
 *           enum: [Point]
 *           default: Point
 *         coordinates:
 *           type: array
 *           description: '[longitude, latitude]'
 *           minItems: 2
 *           maxItems: 2
 *           items:
 *             type: number
 *           example: [55.2708, 25.2048]
 *         address:
 *           type: string
 *           example: Sheikh Zayed Road
 *         city:
 *           type: string
 *           example: Dubai
 *         country:
 *           type: string
 *           example: UAE
 *
 *     PropertyMedia:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/ObjectId'
 *         gcsKey:
 *           type: string
 *           example: properties/abc123.jpg
 *         type:
 *           type: string
 *           enum: [image, video]
 *           example: image
 *         order:
 *           type: integer
 *           example: 0
 *         mimeType:
 *           type: string
 *           example: image/jpeg
 *         size:
 *           type: integer
 *           example: 1048576
 *         url:
 *           type: string
 *           format: uri
 *           description: Signed GCS URL (present when resolved)
 *
 *     Property:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/ObjectId'
 *         title:
 *           type: string
 *           example: Modern 2BR Apartment in Downtown
 *         slug:
 *           type: string
 *           example: modern-2br-apartment-downtown
 *         description:
 *           type: string
 *           example: Spacious apartment with city views and premium finishes.
 *         type:
 *           $ref: '#/components/schemas/PropertyType'
 *         listingType:
 *           $ref: '#/components/schemas/ListingType'
 *         price:
 *           type: number
 *           example: 450000
 *         currency:
 *           type: string
 *           example: USD
 *         location:
 *           $ref: '#/components/schemas/PropertyLocation'
 *         bedrooms:
 *           type: integer
 *           example: 2
 *         bathrooms:
 *           type: number
 *           example: 2
 *         area:
 *           type: number
 *           example: 120
 *         areaUnit:
 *           type: string
 *           example: sqm
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           example: [pool, gym, parking]
 *         status:
 *           $ref: '#/components/schemas/PropertyStatus'
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PropertyMedia'
 *         agentId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/User'
 *         ownerId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/User'
 *         viewCount:
 *           type: integer
 *           example: 42
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreatePropertyRequest:
 *       type: object
 *       required: [title, description, type, listingType, price, location]
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           example: Modern 2BR Apartment in Downtown
 *         description:
 *           type: string
 *           minLength: 10
 *           example: Spacious apartment with city views.
 *         type:
 *           $ref: '#/components/schemas/PropertyType'
 *         listingType:
 *           $ref: '#/components/schemas/ListingType'
 *         price:
 *           type: number
 *           minimum: 0
 *           exclusiveMinimum: true
 *           example: 450000
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           example: USD
 *         location:
 *           $ref: '#/components/schemas/PropertyLocation'
 *         bedrooms:
 *           type: integer
 *           minimum: 0
 *           example: 2
 *         bathrooms:
 *           type: number
 *           minimum: 0
 *           example: 2
 *         area:
 *           type: number
 *           example: 120
 *         areaUnit:
 *           type: string
 *           example: sqm
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           $ref: '#/components/schemas/PropertyStatus'
 *         agentId:
 *           $ref: '#/components/schemas/ObjectId'
 *
 *     AgentProfile:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/ObjectId'
 *         userId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/User'
 *         licenseNumber:
 *           type: string
 *           example: RE-12345
 *         agency:
 *           type: string
 *           example: Buytly Realty
 *         bio:
 *           type: string
 *           example: 10+ years experience in luxury properties.
 *         specialties:
 *           type: array
 *           items:
 *             type: string
 *           example: [luxury, commercial]
 *         city:
 *           type: string
 *           example: Dubai
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           example: 4.8
 *         reviewCount:
 *           type: integer
 *           example: 24
 *         isVerified:
 *           type: boolean
 *           example: true
 *         listingsCount:
 *           type: integer
 *           description: Active listings count (computed on list/detail)
 *           example: 12
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AgentDetail:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         profile:
 *           $ref: '#/components/schemas/AgentProfile'
 *         listingsCount:
 *           type: integer
 *           example: 12
 *
 *     BookingStatus:
 *       type: string
 *       enum: [pending, approved, rejected, cancelled, completed]
 *       example: pending
 *
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/ObjectId'
 *         propertyId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/Property'
 *         buyerId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/User'
 *         agentId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/User'
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           example: '2026-07-10T14:00:00.000Z'
 *         message:
 *           type: string
 *           example: I would like to visit this weekend.
 *         status:
 *           $ref: '#/components/schemas/BookingStatus'
 *         agentNotes:
 *           type: string
 *           example: Confirmed for Saturday 2pm.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateBookingRequest:
 *       type: object
 *       required: [propertyId, scheduledAt]
 *       properties:
 *         propertyId:
 *           $ref: '#/components/schemas/ObjectId'
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: Must be in the future
 *           example: '2026-07-10T14:00:00.000Z'
 *         message:
 *           type: string
 *           maxLength: 1000
 *           example: I would like to visit this weekend.
 *
 *     UpdateBookingStatusRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [approved, rejected, completed]
 *           example: approved
 *         agentNotes:
 *           type: string
 *           maxLength: 1000
 *           example: Confirmed for Saturday 2pm.
 *
 *     TransactionType:
 *       type: string
 *       enum: [buy, rent]
 *       example: buy
 *
 *     TransactionStatus:
 *       type: string
 *       enum: [pending, approved, completed, cancelled]
 *       example: pending
 *
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/ObjectId'
 *         propertyId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/Property'
 *         buyerId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/User'
 *         sellerId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/User'
 *         agentId:
 *           oneOf:
 *             - $ref: '#/components/schemas/ObjectId'
 *             - $ref: '#/components/schemas/User'
 *         type:
 *           $ref: '#/components/schemas/TransactionType'
 *         amount:
 *           type: number
 *           example: 450000
 *         currency:
 *           type: string
 *           example: USD
 *         status:
 *           $ref: '#/components/schemas/TransactionStatus'
 *         notes:
 *           type: string
 *           example: Buyer ready to proceed.
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateTransactionRequest:
 *       type: object
 *       required: [propertyId, type, amount]
 *       properties:
 *         propertyId:
 *           $ref: '#/components/schemas/ObjectId'
 *         type:
 *           $ref: '#/components/schemas/TransactionType'
 *         amount:
 *           type: number
 *           minimum: 0
 *           exclusiveMinimum: true
 *           example: 450000
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           example: USD
 *         notes:
 *           type: string
 *           maxLength: 2000
 *
 *     UpdateTransactionStatusRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [approved, completed, cancelled]
 *           example: approved
 *         notes:
 *           type: string
 *           maxLength: 2000
 *
 *     NotificationType:
 *       type: string
 *       enum: [booking, transaction, property, system, auth]
 *       example: booking
 *
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/ObjectId'
 *         userId:
 *           $ref: '#/components/schemas/ObjectId'
 *         type:
 *           $ref: '#/components/schemas/NotificationType'
 *         title:
 *           type: string
 *           example: New Visit Request
 *         message:
 *           type: string
 *           example: A buyer requested a visit for "Modern 2BR Apartment"
 *         data:
 *           type: object
 *           additionalProperties: true
 *           example:
 *             bookingId: '507f1f77bcf86cd799439011'
 *             propertyId: '507f1f77bcf86cd799439012'
 *         isRead:
 *           type: boolean
 *           example: false
 *         readAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         channels:
 *           type: object
 *           properties:
 *             inApp:
 *               type: boolean
 *               example: true
 *             email:
 *               type: boolean
 *               example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     FavoriteItem:
 *       type: object
 *       properties:
 *         id:
 *           $ref: '#/components/schemas/ObjectId'
 *         property:
 *           $ref: '#/components/schemas/Property'
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Favorite:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/ObjectId'
 *         userId:
 *           $ref: '#/components/schemas/ObjectId'
 *         propertyId:
 *           $ref: '#/components/schemas/ObjectId'
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     HealthData:
 *       type: object
 *       required: [status, timestamp, services]
 *       properties:
 *         status:
 *           type: string
 *           enum: [ok, degraded]
 *           example: ok
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: '2026-07-05T09:00:00.000Z'
 *         services:
 *           type: object
 *           required: [mongodb, redis]
 *           properties:
 *             mongodb:
 *               type: string
 *               enum: [connected, disconnected]
 *               example: connected
 *             redis:
 *               type: string
 *               enum: [connected, not_configured, disconnected]
 *               description: not_configured when REDIS_URL is unset; disconnected when configured but unreachable
 *               example: not_configured
 *
 *     HealthSuccessResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/HealthData'
 *
 *     AnalyticsData:
 *       type: object
 *       properties:
 *         usersByRole:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               count:
 *                 type: integer
 *         listingsByType:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   status:
 *                     type: string
 *               count:
 *                 type: integer
 *         bookingsThisMonth:
 *           type: integer
 *           example: 42
 *         transactionVolume:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *               count:
 *                 type: integer
 *         topCities:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               count:
 *                 type: integer
 *
 *     UnreadCountData:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 5
 *
 *     IsFavoriteData:
 *       type: object
 *       properties:
 *         isFavorite:
 *           type: boolean
 *           example: true
 *
 *     SuccessResponse:
 *       type: object
 *       required: [success, message]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Success
 *         data:
 *           nullable: true
 *
 *     UserSuccessResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/User'
 *
 *     PropertySuccessResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/Property'
 *
 *     PaginatedPropertiesResponse:
 *       type: object
 *       required: [success, message, data, pagination]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Success
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Property'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *     PaginatedUsersResponse:
 *       type: object
 *       required: [success, message, data, pagination]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *     PaginatedAgentsResponse:
 *       type: object
 *       required: [success, message, data, pagination]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AgentProfile'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *     PaginatedBookingsResponse:
 *       type: object
 *       required: [success, message, data, pagination]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Booking'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *     PaginatedTransactionsResponse:
 *       type: object
 *       required: [success, message, data, pagination]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *     PaginatedNotificationsResponse:
 *       type: object
 *       required: [success, message, data, pagination]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *     PaginatedFavoritesResponse:
 *       type: object
 *       required: [success, message, data, pagination]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FavoriteItem'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 */

export {};
