package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"

	"quranku-backend/config"
	"quranku-backend/models"
)

func GetBookmarks(c *fiber.Ctx) error {
	userVal := c.Locals("user")
	if userVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Wajib login"})
	}
	user := userVal.(*models.User)

	var bookmarks []models.Bookmark
	config.DB.Where("user_id = ?", user.ID).Order("created_at desc").Find(&bookmarks)
	return c.JSON(bookmarks)
}

func AddBookmark(c *fiber.Ctx) error {
	userVal := c.Locals("user")
	if userVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Wajib login"})
	}
	user := userVal.(*models.User)

	var req models.Bookmark
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data bookmark tidak valid"})
	}

	req.UserID = user.ID
	req.CreatedAt = time.Now()

	// Check if already exists
	var existing models.Bookmark
	err := config.DB.Where("user_id = ? AND surah_number = ? AND ayah_number = ?", user.ID, req.SurahNumber, req.AyahNumber).First(&existing).Error
	if err == nil {
		// Update notes
		existing.Notes = req.Notes
		config.DB.Save(&existing)
		return c.JSON(existing)
	}

	config.DB.Create(&req)
	return c.Status(fiber.StatusCreated).JSON(req)
}

func DeleteBookmark(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Bookmark{}, id)
	return c.JSON(fiber.Map{"message": "Bookmark berhasil dihapus"})
}

func GetPrayerTracker(c *fiber.Ctx) error {
	userVal := c.Locals("user")
	if userVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Wajib login"})
	}
	user := userVal.(*models.User)

	today := time.Now().Format("2006-01-02")
	var log models.PrayerLog
	err := config.DB.Where("user_id = ? AND date = ?", user.ID, today).First(&log).Error
	if err != nil {
		log = models.PrayerLog{
			UserID: user.ID,
			Date:   today,
		}
		config.DB.Create(&log)
	}

	return c.JSON(log)
}

func UpdatePrayerTracker(c *fiber.Ctx) error {
	userVal := c.Locals("user")
	if userVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Wajib login"})
	}
	user := userVal.(*models.User)

	var req struct {
		Date    string `json:"date"`
		Subuh   bool   `json:"subuh"`
		Dzuhur  bool   `json:"dzuhur"`
		Ashar   bool   `json:"ashar"`
		Maghrib bool   `json:"maghrib"`
		Isya    bool   `json:"isya"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data sholat tidak valid"})
	}

	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}

	var log models.PrayerLog
	err := config.DB.Where("user_id = ? AND date = ?", user.ID, req.Date).First(&log).Error
	if err != nil {
		log = models.PrayerLog{
			UserID:  user.ID,
			Date:    req.Date,
			Subuh:   req.Subuh,
			Dzuhur:  req.Dzuhur,
			Ashar:   req.Ashar,
			Maghrib: req.Maghrib,
			Isya:    req.Isya,
		}
		config.DB.Create(&log)
	} else {
		log.Subuh = req.Subuh
		log.Dzuhur = req.Dzuhur
		log.Ashar = req.Ashar
		log.Maghrib = req.Maghrib
		log.Isya = req.Isya
		config.DB.Save(&log)
	}

	return c.JSON(log)
}
