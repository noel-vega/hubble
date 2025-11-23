package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/noel-vega/deployment-agent/docker"
)

type ContainersHandler struct {
	dockerService *docker.Service
}

func NewContainersHandler(dockerService *docker.Service) *ContainersHandler {
	return &ContainersHandler{
		dockerService: dockerService,
	}
}

func (h *ContainersHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	containers, err := h.dockerService.ListContainers(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"containers": containers,
		"count":      len(containers),
	})
}
