package config

import (
	"fmt"
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *Config) *gorm.DB {
	var err error
	var dsn string

	if cfg.DBUrl != "" {
		dsn = cfg.DBUrl
		log.Println("[Database] Initializing connection with POSTGRES_URL / DATABASE_URL from Vercel Storage...")
	} else {
		dsn = fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
			cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode,
		)
	}

	// Attempt connecting to PostgreSQL
	log.Println("[Database] Attempting PostgreSQL connection...")
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})

	if err != nil {
		log.Printf("[Database] PostgreSQL connection failed (%v). Falling back to pure-Go SQLite for zero-downtime operation.\n", err)

		sqlitePath := "quranku.db"
		if os.Getenv("VERCEL") != "" || os.Getenv("AWS_LAMBDA_FUNCTION_NAME") != "" {
			sqlitePath = "/tmp/quranku.db"
		}

		DB, err = gorm.Open(sqlite.Open(sqlitePath), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err != nil {
			log.Fatalf("[Database] Fatal: Failed to initialize fallback SQLite: %v", err)
		}
		log.Printf("[Database] SQLite storage initialized successfully at %s\n", sqlitePath)
	} else {
		log.Println("[Database] Connected successfully to PostgreSQL (Vercel Storage)!")
	}

	return DB
}

