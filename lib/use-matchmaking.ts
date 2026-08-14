"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MatchmakingState, QueuedPlayer } from "./types";
import { findOpponent, ratingBandForWaitMs, simulatedQueueSize } from "./matchmaking";

const MATCH_FOUND_DELAY_MS = 2200; // minimum time spent "searching" before a match resolves, for pacing

export function useMatchmaking(myRating: number) {
  const [state, setState] = useState<MatchmakingState>({
    status: "idle",
    searchStartedAt: null,
    playersInQueue: 0,
    ratingBand: 100,
    opponent: null,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timerRef.current = null;
    timeoutRef.current = null;
  };

  const joinQueue = useCallback(() => {
    const startedAt = Date.now();
    setState({
      status: "searching",
      searchStartedAt: startedAt,
      playersInQueue: simulatedQueueSize(),
      ratingBand: 100,
      opponent: null,
    });

    timerRef.current = setInterval(() => {
      setState((s) => {
        if (s.status !== "searching" || !s.searchStartedAt) return s;
        return { ...s, ratingBand: ratingBandForWaitMs(Date.now() - s.searchStartedAt), playersInQueue: simulatedQueueSize() };
      });
    }, 1500);

    timeoutRef.current = setTimeout(() => {
      setState((s) => {
        if (s.status !== "searching") return s;
        const opponent: QueuedPlayer = findOpponent(myRating, Date.now() - (s.searchStartedAt ?? Date.now()))!;
        return { ...s, status: "found", opponent };
      });
      clearTimers();
    }, MATCH_FOUND_DELAY_MS);
  }, [myRating]);

  const leaveQueue = useCallback(() => {
    clearTimers();
    setState({ status: "idle", searchStartedAt: null, playersInQueue: 0, ratingBand: 100, opponent: null });
  }, []);

  const confirmStart = useCallback(() => {
    setState((s) => ({ ...s, status: "starting" }));
  }, []);

  useEffect(() => () => clearTimers(), []);

  return { state, joinQueue, leaveQueue, confirmStart };
}
