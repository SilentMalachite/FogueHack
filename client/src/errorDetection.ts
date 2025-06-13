// FogueHack エラー検出・修正スクリプト
import { GameEngine } from './lib/gameEngine';
import { useGameState } from './lib/stores/useGameState';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  fixes?: string[];
}

export class ErrorDetector {
  private results: TestResult[] = [];

  // GameEngine の基本機能テスト
  async testGameEngine(): Promise<TestResult> {
    try {
      const gameEngine = new GameEngine();
      const gameState = gameEngine.getGameState();
      
      // 基本状態の確認
      if (!gameState.player) {
        throw new Error('プレイヤーが初期化されていません');
      }
      
      if (!gameState.dungeon || gameState.dungeon.length === 0) {
        throw new Error('ダンジョンが生成されていません');
      }
      
      // 新ゲーム開始テスト
      const newState = gameEngine.startNewGame();
      if (newState.phase !== 'playing') {
        throw new Error('ゲームフェーズが正しく設定されていません');
      }
      
      return { test: 'GameEngine基本機能', passed: true };
    } catch (error) {
      return {
        test: 'GameEngine基本機能',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        fixes: [
          'GameEngineの初期化処理を確認',
          'プレイヤー初期化ロジックを確認',
          'ダンジョン生成ロジックを確認'
        ]
      };
    }
  }

