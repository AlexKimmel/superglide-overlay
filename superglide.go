package main

import (
	"fmt"
	"time"
)

type GlideState int

const (
	Ready GlideState = iota
	Jump
	JumpWarned
	Crouch
)

type SuperglideChecker struct {
	TargetFPS   float64
	FrameTime   float64
	LastState   GlideState
	State       GlideState
	Stopwatch   time.Time
	Attempt     int
	Cumulative  float64
	LastChance  float64
	LastMessage string
}

func NewSuperglideChecker(fps float64) *SuperglideChecker {
	return &SuperglideChecker{
		TargetFPS: fps,
		FrameTime: 1.0 / fps,
		State:     Ready,
	}
}
func (s *SuperglideChecker) RegisterJump() (map[string]any, bool) {
	if s == nil {
		return nil, false
	}

	now := time.Now()
	s.Stopwatch = now
	s.State = Jump
	s.LastState = Jump

	return nil, false
}

func (s *SuperglideChecker) RegisterCrouch() (map[string]any, bool) {
	now := time.Now()

	switch s.State {
	case Ready:
		s.Stopwatch = now
		s.State = Crouch
		return nil, false

	case Jump, JumpWarned:
		delta := time.Since(s.Stopwatch).Seconds()
		elapsedFrames := delta / s.FrameTime
		diff := s.FrameTime - delta

		var message, status string
		var chance float64

		switch {
		case elapsedFrames < 0.9:
			chance = 100 * elapsedFrames
			message = fmt.Sprintf("Crouch slightly later by %f seconds to improve.", diff)
			status = "early"
		case elapsedFrames <= 1.1:
			chance = 100
			message = "Perfect timing!"
			status = "perfect"
		case elapsedFrames < 2.0:
			chance = (2 - elapsedFrames) * 100
			message = fmt.Sprintf("Crouch slightly sooner by %f seconds to improve.", -diff)
			status = "late"
		default:
			chance = 0
			message = fmt.Sprintf("Crouched too late by %f seconds", -diff)
			status = "too_late"
		}

		s.Attempt++
		s.Cumulative += chance
		avg := s.Cumulative / float64(s.Attempt)
		s.State = Ready

		output := map[string]any{
			"deltaSeconds":  delta,
			"framesElapsed": elapsedFrames,
			"chancePercent": chance,
			"message":       message,
			"attempt":       s.Attempt,
			"averageChance": avg,
			"status":        status,
		}
		return output, true

	case Crouch:
		s.State = Ready
		s.LastChance = 0
		s.LastMessage = "Double crouch input, resetting"
		output := map[string]any{
			"chancePercent": 0,
			"message":       s.LastMessage,
			"attempt":       s.Attempt,
			"averageChance": s.safeAverage(),
			"status":        "double_crouch",
		}
		return output, true
	}

	s.LastState = s.State
	return nil, false
}

func (s *SuperglideChecker) safeAverage() float64 {
	if s.Attempt == 0 {
		return 0
	}
	return s.Cumulative / float64(s.Attempt)
}
