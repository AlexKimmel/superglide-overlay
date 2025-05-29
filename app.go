package main

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx          context.Context
	inputHandler *InputHandler
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		inputHandler: NewInputHandler(context.Background()),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	fps, jump, crouch, err := getSave()

	if err != nil {
		// Fallback to defaults
		fps = 144
		jump = 0x20
		crouch = 0x43
	}
	SetFps(a, fps)
	a.inputHandler.glide.KeyBinds = KeyBinds{Jump: jump, Crouch: crouch}

	a.ctx = ctx
	a.inputHandler.StartListening(ctx)
}

func (a *App) UpdateSettings(s string, fps float64) {
	runtime.LogPrint(a.ctx, s)
	switch s {
	case "jump":
		a.inputHandler.glide.KeyBinds.UpdateJump = true
	case "crouch":
		a.inputHandler.glide.KeyBinds.UpdateCrouch = true
	case "fps":
		SetFps(a, fps)
		err := saveData(a.inputHandler.glide.TargetFPS, a.inputHandler.glide.KeyBinds.Jump, a.inputHandler.glide.KeyBinds.Crouch)

		if err != nil {
			runtime.LogPrintf(a.ctx, "Error in update Setting: %e", err)
		}
	}
}

func SetFps(a *App, fps float64) {
	a.inputHandler.glide.TargetFPS = fps
	a.inputHandler.glide.FrameTime = 1.0 / fps
	a.inputHandler.glide.State = Ready
}

func (a *App) GetSettings() map[string]interface{} {

	fps, jump, crouch, err := getSave()

	if err != nil {
		// Fallback to defaults
		fps = 144
		jump = 0x20
		crouch = 0x43
	}

	SetFps(a, fps)
	a.inputHandler.glide.KeyBinds = KeyBinds{Jump: jump, Crouch: crouch}

	return map[string]interface{}{
		"jumpKey":   jump,
		"crouchKey": crouch,
		"fps":       fps,
	}
}