  // プレイヤー移動システムテスト
  async testPlayerMovement(): Promise<TestResult> {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();
      
      const initialPos = { ...gameEngine.getGameState().player.position };
      
      // 有効な移動をテスト
      const directions = ['north', 'south', 'east', 'west'] as const;
      let successfulMoves = 0;
      
      for (const direction of directions) {
        try {
          gameEngine.movePlayer(direction);
          successfulMoves++;
          // 位置を元に戻す（簡易的に）
          gameEngine.getGameState().player.position = { ...initialPos };
        } catch (error) {
          // 壁への移動は正常なエラー
        }
      }
      
      if (successfulMoves === 0) {
        throw new Error('どの方向にも移動できません');
      }
      
      return { test: 'プレイヤー移動システム', passed: true };
    } catch (error) {
      return {
        test: 'プレイヤー移動システム',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        fixes: [
          'movePlayer関数の実装を確認',
          'ダンジョンレイアウトの妥当性を確認',
          '移動判定ロジックを確認'
        ]
      };
    }
  }

  // 魔法システムテスト
  async testMagicSystem(): Promise<TestResult> {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();
      
      const player = gameEngine.getGameState().player;
      
      // 初期魔法の確認
      if (!player.knownSpells || player.knownSpells.length === 0) {
        throw new Error('初期魔法が設定されていません');
      }
      
      // ヒール魔法のテスト
      const initialHp = player.hp;
      if (initialHp < player.maxHp) {
        try {
          gameEngine.castSpell('heal');
          const newHp = gameEngine.getGameState().player.hp;
          if (newHp <= initialHp) {
            throw new Error('ヒール魔法の効果が適用されていません');
          }
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes('MP')) {
            throw error;
          }
        }
      }
      
      return { test: '魔法システム', passed: true };
    } catch (error) {
      return {
        test: '魔法システム',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        fixes: [
          'SpellSystemの初期化を確認',
          '初期魔法の設定を確認',
          '魔法効果の適用ロジックを確認'
        ]
      };
    }
  }

  // アイテム合成システムテスト
  async testCraftingSystem(): Promise<TestResult> {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();
      
      const recipes = gameEngine.getAvailableRecipes();
      if (!recipes || recipes.length === 0) {
        throw new Error('利用可能なレシピがありません');
      }
      
      // レシピの構造確認
      const firstRecipe = recipes[0];
      if (!firstRecipe.id || !firstRecipe.result || !firstRecipe.materials) {
        throw new Error('レシピの構造が不正です');
      }
      
      // 合成可能性チェック
      const craftCheck = gameEngine.canCraftItem(firstRecipe.id);
      if (typeof craftCheck.canCraft !== 'boolean') {
        throw new Error('合成可能性チェックの戻り値が不正です');
      }
      
      return { test: 'アイテム合成システム', passed: true };
    } catch (error) {
      return {
        test: 'アイテム合成システム',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        fixes: [
          'CraftingSystemの初期化を確認',
          'レシピデータの構造を確認',
          '合成判定ロジックを確認'
        ]
      };
    }
  }

  // クエストシステムテスト
  async testQuestSystem(): Promise<TestResult> {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();
      
      const availableQuests = gameEngine.getAvailableQuests();
      if (!availableQuests || availableQuests.length === 0) {
        throw new Error('利用可能なクエストがありません');
      }
      
      // クエストの構造確認
      const firstQuest = availableQuests[0];
      if (!firstQuest.id || !firstQuest.title || !firstQuest.objectives) {
        throw new Error('クエストの構造が不正です');
      }
      
      // クエスト受諾テスト
      const acceptResult = gameEngine.acceptQuest(firstQuest.id);
      if (typeof acceptResult !== 'boolean') {
        throw new Error('クエスト受諾の戻り値が不正です');
      }
      
      if (acceptResult) {
        const activeQuests = gameEngine.getActiveQuests();
        if (!activeQuests.some(q => q.id === firstQuest.id)) {
          throw new Error('受諾したクエストがアクティブになっていません');
        }
      }
      
      return { test: 'クエストシステム', passed: true };
    } catch (error) {
      return {
        test: 'クエストシステム',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        fixes: [
          'QuestSystemの初期化を確認',
          'クエストデータの構造を確認',
          'クエスト受諾ロジックを確認'
        ]
      };
    }
  }

  // セーブ/ロードシステムテスト
  async testSaveLoadSystem(): Promise<TestResult> {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();
      
      const originalState = gameEngine.getGameState();
      const originalLevel = originalState.player.level;
      const originalGold = originalState.player.gold;
      
      // セーブテスト
      gameEngine.saveGame();
      
      // 状態を変更
      gameEngine.getGameState().player.level = originalLevel + 1;
      gameEngine.getGameState().player.gold = originalGold + 100;
      
      // ロードテスト
      const loadedState = gameEngine.loadGame();
      if (!loadedState) {
        throw new Error('セーブデータのロードに失敗しました');
      }
      
      if (loadedState.player.level !== originalLevel || loadedState.player.gold !== originalGold) {
        throw new Error('ロードしたデータが元の状態と一致しません');
      }
      
      return { test: 'セーブ/ロードシステム', passed: true };
    } catch (error) {
      return {
        test: 'セーブ/ロードシステム',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        fixes: [
          'セーブデータの形式を確認',
          'localStorage アクセスを確認',
          'データ復元ロジックを確認'
        ]
      };
    }
  }

  // useGameState フックテスト
  async testUseGameState(): Promise<TestResult> {
    try {
      // フックの存在確認
      if (typeof useGameState !== 'function') {
        throw new Error('useGameState フックが定義されていません');
      }
      
      // 基本的なメソッドの存在確認
      const gameState = useGameState.getState();
      const requiredMethods = [
        'startNewGame',
        'movePlayer',
        'castSpell',
        'craftItem',
        'getAvailableQuests',
        'acceptQuest',
        'saveGame',
        'loadGame'
      ];
      
      for (const method of requiredMethods) {
        if (typeof (gameState as any)[method] !== 'function') {
          throw new Error(`${method} メソッドが定義されていません`);
        }
      }
      
      return { test: 'useGameState フック', passed: true };
    } catch (error) {
      return {
        test: 'useGameState フック',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        fixes: [
          'useGameState の実装を確認',
          'Zustand ストアの設定を確認',
          'インターフェース定義を確認'
        ]
      };
    }
  }

  // 全テストの実行
  async runAllTests(): Promise<TestResult[]> {
    console.log('🔍 FogueHack エラー検出開始...');
    
    const tests = [
      this.testGameEngine,
      this.testPlayerMovement,
      this.testMagicSystem,
      this.testCraftingSystem,
      this.testQuestSystem,
      this.testSaveLoadSystem,
      this.testUseGameState
    ];
    
    this.results = [];
    
    for (const test of tests) {
      try {
        const result = await test.call(this);
        this.results.push(result);
        console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
        if (!result.passed && result.error) {
          console.log(`   エラー: ${result.error}`);
        }
      } catch (error) {
        this.results.push({
          test: 'Unknown Test',
          passed: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return this.results;
  }

  // 修正提案の生成
  generateFixSuggestions(): string[] {
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length === 0) {
      return ['✅ 全テストが成功しました！修正の必要はありません。'];
    }
    
    const suggestions: string[] = ['🔧 修正が必要な項目:'];
    
    failedTests.forEach((test, index) => {
      suggestions.push(`\n${index + 1}. ${test.test}`);
      suggestions.push(`   問題: ${test.error}`);
      if (test.fixes) {
        suggestions.push('   修正案:');
        test.fixes.forEach(fix => {
          suggestions.push(`   - ${fix}`);
        });
      }
    });
    
    return suggestions;
  }

  // テスト結果の表示
  displayResults(): void {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    
    console.log('\n📊 テスト結果サマリー');
    console.log(`合格: ${passedTests}/${totalTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    const suggestions = this.generateFixSuggestions();
    suggestions.forEach(suggestion => console.log(suggestion));
  }
}

// 実行関数
export async function runErrorDetection(): Promise<void> {
  const detector = new ErrorDetector();
  await detector.runAllTests();
  detector.displayResults();
}

// ブラウザ環境での実行
if (typeof window !== 'undefined') {
  (window as any).runErrorDetection = runErrorDetection;
}