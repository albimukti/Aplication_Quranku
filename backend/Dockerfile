# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install certificates and git
RUN apk add --no-cache ca-certificates git

# Cache Go dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy backend source
COPY . .

# Build static binary for Linux
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o quranku-backend .

# Final Runtime Image
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

ENV TZ=Asia/Jakarta
ENV PORT=8080

COPY --from=builder /app/quranku-backend .

EXPOSE 8080

CMD ["./quranku-backend"]
