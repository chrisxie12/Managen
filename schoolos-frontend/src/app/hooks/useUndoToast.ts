import { useCallback, useRef } from "react";
import { toast } from "sonner";

interface UndoOptions {
  duration?: number;
  description?: string;
}

export function useUndoToast() {
  const undoHandlersRef = useRef<Map<string, () => void>>(new Map());

  const showUndoToast = useCallback(
    (actionLabel: string, onUndo: () => void, options?: UndoOptions) => {
      const id = `${actionLabel}-${Date.now()}`;
      undoHandlersRef.current.set(id, onUndo);

      toast(actionLabel, {
        description: options?.description,
        duration: options?.duration ?? 10000,
        action: {
          label: "Undo",
          onClick: () => {
            const handler = undoHandlersRef.current.get(id);
            if (handler) {
              handler();
              undoHandlersRef.current.delete(id);
            }
          },
        },
        onDismiss: () => undoHandlersRef.current.delete(id),
        onAutoClose: () => undoHandlersRef.current.delete(id),
      });
    },
    [],
  );

  return { showUndoToast };
}
