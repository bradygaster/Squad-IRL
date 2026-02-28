package service

import "github.com/gin-gonic/gin"

type Service struct {
	cfg interface{}
}

func New() *Service {
	return &Service{}
}

func (s *Service) RegisterRoutes(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}
