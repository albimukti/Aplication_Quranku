package models

type Ayah struct {
	Number       int    `json:"number"`
	NumberInSurah int   `json:"number_in_surah"`
	Juz          int    `json:"juz"`
	Page         int    `json:"page"`
	Arab         string `json:"arab"`
	Latin        string `json:"latin"`
	Translation  string `json:"translation"`
	AudioURL     string `json:"audio_url"`
}

type Surah struct {
	Number          int    `json:"number"`
	Name            string `json:"name"`
	ArabicName      string `json:"arabic_name"`
	TranslationName string `json:"translation_name"`
	RevelationType  string `json:"revelation_type"` // Makkiyyah / Madaniyyah
	TotalAyahs      int    `json:"total_ayahs"`
	Ayahs           []Ayah `json:"ayahs,omitempty"`
}

type JuzInfo struct {
	JuzNumber int    `json:"juz_number"`
	StartSurah int   `json:"start_surah"`
	StartAyah  int   `json:"start_ayah"`
	EndSurah   int   `json:"end_surah"`
	EndAyah    int   `json:"end_ayah"`
	Name       string `json:"name"`
}

type IqroLetter struct {
	Arab         string `json:"arab"`
	Latin        string `json:"latin"`
	Makhraj      string `json:"makhraj"`
	AudioExample string `json:"audio_example,omitempty"`
}

type IqroLevel struct {
	Level       int          `json:"level"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Lessons     []IqroLesson `json:"lessons"`
}

type IqroLesson struct {
	Page    int          `json:"page"`
	Title   string       `json:"title"`
	Guidance string      `json:"guidance"`
	Letters []IqroLetter `json:"letters"`
}

type DoaItem struct {
	ID          int      `json:"id"`
	Category    string   `json:"category"` // "sholat", "harian", "dzikir"
	Title       string   `json:"title"`
	Arab        string   `json:"arab"`
	Latin       string   `json:"latin"`
	Translation string   `json:"translation"`
	Riwayat     string   `json:"riwayat"`
	AudioURL    string   `json:"audio_url,omitempty"`
}
