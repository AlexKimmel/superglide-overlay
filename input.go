package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"

	"github.com/moutend/go-hook/pkg/keyboard"

	"github.com/moutend/go-hook/pkg/mouse"
	"github.com/moutend/go-hook/pkg/types"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const MOUSEWHEEL_UP = 7864320
const MOUSEWHEEL_DOWN = 4287102976

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
	evKeyboardChan := make(chan types.KeyboardEvent, 10)
	mouseChan := make(chan types.MouseEvent, 10)

	if err := keyboard.Install(nil, evKeyboardChan); err != nil {
		runtime.LogError(h.ctx, fmt.Sprintf("Keyboard hook install error: %v", err))

		messageOptions := runtime.MessageDialogOptions{
			Type:    "Error",
			Title:   "Keyboard Hook Error",
			Message: err.Error(),
			Buttons: []string{"Okay"},
		}

		runtime.MessageDialog(h.ctx, messageOptions)
		return
	}

	defer keyboard.Uninstall()

	if err := mouse.Install(nil, mouseChan); err != nil {
		runtime.LogError(h.ctx, fmt.Sprintf("Mouse hook install error: %v", err))

		messageOptions := runtime.MessageDialogOptions{
			Type:    "Error",
			Title:   "Mouse Hook Error",
			Message: err.Error(),
			Buttons: []string{"Okay"},
		}

		runtime.MessageDialog(h.ctx, messageOptions)
		return
	}

	defer mouse.Uninstall()

	runtime.LogInfo(h.ctx, "Started capturing keyboard input")

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt)

	for {
		select {
		case <-signalChan:
			return
		case m := <-mouseChan:
			if m.Message != types.Message(522) {
				continue // only handle scroll wheel input
			}

			if h.glide.KeyBinds.UpdateCrouch || h.glide.KeyBinds.UpdateJump {
				h.UpdateBinds(uint32(m.MouseData))
			}

			switch m.MouseData {
			case h.glide.KeyBinds.Jump:
				h.glide.RegisterJump()
				continue
			case h.glide.KeyBinds.Crouch:
				if result, ok := h.glide.RegisterCrouch(); ok {
					runtime.EventsEmit(h.ctx, "superglideResult", result)
				}
			}

		case k := <-evKeyboardChan:
			if k.Message != types.WM_KEYDOWN {
				continue //  only handel key down
			}

			if h.glide.KeyBinds.UpdateCrouch || h.glide.KeyBinds.UpdateJump {
				h.UpdateBinds(uint32(k.VKCode))
			}

			switch uint32(k.VKCode) {
			case uint32(h.glide.KeyBinds.Jump):
				h.glide.RegisterJump()
				continue
			case uint32(h.glide.KeyBinds.Crouch):
				if result, ok := h.glide.RegisterCrouch(); ok {
					runtime.EventsEmit(h.ctx, "superglideResult", result)
				}
			}
		}
	}
}

func (h *InputHandler) UpdateBinds(newBind uint32) {

	if h.glide.KeyBinds.UpdateJump {
		h.glide.KeyBinds.Jump = newBind
		h.glide.KeyBinds.UpdateJump = false
		err := saveData(h.glide.TargetFPS, h.glide.KeyBinds.Jump, h.glide.KeyBinds.Crouch)

		if err != nil {
			runtime.LogPrintf(h.ctx, "Error in update Setting: %e", err)
		}

		runtime.EventsEmit(h.ctx, "updateInput", map[string]any{"jump": h.glide.KeyBinds.Jump, "crouch": h.glide.KeyBinds.Crouch})
	}
	if h.glide.KeyBinds.UpdateCrouch {
		h.glide.KeyBinds.Crouch = newBind
		h.glide.KeyBinds.UpdateCrouch = false
		err := saveData(h.glide.TargetFPS, h.glide.KeyBinds.Jump, h.glide.KeyBinds.Crouch)

		if err != nil {
			runtime.LogPrintf(h.ctx, "Error in update Setting: %e", err)
		}

		runtime.EventsEmit(h.ctx, "updateInput", map[string]any{"jump": h.glide.KeyBinds.Jump, "crouch": h.glide.KeyBinds.Crouch})
	}
}
