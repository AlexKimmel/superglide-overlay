package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"time"

	"github.com/moutend/go-hook/pkg/keyboard"
	"github.com/moutend/go-hook/pkg/types"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type InputHandler struct {
	ctx   context.Context
	glide *SuperglideChecker
}

func NewInputHandler(ctx context.Context) *InputHandler {
	return &InputHandler{
		ctx:   ctx,
		glide: NewSuperglideChecker(185, 0x20, 0x43),
	}
}

func (h *InputHandler) StartListening(ctx context.Context) {
	h.ctx = ctx
	go h.run()
}

func (h *InputHandler) run() {
	keyboardChan := make(chan types.KeyboardEvent, 100)

	if err := keyboard.Install(nil, keyboardChan); err != nil {
		runtime.LogError(h.ctx, fmt.Sprintf("Keyboard hook install error: %v", err))
		return
	}

	defer keyboard.Uninstall()

	runtime.LogInfo(h.ctx, "Started capturing keyboard input")

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt)

	for {
		select {
		case <-time.After(5 * time.Minute):
			//runtime.LogInfo(h.ctx, "Keyboard hook timed out")
			return
		case <-signalChan:
			//runtime.LogInfo(h.ctx, "Keyboard hook received shutdown signal")
			return
		case k := <-keyboardChan:

			if k.Message != types.WM_KEYDOWN {
				continue //  only handel key down
			}

			switch uint32(k.VKCode) {
			case uint32(h.glide.KeyBinds.Jump):
				h.glide.RegisterJump()

			case uint32(h.glide.KeyBinds.Crouch):
				if result, ok := h.glide.RegisterCrouch(); ok {
					//runtime.LogPrint(h.ctx, "Registerd Crouch input")
					runtime.EventsEmit(h.ctx, "superglideResult", result)
				}
			}
		}
	}
}
