package handlers

import (
	"strconv"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"

	"quranku-backend/data"
	"quranku-backend/services"
)

var (
	cityMapOnce sync.Once
	cityMap     = make(map[string]data.City)
)

func initCityMap() {
	cityMapOnce.Do(func() {
		for _, c := range data.IndonesianCities {
			cityMap[c.ID] = c
		}
	})
}

func GetIndonesianCities(c *fiber.Ctx) error {
	return c.JSON(data.IndonesianCities)
}

func GetPrayerTimes(c *fiber.Ctx) error {
	initCityMap()

	cityID := c.Query("city", "jkt")
	dateStr := c.Query("date")
	latStr := c.Query("lat")
	lngStr := c.Query("lng")

	targetDate := time.Now()
	if dateStr != "" {
		if parsed, err := time.Parse("2006-01-02", dateStr); err == nil {
			targetDate = parsed
		}
	}

	var lat, lng float64
	var tzOffset float64 = 7.0 // Default WIB
	var cityName = "DKI Jakarta"
	var tzName = "WIB"

	if latStr != "" && lngStr != "" {
		lat, _ = strconv.ParseFloat(latStr, 64)
		lng, _ = strconv.ParseFloat(lngStr, 64)
		cityName = "Lokasi Saya (GPS)"
		// Estimate Indonesian timezone based on longitude
		if lng > 120.0 && lng <= 135.0 {
			tzOffset = 8.0
			tzName = "WITA"
		} else if lng > 135.0 {
			tzOffset = 9.0
			tzName = "WIT"
		} else {
			tzOffset = 7.0
			tzName = "WIB"
		}
	} else {
		// O(1) Look up city by ID from map
		if city, ok := cityMap[cityID]; ok {
			lat = city.Latitude
			lng = city.Longitude
			cityName = city.Name + ", " + city.Province
			tzName = city.Timezone
			switch tzName {
			case "WITA":
				tzOffset = 8.0
			case "WIT":
				tzOffset = 9.0
			default:
				tzOffset = 7.0
			}
		} else {
			// default to Jakarta
			lat = -6.2088
			lng = 106.8456
		}
	}

	result := services.CalculatePrayers(lat, lng, tzOffset, targetDate, cityName, tzName)
	return c.JSON(result)
}

func GetQiblaDirection(c *fiber.Ctx) error {
	latStr := c.Query("lat", "-6.2088")
	lngStr := c.Query("lng", "106.8456")

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		lat = -6.2088
	}
	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		lng = 106.8456
	}

	qibla := services.CalculateQibla(lat, lng)
	return c.JSON(qibla)
}
