package services

import (
	"math"
)

const (
	KaabaLat = 21.422487
	KaabaLng = 39.826206
)

type QiblaResult struct {
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	QiblaDegree      float64 `json:"qibla_degree"`      // Angle from True North (0° - 360°)
	DirectionCompass string  `json:"direction_compass"` // e.g. "Barat Laut (295.2°)"
	DistanceKm       float64 `json:"distance_km"`       // Distance in kilometers
}

func getCompassDirection(deg float64) string {
	directions := []string{"Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"}
	idx := int(math.Round(deg/45.0)) % 8
	if idx < 0 {
		idx += 8
	}
	return directions[idx]
}

func CalculateQibla(lat, lng float64) QiblaResult {
	phiK := degToRad(KaabaLat)
	lambdaK := degToRad(KaabaLng)
	phi := degToRad(lat)
	lambda := degToRad(lng)

	// Great Circle Bearing to Kaaba
	num := math.Sin(lambdaK - lambda)
	den := math.Cos(phi)*math.Tan(phiK) - math.Sin(phi)*math.Cos(lambdaK-lambda)
	qiblaRad := math.Atan2(num, den)

	qiblaDeg := radToDeg(qiblaRad)
	if qiblaDeg < 0 {
		qiblaDeg += 360.0
	}

	// Distance calculation using Haversine
	dLat := phiK - phi
	dLng := lambdaK - lambda
	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(phi)*math.Cos(phiK)*math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	distKm := 6371.0 * c

	roundedDeg := math.Round(qiblaDeg*10) / 10

	return QiblaResult{
		Latitude:         lat,
		Longitude:        lng,
		QiblaDegree:      roundedDeg,
		DirectionCompass: getCompassDirection(roundedDeg),
		DistanceKm:       math.Round(distKm),
	}
}
