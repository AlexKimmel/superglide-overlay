package main

import (
	"encoding/json"
	"os"
)

type Settings struct {
	FPS    float64 `json:"fps"`
	Jump   uint32  `json:"jump"`
	Crouch uint32  `json:"crouch"`
}

func saveData(fps float64, jump uint32, crouch uint32) error {
	settings := Settings{fps, jump, crouch}
	data, err := json.Marshal(settings)
	if err != nil {
		return err
	}
	return os.WriteFile("config.json", data, 0644)
}

func getSave() (float64, uint32, uint32, error) {
	data, err := os.ReadFile("config.json")
	if err != nil {
		return 0, 0, 0, err
	}
	var s Settings
	err = json.Unmarshal(data, &s)
	return s.FPS, s.Jump, s.Crouch, err
}
