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
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPass,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("[Cache] Redis ping failed at %s (%v). Using high-speed in-memory cache engine.\n", cfg.RedisAddr, err)
		Cache = NewMemoryCache()
	} else {
		log.Printf("[Cache] Connected to Redis at %s!\n", cfg.RedisAddr)
		Cache = &RedisCache{Client: rdb}
	}
	return Cache
}
