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
	// hwnd := win.FindWindow(nil, syscall.StringToUTF16Ptr("Superglide Overlay"))
	// win.SetWindowLong(hwnd, win.GWL_EXSTYLE, win.GetWindowLong(hwnd, win.GWL_EXSTYLE)|win.WS_EX_LAYERED)

	fps, jump, crouch, err := getSave()

	if err != nil {
		// Fallback to defaults
		fps = 144
		jump = 0x20
		crouch = 0x43
	}
	SetFps(a, fps, jump, crouch)

	a.ctx = ctx
	a.inputHandler.StartListening(ctx)
}

func (a *App) UpdateSettings(fps float64, jump uint32, crouch uint32) {
	SetFps(a, fps, jump, crouch)
	err := saveData(fps, jump, crouch)

	if err != nil {

		runtime.LogPrintf(a.ctx, "Error in update Setting: %e", err)
	}

}

func SetFps(a *App, fps float64, jump uint32, crouch uint32) {
	a.inputHandler.glide.KeyBinds = KeyBinds{Jump: jump, Crouch: crouch}

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
	SetFps(a, fps, jump, crouch)

	return map[string]interface{}{
		"jumpKey":   jump,
		"crouchKey": crouch,
		"fps":       fps,
	}
}
