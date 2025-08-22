import { Spell, SpellEffect, Position, Monster, Player, GameState } from "./gameTypes";

export class SpellSystem {
  private spells: Map<string, Spell> = new Map();

  constructor() {
    this.initializeSpells();
  }

  private initializeSpells(): void {
    const spellData: Spell[] = [
      // 初級魔法 (レベル1-3)
      {
        id: "heal",
        name: "ヒール",
        type: "healing",
        manaCost: 10,
        healAmount: 15,
        range: 0,
        description: "HPを15回復する",
        level: 1,
        symbol: "♥",
        color: "#00FF00",
        effects: [{ type: "heal", target: "self", value: 15 }],
      },
      {
        id: "fireball",
        name: "ファイアボール",
        type: "offensive",
        manaCost: 15,
        damage: 20,
        range: 3,
        description: "炎の球で敵に20ダメージ",
        level: 1,
        symbol: "●",
        color: "#FF4500",
        effects: [{ type: "damage", target: "enemy", value: 20 }],
      },
      {
        id: "magic_missile",
        name: "マジックミサイル",
        type: "offensive",
        manaCost: 8,
        damage: 12,
        range: 4,
        description: "必中の魔法弾で12ダメージ",
        level: 1,
        symbol: "→",
        color: "#00FFFF",
        effects: [{ type: "damage", target: "enemy", value: 12 }],
      },

      // 中級魔法 (レベル4-6)
      {
        id: "ice_lance",
        name: "アイスランス",
        type: "offensive",
        manaCost: 20,
        damage: 25,
        range: 2,
        description: "氷の槍で25ダメージ、敵を凍結",
        level: 4,
        symbol: "▲",
        color: "#87CEEB",
        effects: [
          { type: "damage", target: "enemy", value: 25 },
          { type: "debuff", target: "enemy", value: -5, duration: 3 },
        ],
      },
      {
        id: "lightning_bolt",
        name: "ライトニングボルト",
        type: "offensive",
        manaCost: 25,
        damage: 30,
        range: 5,
        description: "稲妻で30ダメージ、貫通効果",
        level: 5,
        symbol: "⚡",
        color: "#FFFF00",
        effects: [{ type: "damage", target: "enemy", value: 30 }],
      },
      {
        id: "greater_heal",
        name: "グレーターヒール",
        type: "healing",
        manaCost: 25,
        healAmount: 40,
        range: 0,
        description: "HPを40回復し、毒を治癒",
        level: 4,
        symbol: "♥",
        color: "#32CD32",
        effects: [{ type: "heal", target: "self", value: 40 }],
      },
      {
        id: "shield",
        name: "マジックシールド",
        type: "defensive",
        manaCost: 20,
        range: 0,
        description: "5ターン防御力+10",
        level: 3,
        symbol: "◊",
        color: "#4169E1",
        effects: [{ type: "buff", target: "self", value: 10, duration: 5 }],
      },

      // 上級魔法 (レベル7-10)
      {
        id: "meteor",
        name: "メテオ",
        type: "offensive",
        manaCost: 50,
        damage: 60,
        range: 3,
        description: "隕石で周囲の敵全てに60ダメージ",
        level: 8,
        symbol: "☄",
        color: "#FF6347",
        effects: [{ type: "damage", target: "area", value: 60 }],
      },
      {
        id: "teleport",
        name: "テレポート",
        type: "utility",
        manaCost: 30,
        range: 10,
        description: "指定した場所にワープ",
        level: 6,
        symbol: "◎",
        color: "#9400D3",
        effects: [{ type: "teleport", target: "self", value: 0 }],
      },
      {
        id: "time_stop",
        name: "タイムストップ",
        type: "utility",
        manaCost: 40,
        range: 0,
        description: "3ターン敵の行動を停止",
        level: 9,
        symbol: "⧖",
        color: "#FFD700",
        effects: [{ type: "debuff", target: "all_enemies", value: 0, duration: 3 }],
      },
      {
        id: "resurrection",
        name: "リザレクション",
        type: "healing",
        manaCost: 80,
        healAmount: 100,
        range: 0,
        description: "最大HPまで完全回復",
        level: 10,
        symbol: "✚",
        color: "#FFFFFF",
        effects: [{ type: "heal", target: "self", value: 9999 }],
      },
    ];

    spellData.forEach((spell) => {
      this.spells.set(spell.id, spell);
    });
  }

  getSpell(id: string): Spell | undefined {
    return this.spells.get(id);
  }

  getAvailableSpells(playerLevel: number): Spell[] {
    return Array.from(this.spells.values()).filter((spell) => spell.level <= playerLevel);
  }

  getKnownSpells(knownSpellIds: string[]): Spell[] {
    return knownSpellIds.map((id) => this.spells.get(id)).filter(Boolean) as Spell[];
  }

