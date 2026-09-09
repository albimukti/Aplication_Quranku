package handlers

import (
	"fmt"
	"math"
	"math/rand"
	"time"

	"github.com/gofiber/fiber/v2"

	"quranku-backend/config"
	"quranku-backend/models"
)

func SeedDefaultDonations() {
	var count int64
	config.DB.Model(&models.Donation{}).Count(&count)
	if count > 0 {
		return
	}

	donations := []models.Donation{
		{
			ReceiptNumber: "INV-QK-20260901-001",
			DonorName:     "H. Muhammad Ridwan",
			DonorEmail:    "ridwan@gmail.com",
			Type:          models.DonationZakatMaal,
			ProgramTitle:  "Zakat Maal Tabungan & Emas",
			Amount:        2500000,
			PaymentMethod: "Transfer Bank BSI",
			Status:        models.StatusVerified,
			Notes:         "Semoga berkah untuk kaum dhuafa",
			CreatedAt:     time.Now().Add(-48 * time.Hour),
		},
		{
			ReceiptNumber: "INV-QK-20260902-002",
			DonorName:     "Siti Nurhaliza",
			DonorEmail:    "siti.n@gmail.com",
			Type:          models.DonationSedekah,
			ProgramTitle:  "Sedekah Subuh Berkah",
			Amount:        100000,
			PaymentMethod: "QRIS",
			Status:        models.StatusVerified,
			Notes:         "Sedekah rutin subuh",
			CreatedAt:     time.Now().Add(-24 * time.Hour),
		},
		{
			ReceiptNumber: "INV-QK-20260903-003",
			DonorName:     "Budi Hartono",
			DonorEmail:    "budi.h@yahoo.com",
			Type:          models.DonationInfaq,
			ProgramTitle:  "Infaq Renovasi & Pengadaan Al-Qur'an",
			Amount:        500000,
			PaymentMethod: "Transfer Mandiri",
			Status:        models.StatusVerified,
			Notes:         "Wakaf Al-Qur'an untuk santri pelosok",
			CreatedAt:     time.Now().Add(-6 * time.Hour),
		},
	}

	for _, d := range donations {
		config.DB.Create(&d)
	}
}

type ZakatCalcRequest struct {
	Type          string  `json:"type"` // "penghasilan", "maal", "fitrah"
	Income        float64 `json:"income"`
	OtherIncome   float64 `json:"other_income"`
	Debt          float64 `json:"debt"`
	GoldWeightGram float64 `json:"gold_weight_gram"`
	SavingsAmount float64 `json:"savings_amount"`
	GoldPricePerGram float64 `json:"gold_price_per_gram"`
	TotalPersons  int     `json:"total_persons"`
	RicePricePerKg float64 `json:"rice_price_per_kg"`
}

type ZakatCalcResponse struct {
	Nisab         float64 `json:"nisab"`
	TotalAsset    float64 `json:"total_asset"`
	IsObligated   bool    `json:"is_obligated"`
	ZakatAmount   float64 `json:"zakat_amount"`
	Explanation   string  `json:"explanation"`
}

