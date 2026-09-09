package config

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheService interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Del(ctx context.Context, keys ...string) error
}

type RedisCache struct {
	Client *redis.Client
}

func (r *RedisCache) Get(ctx context.Context, key string) (string, error) {
	return r.Client.Get(ctx, key).Result()
}

func (r *RedisCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.Client.Set(ctx, key, value, expiration).Err()
}

func (r *RedisCache) Del(ctx context.Context, keys ...string) error {
	return r.Client.Del(ctx, keys...).Err()
}

type memoryItem struct {
	val       string
	expiresAt time.Time
}

type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]memoryItem
}

func NewMemoryCache() *MemoryCache {
	return &MemoryCache{
		items: make(map[string]memoryItem),
	}
}

func (m *MemoryCache) Get(ctx context.Context, key string) (string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	item, ok := m.items[key]
	if !ok {
		return "", redis.Nil
	}
	if !item.expiresAt.IsZero() && time.Now().After(item.expiresAt) {
		return "", redis.Nil
	}
	return item.val, nil
}

func (m *MemoryCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	var exp time.Time
	if expiration > 0 {
		exp = time.Now().Add(expiration)
	}
	valStr := ""
	switch v := value.(type) {
	case string:
		valStr = v
	case []byte:
		valStr = string(v)
	default:
		valStr = ""
	}
	m.items[key] = memoryItem{val: valStr, expiresAt: exp}
	return nil
}

func (m *MemoryCache) Del(ctx context.Context, keys ...string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, k := range keys {
		delete(m.items, k)
	}
	return nil
}

var Cache CacheService

func InitRedis(cfg *Config) CacheService {
	var rdb *redis.Client

	if cfg.RedisUrl != "" {
		opt, err := redis.ParseURL(cfg.RedisUrl)
		if err != nil {
			log.Printf("[Cache] Failed to parse Vercel KV URL (%v). Attempting fallback...\n", err)
		} else {
			log.Println("[Cache] Connecting to Vercel KV (Redis) via KV_URL / REDIS_URL...")
			rdb = redis.NewClient(opt)
		}
	}

	if rdb == nil {
		rdb = redis.NewClient(&redis.Options{
			Addr:     cfg.RedisAddr,
			Password: cfg.RedisPass,
			DB:       0,
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		targetAddr := cfg.RedisAddr
		if cfg.RedisUrl != "" {
			targetAddr = "Vercel KV"
		}
		log.Printf("[Cache] Redis ping failed (%v). Using high-speed in-memory cache engine.\n", err)
		_ = targetAddr
		Cache = NewMemoryCache()
	} else {
		log.Println("[Cache] Connected successfully to Redis / Vercel KV!")
		Cache = &RedisCache{Client: rdb}
	}
	return Cache
}

