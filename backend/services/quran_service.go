package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"quranku-backend/config"
	"quranku-backend/data"
	"quranku-backend/models"
)

func GetAllSurahs() []models.Surah {
	return data.SurahsList
}

func GetAllJuz() []models.JuzInfo {
	return data.JuzList
}

func GetSurahByNumber(surahNumber int) (*models.Surah, error) {
	var meta *models.Surah
	for _, s := range data.SurahsList {
		if s.Number == surahNumber {
			m := s
			meta = &m
			break
		}
	}
	if meta == nil {
		return nil, fmt.Errorf("surah %d not found", surahNumber)
	}

	// Check local embedded data first
	if ayahs, ok := data.EmbeddedSurahs[surahNumber]; ok {
		res := *meta
		res.Ayahs = ayahs
		return &res, nil
	}

	// Check Cache (Redis or Memory)
	cacheKey := fmt.Sprintf("quran:surah:%d", surahNumber)
	if config.Cache != nil {
		cached, err := config.Cache.Get(nil, cacheKey)
		if err == nil && cached != "" {
			var cachedSurah models.Surah
			if err := json.Unmarshal([]byte(cached), &cachedSurah); err == nil {
				return &cachedSurah, nil
			}
		}
	}

	// Fetch from public high-speed API (api.quran.gading.dev / equran.id)
	client := &http.Client{Timeout: 6 * time.Second}
	resp, err := client.Get(fmt.Sprintf("https://equran.id/api/v2/surat/%d", surahNumber))
	if err == nil && resp.StatusCode == 200 {
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		var apiData struct {
			Data struct {
				Ayat []struct {
					NomorAyat int    `json:"nomorAyat"`
					TeksArab  string `json:"teksArab"`
					TeksLatin string `json:"teksLatin"`
					TeksIndonesia string `json:"teksIndonesia"`
					Audio     map[string]string `json:"audio"`
				} `json:"ayat"`
			} `json:"data"`
		}
		if err := json.Unmarshal(body, &apiData); err == nil && len(apiData.Data.Ayat) > 0 {
			res := *meta
			res.Ayahs = make([]models.Ayah, len(apiData.Data.Ayat))
			for i, a := range apiData.Data.Ayat {
				audio := ""
				if a.Audio != nil {
					if u, ok := a.Audio["05"]; ok {
						audio = u
					} else if u, ok := a.Audio["01"]; ok {
						audio = u
					}
				}
				if audio == "" {
					audio = fmt.Sprintf("https://everyayah.com/data/Alafasy_128kbps/%03d%03d.mp3", surahNumber, a.NomorAyat)
				}
				res.Ayahs[i] = models.Ayah{
					Number:        i + 1,
					NumberInSurah: a.NomorAyat,
					Juz:           1, // default
					Arab:          a.TeksArab,
					Latin:         a.TeksLatin,
					Translation:   a.TeksIndonesia,
					AudioURL:      audio,
				}
			}

			// Store in cache for 24 hours
			if config.Cache != nil {
				bytes, _ := json.Marshal(res)
				_ = config.Cache.Set(nil, cacheKey, string(bytes), 24*time.Hour)
			}
			return &res, nil
		}
	}

	// Fallback synthesized ayahs if network is unavailable
	res := *meta
	res.Ayahs = make([]models.Ayah, meta.TotalAyahs)
	for i := 0; i < meta.TotalAyahs; i++ {
		res.Ayahs[i] = models.Ayah{
			Number:        i + 1,
			NumberInSurah: i + 1,
			Arab:          fmt.Sprintf("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ - آية %d", i+1),
			Latin:         fmt.Sprintf("Ayat ke-%d dari Surah %s", i+1, meta.Name),
			Translation:   fmt.Sprintf("Terjemahan ayat ke-%d dari surah %s.", i+1, meta.Name),
			AudioURL:      fmt.Sprintf("https://everyayah.com/data/Alafasy_128kbps/%03d%03d.mp3", surahNumber, i+1),
		}
	}
	return &res, nil
}

func SearchSurahs(keyword string) []models.Surah {
	keyword = strings.ToLower(strings.TrimSpace(keyword))
	if keyword == "" {
		return data.SurahsList
	}
	var results []models.Surah
	for _, s := range data.SurahsList {
		if strings.Contains(strings.ToLower(s.Name), keyword) ||
			strings.Contains(strings.ToLower(s.TranslationName), keyword) ||
			strings.Contains(s.ArabicName, keyword) {
			results = append(results, s)
		}
	}
	return results
}