func CalculateZakat(c *fiber.Ctx) error {
	var req ZakatCalcRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format perhitungan tidak valid"})
	}

	if req.GoldPricePerGram <= 0 {
		req.GoldPricePerGram = 1350000 // Standar estimasi emas 2026 (Rp 1.350.000 / gram)
	}
	if req.RicePricePerKg <= 0 {
		req.RicePricePerKg = 16000 // Standar estimasi beras 2026 (Rp 16.000 / kg)
	}

	switch req.Type {
	case "fitrah":
		persons := req.TotalPersons
		if persons <= 0 {
			persons = 1
		}
		// 2.5 kg or 3.5 liter beras per person
		amount := float64(persons) * 2.5 * req.RicePricePerKg
		return c.JSON(ZakatCalcResponse{
			Nisab:       0,
			TotalAsset:  float64(persons),
			IsObligated: true,
			ZakatAmount: amount,
			Explanation: fmt.Sprintf("Zakat Fitrah untuk %d jiwa x 2.5 kg beras (Rp %.0f/kg) = Rp %.0f", persons, req.RicePricePerKg, amount),
		})

	case "maal":
		nisab := 85.0 * req.GoldPricePerGram // 85 gram emas
		totalWealth := (req.GoldWeightGram * req.GoldPricePerGram) + req.SavingsAmount - req.Debt
		if totalWealth < 0 {
			totalWealth = 0
		}
		obligated := totalWealth >= nisab
		zakat := 0.0
		if obligated {
			zakat = totalWealth * 0.025
		}
		return c.JSON(ZakatCalcResponse{
			Nisab:       nisab,
			TotalAsset:  totalWealth,
			IsObligated: obligated,
			ZakatAmount: math.Round(zakat),
			Explanation: fmt.Sprintf("Nisab emas 85 gram: Rp %.0f. Total harta: Rp %.0f.", nisab, totalWealth),
		})

	case "penghasilan":
		fallthrough
	default:
		// Zakat profesi bulanan: Nisab setara 85 gram emas / 12 bulan
		nisabMonthly := (85.0 * req.GoldPricePerGram) / 12.0
		netIncome := (req.Income + req.OtherIncome) - req.Debt
		if netIncome < 0 {
			netIncome = 0
		}
		obligated := netIncome >= nisabMonthly
		zakat := 0.0
		if obligated {
			zakat = netIncome * 0.025
		}
		return c.JSON(ZakatCalcResponse{
			Nisab:       math.Round(nisabMonthly),
			TotalAsset:  netIncome,
			IsObligated: obligated,
			ZakatAmount: math.Round(zakat),
			Explanation: fmt.Sprintf("Nisab bulanan: Rp %.0f. Pendapatan bersih: Rp %.0f.", nisabMonthly, netIncome),
		})
	}
}

type CreateDonationRequest struct {
	DonorName     string              `json:"donor_name"`
	DonorEmail    string              `json:"donor_email"`
	DonorPhone    string              `json:"donor_phone"`
	Type          models.DonationType `json:"type"`
	ProgramTitle  string              `json:"program_title"`
	Amount        float64             `json:"amount"`
	PaymentMethod string              `json:"payment_method"`
	Notes         string              `json:"notes"`
}

func CreateDonation(c *fiber.Ctx) error {
	var req CreateDonationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format data donasi tidak valid"})
	}

	if req.DonorName == "" || req.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nama dan jumlah donasi wajib diisi"})
	}

	now := time.Now()
	receiptNum := fmt.Sprintf("INV-QK-%s-%04d", now.Format("20060102"), rand.Intn(9999))

	var userID *uint
	if userVal := c.Locals("user"); userVal != nil {
		if u, ok := userVal.(*models.User); ok {
			userID = &u.ID
		}
	}

	donation := models.Donation{
		ReceiptNumber: receiptNum,
		UserID:        userID,
		DonorName:     req.DonorName,
		DonorEmail:    req.DonorEmail,
		DonorPhone:    req.DonorPhone,
		Type:          req.Type,
		ProgramTitle:  req.ProgramTitle,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
		Status:        models.StatusVerified, // Simulated instant verification
		Notes:         req.Notes,
		CreatedAt:     now,
	}

	if err := config.DB.Create(&donation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan donasi"})
	}

	return c.Status(fiber.StatusCreated).JSON(donation)
}

func GetRecentDonations(c *fiber.Ctx) error {
	var donations []models.Donation
	config.DB.Order("created_at desc").Limit(20).Find(&donations)
	return c.JSON(donations)
}

func GetDonationReceipt(c *fiber.Ctx) error {
	receiptNum := c.Params("receiptNumber")
	var donation models.Donation
	if err := config.DB.Where("receipt_number = ?", receiptNum).First(&donation).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Tanda terima tidak ditemukan"})
	}
	return c.JSON(donation)
}
