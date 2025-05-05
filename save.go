package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
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

	path, err := getConfigPath()

	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func getSave() (float64, uint32, uint32, error) {

	path, err := getConfigPath()

	if err != nil {
		return 0, 0, 0, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return 0, 0, 0, err
	}
	var s Settings
	err = json.Unmarshal(data, &s)
	return s.FPS, s.Jump, s.Crouch, err
}

func getConfigPath() (string, error) {
	appData := os.Getenv("APPDATA") // resolves to something like C:\Users\Username\AppData\Roaming
	if appData == "" {
		return "", fmt.Errorf("APPDATA environment variable not found")
	}
	configDir := filepath.Join(appData, "SuperglideOverlay")
	err := os.MkdirAll(configDir, 0755) // ensure directory exists
	if err != nil {
		return "", err
	}
	return filepath.Join(configDir, "config.data"), nil
}
