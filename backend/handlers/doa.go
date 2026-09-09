package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"quranku-backend/data"
	"quranku-backend/models"
)

func GetDoas(c *fiber.Ctx) error {
	category := c.Query("category")
	search := strings.ToLower(c.Query("search"))

	var results []models.DoaItem
	for _, doa := range data.DoaList {
		if category != "" && doa.Category != category {
			continue
		}
		if search != "" {
			matchTitle := strings.Contains(strings.ToLower(doa.Title), search)
			matchLatin := strings.Contains(strings.ToLower(doa.Latin), search)
			matchTrans := strings.Contains(strings.ToLower(doa.Translation), search)
			if !matchTitle && !matchLatin && !matchTrans {
				continue
			}
		}
		results = append(results, doa)
	}

	return c.JSON(results)
}
