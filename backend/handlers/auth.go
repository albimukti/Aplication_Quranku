package handlers

import (
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"quranku-backend/config"
	"quranku-backend/models"
)

func SeedDefaultUsers() {
	hashPassword := func(pw string) string {
		h, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		return string(h)
	}

	var adminUser models.User
	if err := config.DB.Where("LOWER(email) = ?", strings.ToLower("admin@quranku.id")).First(&adminUser).Error; err != nil {
		adminUser = models.User{
			Name:      "Administrator Quranku",
			Email:     "admin@quranku.id",
			Password:  hashPassword("P@ssw0rd"),
			Role:      models.RoleAdmin,
			AvatarURL: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
		}
		config.DB.Create(&adminUser)
		log.Println("[Seed] Default admin created: admin@quranku.id / P@ssw0rd")
		return
	}

	adminUser.Name = "Administrator Quranku"
	adminUser.Role = models.RoleAdmin
	adminUser.AvatarURL = "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
	adminUser.Password = hashPassword("P@ssw0rd")
	config.DB.Save(&adminUser)
	log.Println("[Seed] Default admin verified and reset to: admin@quranku.id / P@ssw0rd")
}

func generateToken(user *models.User, secret string) (string, error) {
	claims := jwt.MapClaims{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
		"name":  user.Name,
		"exp":   time.Now().Add(72 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format data tidak valid"})
	}

	normalizedEmail := strings.TrimSpace(req.Email)
	if normalizedEmail == "admin" {
		normalizedEmail = "admin@quranku.id"
	}

	var user models.User
	if err := config.DB.Where("LOWER(email) = ?", strings.ToLower(normalizedEmail)).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email atau kata sandi salah"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email atau kata sandi salah"})
	}

	cfg := config.LoadConfig()
	token, err := generateToken(&user, cfg.JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal membuat sesi login"})
	}

	return c.JSON(models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func Register(c *fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format data tidak valid"})
	}

	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Semua kolom wajib diisi"})
	}

	if req.Role == models.RoleViewer || req.Role == models.RoleAdmin {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Peran admin dan viewer tidak tersedia untuk pendaftaran baru"})
	}

	role := models.RoleUser

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengenkripsi kata sandi"})
	}

	user := models.User{
		Name:      req.Name,
		Email:     req.Email,
		Password:  string(hashed),
		Role:      role,
		AvatarURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + req.Name,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email sudah terdaftar"})
	}

	cfg := config.LoadConfig()
	token, _ := generateToken(&user, cfg.JWTSecret)

	return c.Status(fiber.StatusCreated).JSON(models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func GetMe(c *fiber.Ctx) error {
	user := c.Locals("user")
	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Belum diautentikasi"})
	}
	return c.JSON(user)
}
