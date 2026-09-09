package models

import (
	"time"
)

type Role string

const (
	RoleAdmin  Role = "Admin"
	RoleUser   Role = "User"
	RoleViewer Role = "Viewer"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Role      Role      `gorm:"default:'User'" json:"role"`
	AvatarURL string    `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
