package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"quranku-backend/config"
	"quranku-backend/models"
)

type AdminStats struct {
	TotalUsers         int64   `json:"total_users"`
	TotalDonations     int64   `json:"total_donations"`
	TotalAmountZakat   float64 `json:"total_amount_zakat"`
	TotalAmountInfaq   float64 `json:"total_amount_infaq"`
	TotalAmountSedekah float64 `json:"total_amount_sedekah"`
	TotalFunds         float64 `json:"total_funds"`
	PendingDonations   int64   `json:"pending_donations"`
}

func GetAdminStats(c *fiber.Ctx) error {
	var totalUsers int64
	config.DB.Model(&models.User{}).Count(&totalUsers)

	var totalDonations int64
	config.DB.Model(&models.Donation{}).Count(&totalDonations)

	var pendingDonations int64
	config.DB.Model(&models.Donation{}).Where("status = ?", models.StatusPending).Count(&pendingDonations)

	var donations []models.Donation
	config.DB.Find(&donations)

	var zakat, infaq, sedekah, total float64
	for _, d := range donations {
		total += d.Amount
		switch d.Type {
		case models.DonationZakatFitrah, models.DonationZakatMaal, models.DonationZakatPenghasilan:
			zakat += d.Amount
		case models.DonationInfaq:
			infaq += d.Amount
		case models.DonationSedekah:
			sedekah += d.Amount
		}
	}

	return c.JSON(AdminStats{
		TotalUsers:         totalUsers,
		TotalDonations:     totalDonations,
		TotalAmountZakat:   zakat,
		TotalAmountInfaq:   infaq,
		TotalAmountSedekah: sedekah,
		TotalFunds:         total,
		PendingDonations:   pendingDonations,
	})
}

func GetAllUsers(c *fiber.Ctx) error {
	var users []models.User
	config.DB.Select("id, name, email, role, avatar_url, created_at, updated_at").Find(&users)
	return c.JSON(users)
}

func GetAllDonationsAdmin(c *fiber.Ctx) error {
	var donations []models.Donation
	config.DB.Order("created_at desc").Find(&donations)
	return c.JSON(donations)
}

func UpdateDonationStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status models.DonationStatus `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Status tidak valid"})
	}

	var donation models.Donation
	if err := config.DB.First(&donation, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Data donasi tidak ditemukan"})
	}

	donation.Status = req.Status
	config.DB.Save(&donation)
	return c.JSON(donation)
}

func DeleteUser(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID pengguna tidak valid"})
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Akun pengguna tidak ditemukan"})
	}

	if user.Role == models.RoleAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Admin tidak dapat menghapus akun admin lain"})
	}

	if err := config.DB.Delete(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menghapus akun"})
	}

	return c.JSON(fiber.Map{"message": "Akun berhasil dihapus"})
}
