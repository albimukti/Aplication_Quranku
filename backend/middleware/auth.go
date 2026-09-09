package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"quranku-backend/config"
	"quranku-backend/models"
)

func AuthMiddleware(requiredRole models.Role) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Akses memerlukan autentikasi login"})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Format token otentikasi tidak valid"})
		}

		tokenStr := parts[1]
		cfg := config.LoadConfig()

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token tidak valid atau telah kedaluwarsa"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Klaim token tidak valid"})
		}

		userIDFloat, ok := claims["id"].(float64)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "ID pengguna dalam token tidak valid"})
		}

		var user models.User
		if err := config.DB.First(&user, uint(userIDFloat)).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Pengguna tidak ditemukan"})
		}

		if requiredRole != "" {
			if requiredRole == models.RoleAdmin && user.Role != models.RoleAdmin {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Fitur ini khusus untuk Administrator"})
			}
			if requiredRole == models.RoleUser && (user.Role != models.RoleUser && user.Role != models.RoleAdmin) {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Akses dibatasi untuk Pengguna Terdaftar"})
			}
		}

		c.Locals("user", &user)
		return c.Next()
	}
}

func OptionalAuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Next()
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			tokenStr := parts[1]
			cfg := config.LoadConfig()

			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				return []byte(cfg.JWTSecret), nil
			})
			if err == nil && token.Valid {
				if claims, ok := token.Claims.(jwt.MapClaims); ok {
					if idVal, ok := claims["id"].(float64); ok {
						var user models.User
						if config.DB.First(&user, uint(idVal)).Error == nil {
							c.Locals("user", &user)
						}
					}
				}
			}
		}
		return c.Next()
	}
}
