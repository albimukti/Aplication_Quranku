package services

import (
	"fmt"
	"math"
	"time"
)

type PrayerTimesResult struct {
	Date        string `json:"date"`
	City        string `json:"city"`
	Timezone    string `json:"timezone"`
	Imsak       string `json:"imsak"`
	Subuh       string `json:"subuh"`
	Terbit      string `json:"terbit"`
	Dhuha       string `json:"dhuha"`
	Dzuhur      string `json:"dzuhur"`
	Ashar       string `json:"ashar"`
	Maghrib     string `json:"maghrib"`
	Isya        string `json:"isya"`
	NextPrayer  string `json:"next_prayer"`
	Remaining   string `json:"remaining"`
}

func degToRad(d float64) float64 {
	return d * math.Pi / 180.0
}

func radToDeg(r float64) float64 {
	return r * 180.0 / math.Pi
}

func fixAngle(a float64) float64 {
	a = a - 360.0*(math.Floor(a/360.0))
	if a < 0 {
		a += 360.0
	}
	return a
}

func fixHour(a float64) float64 {
	a = a - 24.0*(math.Floor(a/24.0))
	if a < 0 {
		a += 24.0
	}
	return a
}

func floatToTime(t float64) string {
	t = fixHour(t + 0.5/60.0) // round to nearest minute
	hours := math.Floor(t)
	minutes := math.Floor((t - hours) * 60.0)
	return fmt.Sprintf("%02d:%02d", int(hours), int(minutes))
}

