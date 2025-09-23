// テストコンソール等から Zustand ストアへアクセスできるよう公開
import { useGameState } from "./lib/stores/useGameState";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).useGameState = useGameState;

export {};

