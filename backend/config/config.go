package config

import (
	"os"
	"strings"
)

type Config struct {
	Port        string
	DBUrl       string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string
	RedisUrl    string
	RedisAddr   string
	RedisPass   string
	JWTSecret   string
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Direct database connection string (Vercel Postgres: POSTGRES_URL / DATABASE_URL)
	dbUrl := os.Getenv("POSTGRES_URL")
	if dbUrl == "" {
		dbUrl = os.Getenv("DATABASE_URL")
	}
	if dbUrl == "" {
		dbUrl = os.Getenv("DB_URL")
	}

	// Host (Vercel Postgres: POSTGRES_HOST)
	dbHost := os.Getenv("POSTGRES_HOST")
	if dbHost == "" {
		dbHost = os.Getenv("DB_HOST")
	}
	if dbHost == "" {
		dbHost = "localhost"
	}

	// Port (Vercel Postgres: POSTGRES_PORT)
	dbPort := os.Getenv("POSTGRES_PORT")
	if dbPort == "" {
		dbPort = os.Getenv("DB_PORT")
	}
	if dbPort == "" {
		dbPort = "5432"
	}

	// User (Vercel Postgres: POSTGRES_USER)
	dbUser := os.Getenv("POSTGRES_USER")
	if dbUser == "" {
		dbUser = os.Getenv("DB_USER")
	}
	if dbUser == "" {
		dbUser = "postgres"
	}

	// Password (Vercel Postgres: POSTGRES_PASSWORD)
	dbPassword := os.Getenv("POSTGRES_PASSWORD")
	if dbPassword == "" {
		dbPassword = os.Getenv("DB_PASSWORD")
	}
	if dbPassword == "" {
		dbPassword = "postgres"
	}

	// Database name (Vercel Postgres: POSTGRES_DATABASE)
	dbName := os.Getenv("POSTGRES_DATABASE")
	if dbName == "" {
		dbName = os.Getenv("DB_NAME")
	}
	if dbName == "" {
		dbName = "quranku_db"
	}

	// SSL Mode: Cloud Postgres (Neon / Vercel Storage / Supabase) requires sslmode=require
	dbSSLMode := os.Getenv("DB_SSLMODE")
	if dbSSLMode == "" {
		if strings.Contains(dbHost, "vercel-storage.com") ||
			strings.Contains(dbHost, "neon.tech") ||
			strings.Contains(dbHost, "supabase.co") ||
			(dbHost != "localhost" && dbHost != "127.0.0.1") {
			dbSSLMode = "require"
		} else {
			dbSSLMode = "disable"
		}
	}

	// Redis / Vercel KV URL (KV_URL or REDIS_URL)
	redisUrl := os.Getenv("KV_URL")
	if redisUrl == "" {
		redisUrl = os.Getenv("REDIS_URL")
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "quranku_super_secret_key_2026"
	}

	return &Config{
		Port:       port,
		DBUrl:      dbUrl,
		DBHost:     dbHost,
		DBPort:     dbPort,
		DBUser:     dbUser,
		DBPassword: dbPassword,
		DBName:     dbName,
		DBSSLMode:  dbSSLMode,
		RedisUrl:   redisUrl,
		RedisAddr:  redisAddr,
		RedisPass:  os.Getenv("REDIS_PASSWORD"),
		JWTSecret:  jwtSecret,
	}
}