func CalculatePrayers(lat, lng float64, tzOffset float64, targetDate time.Time, cityName, tzName string) PrayerTimesResult {
	// Julian Day calculation
	y := float64(targetDate.Year())
	m := float64(targetDate.Month())
	d := float64(targetDate.Day())

	if m <= 2 {
		y -= 1
		m += 12
	}
	a := math.Floor(y / 100.0)
	b := 2 - a + math.Floor(a/4.0)
	jd := math.Floor(365.25*(y+4716)) + math.Floor(30.6001*(m+1)) + d + b - 1524.5

	// Days since J2000.0
	d0 := jd - 2451545.0

	// Sun coordinates
	g := fixAngle(357.529 + 0.98560028*d0)
	q := fixAngle(280.459 + 0.98564736*d0)
	l := fixAngle(q + 1.915*math.Sin(degToRad(g)) + 0.020*math.Sin(degToRad(2*g)))
	e := 23.439 - 0.00000036*d0

	sinDec := math.Sin(degToRad(e)) * math.Sin(degToRad(l))
	dec := radToDeg(math.Asin(sinDec))

	ra := radToDeg(math.Atan2(math.Cos(degToRad(e))*math.Sin(degToRad(l)), math.Cos(degToRad(l)))) / 15.0
	ra = fixHour(ra)

	// Equation of Time
	eqt := q/15.0 - ra

	// Solar Noon (Dzuhur) in local time
	noon := fixHour(12.0 + tzOffset - lng/15.0 - eqt)

	// Subuh angle (Kemenag standard: 20 degrees below horizon)
	subuhAngle := 20.0
	cosHA_subuh := (-math.Sin(degToRad(subuhAngle)) - math.Sin(degToRad(lat))*math.Sin(degToRad(dec))) / (math.Cos(degToRad(lat)) * math.Cos(degToRad(dec)))
	ha_subuh := 0.0
	if cosHA_subuh >= -1 && cosHA_subuh <= 1 {
		ha_subuh = radToDeg(math.Acos(cosHA_subuh)) / 15.0
	}

	// Sunrise / Sunset angle (refraction 0.833 degrees)
	sunriseAngle := 0.833
	cosHA_sun := (-math.Sin(degToRad(sunriseAngle)) - math.Sin(degToRad(lat))*math.Sin(degToRad(dec))) / (math.Cos(degToRad(lat)) * math.Cos(degToRad(dec)))
	ha_sun := 0.0
	if cosHA_sun >= -1 && cosHA_sun <= 1 {
		ha_sun = radToDeg(math.Acos(cosHA_sun)) / 15.0
	}

	// Asr calculation (Shafi'i shadow factor = 1)
	shadowFactor := 1.0
	cotAsrAngle := shadowFactor + math.Tan(degToRad(math.Abs(lat-dec)))
	asrAngle := radToDeg(math.Atan(1.0 / cotAsrAngle))
	cosHA_asr := (math.Sin(degToRad(asrAngle)) - math.Sin(degToRad(lat))*math.Sin(degToRad(dec))) / (math.Cos(degToRad(lat)) * math.Cos(degToRad(dec)))
	ha_asr := 0.0
	if cosHA_asr >= -1 && cosHA_asr <= 1 {
		ha_asr = radToDeg(math.Acos(cosHA_asr)) / 15.0
	}

	// Isya angle (Kemenag standard: 18 degrees below horizon)
	isyaAngle := 18.0
	cosHA_isya := (-math.Sin(degToRad(isyaAngle)) - math.Sin(degToRad(lat))*math.Sin(degToRad(dec))) / (math.Cos(degToRad(lat)) * math.Cos(degToRad(dec)))
	ha_isya := 0.0
	if cosHA_isya >= -1 && cosHA_isya <= 1 {
		ha_isya = radToDeg(math.Acos(cosHA_isya)) / 15.0
	}

	// Calculate prayer times
	// Add 2-3 minutes safety buffer (ihtiyat) as standard in Indonesian ministry
	subuhFloat := noon - ha_subuh + (2.0 / 60.0)
	sunriseFloat := noon - ha_sun
	dhuhaFloat := sunriseFloat + (25.0 / 60.0) // approx 25 mins after sunrise
	dzuhurFloat := noon + (2.0 / 60.0)
	asharFloat := noon + ha_asr + (2.0 / 60.0)
	maghribFloat := noon + ha_sun + (2.0 / 60.0)
	isyaFloat := noon + ha_isya + (2.0 / 60.0)
	imsakFloat := subuhFloat - (10.0 / 60.0)

	subuhStr := floatToTime(subuhFloat)
	imsakStr := floatToTime(imsakFloat)
	terbitStr := floatToTime(sunriseFloat)
	dhuhaStr := floatToTime(dhuhaFloat)
	dzuhurStr := floatToTime(dzuhurFloat)
	asharStr := floatToTime(asharFloat)
	maghribStr := floatToTime(maghribFloat)
	isyaStr := floatToTime(isyaFloat)

	// Determine next prayer
	now := targetDate
	currentMinute := now.Hour()*60 + now.Minute()

	parseMin := func(tStr string) int {
		var h, m int
		fmt.Sscanf(tStr, "%d:%d", &h, &m)
		return h*60 + m
	}

	times := []struct {
		name string
		mins int
	}{
		{"Subuh", parseMin(subuhStr)},
		{"Terbit", parseMin(terbitStr)},
		{"Dzuhur", parseMin(dzuhurStr)},
		{"Ashar", parseMin(asharStr)},
		{"Maghrib", parseMin(maghribStr)},
		{"Isya", parseMin(isyaStr)},
	}

	nextPrayer := "Subuh (Besok)"
	diffMin := 0
	for _, p := range times {
		if p.mins > currentMinute {
			nextPrayer = p.name
			diffMin = p.mins - currentMinute
			break
		}
	}
	if diffMin == 0 {
		diffMin = (24*60 - currentMinute) + parseMin(subuhStr)
	}

	remainingStr := fmt.Sprintf("%d jam %d menit", diffMin/60, diffMin%60)

	return PrayerTimesResult{
		Date:       targetDate.Format("2006-01-02"),
		City:       cityName,
		Timezone:   tzName,
		Imsak:      imsakStr,
		Subuh:      subuhStr,
		Terbit:     terbitStr,
		Dhuha:      dhuhaStr,
		Dzuhur:     dzuhurStr,
		Ashar:      asharStr,
		Maghrib:    maghribStr,
		Isya:       isyaStr,
		NextPrayer: nextPrayer,
		Remaining:  remainingStr,
	}
}
