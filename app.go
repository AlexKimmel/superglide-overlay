package main

import (
	"context"
	"syscall"

	"github.com/lxn/win"
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
	hwnd := win.FindWindow(nil, syscall.StringToUTF16Ptr("Superglide Overlay"))
	win.SetWindowLong(hwnd, win.GWL_EXSTYLE, win.GetWindowLong(hwnd, win.GWL_EXSTYLE)|win.WS_EX_LAYERED)

	a.ctx = ctx
	a.inputHandler.StartListening(ctx)
}
