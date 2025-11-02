// テストコンソール等から Zustand ストアへアクセスできるよう公開
import { useGameState } from "./lib/stores/useGameState";

(window as any).useGameState = useGameState;

export {};
