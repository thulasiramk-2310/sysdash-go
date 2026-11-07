package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// handlePostMetrics handles POST /api/metrics
func handlePostMetrics(c *gin.Context, store *MetricsStore, hub *WebSocketHub) {
	var metrics Metrics

	if err := c.ShouldBindJSON(&metrics); err != nil {
		// Log the error for debugging
		println("JSON Binding Error:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_json",
			"message": err.Error(),
		})
		return
	}

	// Validate metrics
	if metrics.Hostname == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "missing_hostname",
			"message": "hostname field is required",
		})
		return
	}

	// Store metrics
	store.Set(metrics.Hostname, metrics)

	// Broadcast to WebSocket clients
	hub.Broadcast(metrics)

	c.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"hostname": metrics.Hostname,
		"message":  "metrics received",
	})
}

// handleGetMetrics handles GET /api/metrics
func handleGetMetrics(c *gin.Context, store *MetricsStore) {
	hostname := c.Query("host")

	if hostname != "" {
		// Get metrics for specific host
		metrics, exists := store.Get(hostname)
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "host_not_found",
				"message": "no metrics found for host: " + hostname,
			})
			return
		}
		c.JSON(http.StatusOK, metrics)
	} else {
		// Get all metrics
		allMetrics := store.GetAll()
		c.JSON(http.StatusOK, gin.H{
			"hosts": len(allMetrics),
			"data":  allMetrics,
		})
	}
}

// handleGetHosts handles GET /api/hosts
func handleGetHosts(c *gin.Context, store *MetricsStore) {
	hosts := store.GetHosts()
	c.JSON(http.StatusOK, gin.H{
		"count": len(hosts),
		"hosts": hosts,
	})
}

// handleGetHostMetrics handles GET /api/metrics/:hostname
func handleGetHostMetrics(c *gin.Context, store *MetricsStore) {
	hostname := c.Param("hostname")

	metrics, exists := store.Get(hostname)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "host_not_found",
			"message": "no metrics found for host: " + hostname,
		})
		return
	}

	c.JSON(http.StatusOK, metrics)
}
