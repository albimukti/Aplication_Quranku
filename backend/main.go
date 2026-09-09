package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"quranku-backend/config"
	"quranku-backend/handlers"
	"quranku-backend/models"
	"quranku-backend/routes"
)

func main() {
	log.Println("========================================")
	log.Println("      Quranku Backend Service v1.0      ")
	log.Println("========================================")

	// 1. Load Configurations
	cfg := config.LoadConfig()

	// 2. Initialize Database & Automigrate
	db := config.InitDB(cfg)
	err := db.AutoMigrate(
		&models.User{},
		&models.Donation{},
		&models.Bookmark{},
		&models.PrayerLog{},
	)
	if err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}
	log.Println("[Database] Auto-migration completed successfully.")

	// 3. Seed Initial Demo Users and Donations
	handlers.SeedDefaultUsers()
	handlers.SeedDefaultDonations()

	// 4. Initialize Cache Engine (Redis / In-Memory)
	config.InitRedis(cfg)

	// 5. Create Fiber App
	app := fiber.New(fiber.Config{
		AppName: "Quranku Modern Islamic App",
	})

	// 6. Middlewares
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: false,
	}))

	// 7. Setup API Routes
	routes.SetupRoutes(app)

	// 8. Start Server
	addr := ":" + cfg.Port
	log.Printf("[Server] Quranku Fiber server starting on http://localhost%s\n", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