  learnSpell(player: Player, spellId: string): boolean {
    const spell = this.spells.get(spellId);
    if (!spell) return false;

    if (player.level < spell.level) return false;
    if (player.knownSpells.includes(spellId)) return false;

    player.knownSpells.push(spellId);
    return true;
  }

  castSpell(
    spellId: string,
    caster: Player,
    target: Position,
    gameState: GameState,
  ): { success: boolean; message: string; gameState?: GameState } {
    const spell = this.spells.get(spellId);
    if (!spell) {
      return { success: false, message: "不明な魔法です" };
    }

    if (!caster.knownSpells.includes(spellId)) {
      return { success: false, message: "習得していない魔法です" };
    }

    if (caster.mp < spell.manaCost) {
      return { success: false, message: "MPが足りません" };
    }

    // 距離チェック
    const distance =
      Math.abs(caster.position.x - target.x) + Math.abs(caster.position.y - target.y);
    if (distance > spell.range && spell.range > 0) {
      return { success: false, message: "射程距離外です" };
    }

    // MP消費
    caster.mp -= spell.manaCost;

    // 魔法効果を適用
    const result = this.applySpellEffects(spell, caster, target, gameState);

    return {
      success: true,
      message: `${spell.name}を唱えた！`,
      gameState: result,
    };
  }

  private applySpellEffects(
    spell: Spell,
    caster: Player,
    target: Position,
    gameState: GameState,
  ): GameState {
    const newGameState = { ...gameState };

    if (!spell.effects) return newGameState;

    spell.effects.forEach((effect) => {
      switch (effect.type) {
        case "heal":
          if (effect.target === "self") {
            const healAmount =
              effect.value === 9999
                ? caster.maxHp
                : Math.min(effect.value, caster.maxHp - caster.hp);
            caster.hp = Math.min(caster.maxHp, caster.hp + healAmount);
            newGameState.messages.push(`HPが${healAmount}回復した！`);
          }
          break;

        case "damage":
          if (effect.target === "enemy") {
            const targetMonster = this.findMonsterAtPosition(target, newGameState.monsters);
            if (targetMonster) {
              const damage = Math.max(1, effect.value + caster.magicPower - targetMonster.defense);
              targetMonster.hp -= damage;
              newGameState.messages.push(`${targetMonster.name}に${damage}ダメージ！`);

              if (targetMonster.hp <= 0) {
                this.killMonster(targetMonster, newGameState);
              }
            }
          } else if (effect.target === "area") {
            this.damageAreaTargets(target, effect.value + caster.magicPower, newGameState);
          } else if (effect.target === "all_enemies") {
            newGameState.monsters.forEach((monster) => {
              const damage = Math.max(1, effect.value + caster.magicPower - monster.defense);
              monster.hp -= damage;
              newGameState.messages.push(`${monster.name}に${damage}ダメージ！`);
            });
            newGameState.monsters = newGameState.monsters.filter((monster) => {
              if (monster.hp <= 0) {
                this.addExperience(monster.exp, newGameState);
                return false;
              }
              return true;
            });
          }
          break;

        case "teleport":
          if (effect.target === "self" && newGameState.dungeon[target.y][target.x].passable) {
            caster.position = { ...target };
            newGameState.messages.push("テレポートした！");
          }
          break;

        case "buff":
          if (effect.target === "self") {
            // 簡易的なバフ実装（実際にはプレイヤーにバフ効果を適用）
            caster.defense += effect.value;
            newGameState.messages.push(`防御力が${effect.value}上昇した！`);
          }
          break;
      }
    });

    return newGameState;
  }

  private findMonsterAtPosition(position: Position, monsters: Monster[]): Monster | null {
    return (
      monsters.find(
        (monster) => monster.position.x === position.x && monster.position.y === position.y,
      ) || null
    );
  }

  private damageAreaTargets(center: Position, damage: number, gameState: GameState): void {
    const radius = 2;
    gameState.monsters.forEach((monster) => {
      const distance =
        Math.abs(monster.position.x - center.x) + Math.abs(monster.position.y - center.y);
      if (distance <= radius) {
        const actualDamage = Math.max(1, damage - monster.defense);
        monster.hp -= actualDamage;
        gameState.messages.push(`${monster.name}に${actualDamage}ダメージ！`);
      }
    });

    gameState.monsters = gameState.monsters.filter((monster) => {
      if (monster.hp <= 0) {
        this.addExperience(monster.exp, gameState);
        return false;
      }
      return true;
    });
  }

  private killMonster(monster: Monster, gameState: GameState): void {
    const index = gameState.monsters.indexOf(monster);
    if (index > -1) {
      gameState.monsters.splice(index, 1);
      this.addExperience(monster.exp, gameState);
      gameState.messages.push(`${monster.name}を倒した！`);
    }
  }

  private addExperience(exp: number, gameState: GameState): void {
    gameState.player.exp += exp;
    gameState.messages.push(`${exp}経験値を獲得！`);
  }
}
