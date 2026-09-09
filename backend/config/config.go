package config

import (
	"os"
)

type Config struct {
	Port        string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	RedisAddr   string
	RedisPass   string
	JWTSecret   string
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "quranku_db"
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
		DBHost:     dbHost,
		DBPort:     dbPort,
		DBUser:     dbUser,
		DBPassword: dbPassword,
		DBName:     dbName,
		RedisAddr:  redisAddr,
		RedisPass:  os.Getenv("REDIS_PASSWORD"),
		JWTSecret:  jwtSecret,
	}
}
