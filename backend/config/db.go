package config

import (
	"fmt"
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *Config) *gorm.DB {
	var err error
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)

	// Attempt connecting to PostgreSQL
	log.Println("[Database] Attempting PostgreSQL connection...")
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})

	if err != nil {
		log.Printf("[Database] PostgreSQL connection failed (%v). Falling back to pure-Go SQLite for zero-downtime operation.\n", err)
		DB, err = gorm.Open(sqlite.Open("quranku.db"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err != nil {
			log.Fatalf("[Database] Fatal: Failed to initialize fallback SQLite: %v", err)
		}
		log.Println("[Database] SQLite storage initialized successfully at quranku.db")
	} else {
		log.Println("[Database] Connected successfully to PostgreSQL!")
	}

	return DB
}
