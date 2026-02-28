package main

import (
	"github.com/gin-gonic/gin"
	"github.com/squad/go-service/internal/service"
)

func main() {
	r := gin.Default()
	
	svc := service.New()
	svc.RegisterRoutes(r)
	
	r.Run(":8080")
}
