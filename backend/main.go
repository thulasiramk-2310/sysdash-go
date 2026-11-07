package main

import (
	"log"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize stores
	metricsStore := NewMetricsStore()
	wsHub := NewWebSocketHub()

	// Start WebSocket hub
	go wsHub.Run()

	// Create Gin router
	router := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	// Allow localhost origins dynamically (useful for varying Vite ports during development)
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173", "chrome-extension://*"}
	config.AllowOriginFunc = func(origin string) bool {
		// Allow any http://localhost:<port> or http://127.0.0.1:<port>
		return strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:")
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "sysdash-backend",
			"version": "1.0.0",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// POST /api/metrics - Receive metrics from collector
		api.POST("/metrics", func(c *gin.Context) {
			handlePostMetrics(c, metricsStore, wsHub)
		})

		// GET /api/metrics - Get latest metrics (all hosts or specific host)
		api.GET("/metrics", func(c *gin.Context) {
			handleGetMetrics(c, metricsStore)
		})

		// GET /api/hosts - Get list of all monitored hosts
		api.GET("/hosts", func(c *gin.Context) {
			handleGetHosts(c, metricsStore)
		})

		// GET /api/metrics/:hostname - Get metrics for specific host
		api.GET("/metrics/:hostname", func(c *gin.Context) {
			handleGetHostMetrics(c, metricsStore)
		})
	}

	// WebSocket endpoint
	router.GET("/ws", func(c *gin.Context) {
		handleWebSocket(c, wsHub)
	})

	// Legacy endpoint for backward compatibility
	router.GET("/live", func(c *gin.Context) {
		handleWebSocket(c, wsHub)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting SysDash Backend Server on port %s", port)
	log.Printf("WebSocket endpoint: ws://localhost:%s/ws", port)
	log.Printf("API endpoint: http://localhost:%s/api/metrics", port)
	log.Printf("Health check: http://localhost:%s/health", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
