package routes

import (
	"github.com/gofiber/fiber/v2"

	"quranku-backend/handlers"
	"quranku-backend/middleware"
	"quranku-backend/models"
)

func SetupRoutes(app *fiber.App) {
	// Root service check
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "online",
			"app":     "Quranku Modern Islamic App API",
			"version": "1.0.0",
			"health":  "/api/health",
		})
	})

	api := app.Group("/api")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"app":     "Quranku API",
			"version": "1.0.0",
		})
	})

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/login", handlers.Login)
	auth.Post("/register", handlers.Register)
	auth.Get("/me", middleware.AuthMiddleware(""), handlers.GetMe)

	// Quran routes
	quran := api.Group("/quran")
	quran.Get("/surahs", handlers.GetSurahs)
	quran.Get("/surah/:id", handlers.GetSurahDetail)
	quran.Get("/juz", handlers.GetJuzList)
	quran.Get("/juz-amma", handlers.GetJuzAmma)

	// Iqro routes
	iqro := api.Group("/iqro")
	iqro.Get("/levels", handlers.GetIqroLevels)
	iqro.Get("/level/:level", handlers.GetIqroLevelDetail)

	// Prayer times & Qibla
	prayer := api.Group("/prayer")
	prayer.Get("/cities", handlers.GetIndonesianCities)
	prayer.Get("/times", handlers.GetPrayerTimes)
	prayer.Get("/qibla", handlers.GetQiblaDirection)

	// Doa & Dzikir
	api.Get("/doas", handlers.GetDoas)

	// Masjid terdekat
	api.Get("/masjid/nearby", handlers.GetNearbyMosques)

	// Zakat, Infaq & Sedekah
	donation := api.Group("/donation")
	donation.Post("/calculate-zakat", handlers.CalculateZakat)
	donation.Post("/create", middleware.OptionalAuthMiddleware(), handlers.CreateDonation)
	donation.Get("/recent", handlers.GetRecentDonations)
	donation.Get("/receipt/:receiptNumber", handlers.GetDonationReceipt)

	// User features (Bookmarks & Sholat Checklist)
	user := api.Group("/user", middleware.AuthMiddleware(models.RoleUser))
	user.Get("/bookmarks", handlers.GetBookmarks)
	user.Post("/bookmarks", handlers.AddBookmark)
	user.Delete("/bookmarks/:id", handlers.DeleteBookmark)
	user.Get("/prayer-log", handlers.GetPrayerTracker)
	user.Post("/prayer-log", handlers.UpdatePrayerTracker)

	// Admin routes
	admin := api.Group("/admin", middleware.AuthMiddleware(models.RoleAdmin))
	admin.Get("/stats", handlers.GetAdminStats)
	admin.Get("/users", handlers.GetAllUsers)
	admin.Delete("/users/:id", handlers.DeleteUser)
	admin.Get("/donations", handlers.GetAllDonationsAdmin)
	admin.Patch("/donations/:id/status", handlers.UpdateDonationStatus)
}
