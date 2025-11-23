package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/noel-vega/deployment-agent/docker"
	"github.com/noel-vega/deployment-agent/handlers"
)

func main() {
	dockerService, err := docker.NewService()
	if err != nil {
		log.Fatalf("Failed to initialize docker service: %v", err)
	}
	defer dockerService.Close()

	containersHandler := handlers.NewContainersHandler(dockerService)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Routes
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("deployment-agent"))
	})

	r.Get("/containers", containersHandler.List)

	// Start server
	if err := http.ListenAndServe(":5000", r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
