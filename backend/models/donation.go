package models

import (
	"time"
)

type DonationType string

const (
	DonationZakatFitrah      DonationType = "zakat_fitrah"
	DonationZakatMaal        DonationType = "zakat_maal"
	DonationZakatPenghasilan DonationType = "zakat_penghasilan"
	DonationSedekah          DonationType = "sedekah"
	DonationInfaq            DonationType = "infaq"
)

type DonationStatus string

const (
	StatusPending  DonationStatus = "pending"
	StatusVerified DonationStatus = "verified"
	StatusRejected DonationStatus = "rejected"
)

type Donation struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	ReceiptNumber string         `gorm:"uniqueIndex;not null" json:"receipt_number"`
	UserID        *uint          `json:"user_id"`
	DonorName     string         `gorm:"not null" json:"donor_name"`
	DonorEmail    string         `json:"donor_email"`
	DonorPhone    string         `json:"donor_phone"`
	Type          DonationType   `gorm:"not null" json:"type"`
	ProgramTitle  string         `json:"program_title"`
	Amount        float64        `gorm:"not null" json:"amount"`
	PaymentMethod string         `gorm:"not null" json:"payment_method"` // e.g., QRIS, Transfer BSI, Mandiri
	Status        DonationStatus `gorm:"default:'verified'" json:"status"` // auto-verified for simulation or pending
	Notes         string         `json:"notes"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type Bookmark struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	SurahNumber int       `gorm:"not null" json:"surah_number"`
	SurahName   string    `gorm:"not null" json:"surah_name"`
	AyahNumber  int       `gorm:"not null" json:"ayah_number"`
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
}

type PrayerLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Date      string    `gorm:"not null;index" json:"date"` // YYYY-MM-DD
	Subuh     bool      `gorm:"default:false" json:"subuh"`
	Dzuhur    bool      `gorm:"default:false" json:"dzuhur"`
	Ashar     bool      `gorm:"default:false" json:"ashar"`
	Maghrib   bool      `gorm:"default:false" json:"maghrib"`
	Isya      bool      `gorm:"default:false" json:"isya"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
