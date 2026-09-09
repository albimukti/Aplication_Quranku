package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"quranku-backend/data"
	"quranku-backend/services"
)

func GetSurahs(c *fiber.Ctx) error {
	search := c.Query("search")
	if search != "" {
		return c.JSON(services.SearchSurahs(search))
	}
	return c.JSON(services.GetAllSurahs())
}

func GetSurahDetail(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id < 1 || id > 114 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nomor surah tidak valid (1-114)"})
	}

	surah, err := services.GetSurahByNumber(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(surah)
}

func GetJuzList(c *fiber.Ctx) error {
	return c.JSON(services.GetAllJuz())
}

func GetJuzAmma(c *fiber.Ctx) error {
	// Surah 78 (An-Naba') to 114 (An-Nas)
	all := services.GetAllSurahs()
	var juzAmmaSurahs []interface{}
	for _, s := range all {
		if s.Number >= 78 && s.Number <= 114 {
			juzAmmaSurahs = append(juzAmmaSurahs, s)
		}
	}
	return c.JSON(juzAmmaSurahs)
}

// IQRO Handler
func GetIqroLevels(c *fiber.Ctx) error {
	return c.JSON(data.IqroBooks)
}

func GetIqroLevelDetail(c *fiber.Ctx) error {
	levelStr := c.Params("level")
	lvl, err := strconv.Atoi(levelStr)
	if err != nil || lvl < 1 || lvl > 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Jilid Iqro harus antara 1 sampai 6"})
	}

	for _, book := range data.IqroBooks {
		if book.Level == lvl {
			return c.JSON(book)
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Jilid tidak ditemukan"})
}
