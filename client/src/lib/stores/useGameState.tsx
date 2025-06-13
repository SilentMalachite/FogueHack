import { create } from "zustand";
import { GameEngine } from "../gameEngine";
import { GameState, Direction, Position } from "../gameTypes";
import { useAudio } from "./useAudio";

interface GameStore extends GameState {
  gameEngine: GameEngine;
  
  // Actions
  startNewGame: () => void;
  movePlayer: (direction: Direction) => void;
  castHeal: () => void;
  castFireball: () => void;
  castSpell: (spellId: string, targetPosition?: Position) => void;
  craftItem: (recipeId: string) => void;
  toggleInventory: () => void;
  useItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  saveGame: () => void;
  loadGame: () => void;
  getKnownSpells: () => any[];
  getAvailableRecipes: () => any[];
  canCraftItem: (recipeId: string) => { canCraft: boolean; missing: string[] };
  getAvailableQuests: () => any[];
  getActiveQuests: () => any[];
  getCompletedQuests: () => any[];
  acceptQuest: (questId: string) => boolean;
}

export const useGameState = create<GameStore>((set, get) => {
  const gameEngine = new GameEngine();
  const initialState = gameEngine.getGameState();

  return {
    ...initialState,
    gameEngine,

    startNewGame: () => {
      const newState = get().gameEngine.startNewGame();
      set(newState);
      
      // Start background music when game starts
      const { playBackgroundMusic } = useAudio.getState();
      setTimeout(() => {
        playBackgroundMusic();
      }, 500);
    },

    movePlayer: (direction: Direction) => {
      const newState = get().gameEngine.movePlayer(direction);
      set(newState);
      
      // Play move sound
      const { playMove } = useAudio.getState();
      playMove();
    },

    castHeal: () => {
      const newState = get().gameEngine.castHeal();
      set(newState);
      
      // Play success sound for healing
      const { playSuccess } = useAudio.getState();
      playSuccess();
    },

    castFireball: () => {
      const newState = get().gameEngine.castFireball();
      set(newState);
      
      // Play hit sound for fireball
      const { playHit } = useAudio.getState();
      playHit();
    },

    toggleInventory: () => {
      const newState = get().gameEngine.toggleInventory();
      set(newState);
    },

    useItem: (itemId: string) => {
      const newState = get().gameEngine.useItem(itemId);
      set(newState);
    },

    equipItem: (itemId: string) => {
      const newState = get().gameEngine.equipItem(itemId);
      set(newState);
    },

    castSpell: (spellId: string, targetPosition?: Position) => {
      const newState = get().gameEngine.castSpell(spellId, targetPosition);
      set(newState);
    },

    craftItem: (recipeId: string) => {
      const newState = get().gameEngine.craftItem(recipeId);
      set(newState);
    },

    getKnownSpells: () => {
      return get().gameEngine.getKnownSpells();
    },

    getAvailableRecipes: () => {
      return get().gameEngine.getAvailableRecipes();
    },

    canCraftItem: (recipeId: string) => {
      return get().gameEngine.canCraftItem(recipeId);
    },

    getAvailableQuests: () => {
      return get().gameEngine.getAvailableQuests();
    },

    getActiveQuests: () => {
      return get().gameEngine.getActiveQuests();
    },

    getCompletedQuests: () => {
      return get().gameEngine.getCompletedQuests();
    },

    acceptQuest: (questId: string) => {
      const success = get().gameEngine.acceptQuest(questId);
      if (success) {
        const newState = get().gameEngine.getGameState();
        set(newState);
      }
      return success;
    },

    saveGame: () => {
      get().gameEngine.saveGame();
    },

    loadGame: () => {
      const loadedState = get().gameEngine.loadGame();
      if (loadedState) {
        set(loadedState);
      }
    }
  };
});
