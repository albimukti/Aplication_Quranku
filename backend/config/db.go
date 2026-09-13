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

		// High-performance SQLite pragmas
		DB.Exec("PRAGMA journal_mode = WAL;")
		DB.Exec("PRAGMA synchronous = NORMAL;")
		DB.Exec("PRAGMA cache_size = -64000;") // 64MB cache
		DB.Exec("PRAGMA temp_store = MEMORY;")
		DB.Exec("PRAGMA mmap_size = 268435456;") // 256MB memory map
		log.Printf("[Database] SQLite storage initialized successfully with WAL mode & 64MB cache at %s\n", sqlitePath)
	} else {
		log.Println("[Database] Connected successfully to PostgreSQL (Vercel Storage)!")
	}

	// Connection Pool Optimization
	if sqlDB, err := DB.DB(); err == nil {
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetMaxIdleConns(25)
	}

	return DB
}

