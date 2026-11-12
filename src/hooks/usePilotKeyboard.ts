"use client";

import { useEffect, useRef } from "react";

import {
  keyToCardinal,
  keyToTurn,
  type PilotAction,
} from "@/lib/pilot";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag !== "INPUT") return false;
  const type = (target as HTMLInputElement).type;
  return type === "text" || type === "search" || type === "password" || type === "";
}

type UsePilotKeyboardOptions = {
  enabled: boolean;
  onAction: (action: PilotAction) => void;
};

export function usePilotKeyboard({
  enabled,
  onAction,
}: UsePilotKeyboardOptions) {
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const cardinal = keyToCardinal(event.key);
      const turn = keyToTurn(event.key);
      if (!cardinal && !turn) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      const active = document.activeElement;
      if (active instanceof HTMLElement) {
        const tag = active.tagName;
        if (tag === "INPUT" || tag === "SELECT" || tag === "BUTTON") {
          active.blur();
        }
      }

      if (turn) {
        onActionRef.current({ type: "turn", command: turn });
        return;
      }
      if (cardinal) {
        onActionRef.current({ type: "step", cardinal });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
