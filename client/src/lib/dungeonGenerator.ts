import { DungeonTile, Position, Room } from './gameTypes';

export const DUNGEON_WIDTH = 80;
export const DUNGEON_HEIGHT = 24;

export class DungeonGenerator {
  private width: number;
  private height: number;
  private rooms: Room[] = [];

  constructor(width: number = DUNGEON_WIDTH, height: number = DUNGEON_HEIGHT) {
    this.width = width;
    this.height = height;
  }

  generateDungeon(): DungeonTile[][] {
    // 全て壁で初期化
    const dungeon: DungeonTile[][] = Array(this.height).fill(null).map(() =>
      Array(this.width).fill(null).map(() => ({
        type: 'wall' as const,
        symbol: '#',
        passable: false,
        color: '#666'
      }))
    );

    // 部屋を生成
    this.rooms = this.generateAdvancedRooms();
    
    // 部屋を掘る
    this.rooms.forEach(room => {
      this.carveAdvancedRoom(dungeon, room);
    });

    // シンプルで確実な接続を作成
    this.connectRoomsReliably(dungeon);

    // 特別な構造を追加
    this.addSpecialFeatures(dungeon);

    // 扉を配置
    this.placeDoors(dungeon);

    // 階段を配置（ボス部屋またはランダムな部屋に）
    this.placeStairsInSpecialRoom(dungeon);

    return dungeon;
  }

  private generateAdvancedRooms(): Room[] {
    const rooms: Room[] = [];
    const maxRooms = 12;
    const minRoomSize = 4;
    const maxRoomSize = 15;
    const roomTypes: Room['type'][] = ['normal', 'treasure', 'boss', 'library', 'prison', 'shrine'];

    // 最初に大きなメイン部屋を作成
    const mainRoom = this.createMainRoom();
    rooms.push(mainRoom);

    for (let i = 0; i < maxRooms - 1; i++) {
      const attempts = 50;
      let roomCreated = false;

      for (let attempt = 0; attempt < attempts && !roomCreated; attempt++) {
        const roomType = this.selectRoomType(rooms, roomTypes);
        const dimensions = this.getRoomDimensions(roomType, minRoomSize, maxRoomSize);
        const position = this.findRoomPosition(dimensions, rooms);

        if (position) {
          const newRoom: Room = {
            x: position.x,
            y: position.y,
            width: dimensions.width,
            height: dimensions.height,
            type: roomType,
            connected: false,
            centerX: position.x + Math.floor(dimensions.width / 2),
            centerY: position.y + Math.floor(dimensions.height / 2)
          };

          rooms.push(newRoom);
          roomCreated = true;
        }
      }
    }

    return rooms;
  }

  private createMainRoom(): Room {
    const width = Math.floor(Math.random() * 8) + 8; // 8-15
    const height = Math.floor(Math.random() * 6) + 6; // 6-11
    const x = Math.floor(this.width / 2 - width / 2);
    const y = Math.floor(this.height / 2 - height / 2);

    return {
      x, y, width, height,
      type: 'normal',
      connected: true,
      centerX: x + Math.floor(width / 2),
      centerY: y + Math.floor(height / 2)
    };
  }

  private selectRoomType(existingRooms: Room[], types: Room['type'][]): Room['type'] {
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = existingRooms.filter(r => r.type === type).length;
      return acc;
    }, {} as Record<Room['type'], number>);

    // 特別な部屋は少なくする
    if (typeCounts.boss === 0 && Math.random() < 0.15) return 'boss';
    if (typeCounts.treasure < 2 && Math.random() < 0.25) return 'treasure';
    if (typeCounts.library < 2 && Math.random() < 0.2) return 'library';
    if (typeCounts.shrine < 1 && Math.random() < 0.1) return 'shrine';
    if (typeCounts.prison < 2 && Math.random() < 0.15) return 'prison';

    return 'normal';
  }

  private getRoomDimensions(type: Room['type'], minSize: number, maxSize: number): {width: number, height: number} {
    switch (type) {
      case 'boss':
        return {
          width: Math.floor(Math.random() * 6) + 10, // 10-15
          height: Math.floor(Math.random() * 4) + 8   // 8-11
        };
      case 'treasure':
        return {
          width: Math.floor(Math.random() * 4) + 6,  // 6-9
          height: Math.floor(Math.random() * 3) + 5   // 5-7
        };
      case 'library':
        return {
          width: Math.floor(Math.random() * 5) + 8,  // 8-12
          height: Math.floor(Math.random() * 3) + 6   // 6-8
        };
      default:
        return {
          width: Math.floor(Math.random() * (maxSize - minSize)) + minSize,
          height: Math.floor(Math.random() * (maxSize - minSize)) + minSize
        };
    }
  }

  private findRoomPosition(dimensions: {width: number, height: number}, existingRooms: Room[]): {x: number, y: number} | null {
    const attempts = 100;
    
    for (let i = 0; i < attempts; i++) {
      const x = Math.floor(Math.random() * (this.width - dimensions.width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - dimensions.height - 2)) + 1;
      
      const newRoom = { x, y, width: dimensions.width, height: dimensions.height };
      
      let overlaps = false;
      for (const room of existingRooms) {
        if (this.roomsOverlap(newRoom, room)) {
          overlaps = true;
          break;
        }
      }
      
      if (!overlaps) {
        return { x, y };
      }
    }
    
    return null;
  }

  private roomsOverlap(room1: any, room2: any): boolean {
    return (
      room1.x < room2.x + room2.width + 1 &&
      room1.x + room1.width + 1 > room2.x &&
      room1.y < room2.y + room2.height + 1 &&
      room1.y + room1.height + 1 > room2.y
    );
  }

  private carveAdvancedRoom(dungeon: DungeonTile[][], room: Room): void {
    const floorTile = this.getFloorTileForRoom(room);
    
    // 基本的な床を作成
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          dungeon[y][x] = { ...floorTile };
        }
      }
    }

    // 部屋の種類に応じた特別な装飾を追加
    this.addRoomSpecialFeatures(dungeon, room);
  }

  private getFloorTileForRoom(room: Room): DungeonTile {
    switch (room.type) {
      case 'treasure':
        return {
          type: 'floor',
          symbol: '.',
          passable: true,
          color: '#FFD700'
        };
      case 'boss':
        return {
          type: 'floor',
          symbol: '.',
          passable: true,
          color: '#8B0000'
        };
      case 'library':
        return {
          type: 'floor',
          symbol: '.',
          passable: true,
          color: '#DEB887'
        };
      case 'shrine':
        return {
          type: 'floor',
          symbol: '.',
          passable: true,
          color: '#E6E6FA'
        };
      case 'prison':
        return {
          type: 'floor',
          symbol: '.',
          passable: true,
          color: '#2F4F4F'
        };
      default:
        return {
          type: 'floor',
          symbol: '.',
          passable: true,
          color: '#8B7355'
        };
    }
  }

  private addRoomSpecialFeatures(dungeon: DungeonTile[][], room: Room): void {
    switch (room.type) {
      case 'library':
        this.addLibraryFeatures(dungeon, room);
        break;
      case 'treasure':
        this.addTreasureFeatures(dungeon, room);
        break;
      case 'boss':
        this.addBossFeatures(dungeon, room);
        break;
      case 'shrine':
        this.addShrineFeatures(dungeon, room);
        break;
      case 'prison':
        this.addPrisonFeatures(dungeon, room);
        break;
    }
  }

  private addLibraryFeatures(dungeon: DungeonTile[][], room: Room): void {
    // 本棚を壁際に配置
    for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
      if (Math.random() < 0.4) {
        dungeon[room.y + 1][x] = {
          type: 'pillar',
          symbol: '♦',
          passable: false,
          color: '#8B4513'
        };
      }
    }
  }

  private addTreasureFeatures(dungeon: DungeonTile[][], room: Room): void {
    // 宝箱を中央に配置
    const centerX = room.centerX;
    const centerY = room.centerY;
    
    if (centerX >= 0 && centerX < this.width && centerY >= 0 && centerY < this.height) {
      dungeon[centerY][centerX] = {
        type: 'chest',
        symbol: '□',
        passable: true,
        color: '#FFD700',
        special: true
      };
    }
  }

  private addBossFeatures(dungeon: DungeonTile[][], room: Room): void {
    // 柱を四隅に配置
    const positions = [
      { x: room.x + 2, y: room.y + 2 },
      { x: room.x + room.width - 3, y: room.y + 2 },
      { x: room.x + 2, y: room.y + room.height - 3 },
      { x: room.x + room.width - 3, y: room.y + room.height - 3 }
    ];

    positions.forEach(pos => {
      if (pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height) {
        dungeon[pos.y][pos.x] = {
          type: 'pillar',
          symbol: '♠',
          passable: false,
          color: '#8B0000'
        };
      }
    });
  }

  private addShrineFeatures(dungeon: DungeonTile[][], room: Room): void {
    // 祭壇を中央に配置
    dungeon[room.centerY][room.centerX] = {
      type: 'pillar',
      symbol: '†',
      passable: false,
      color: '#E6E6FA',
      special: true
    };
  }

  private addPrisonFeatures(dungeon: DungeonTile[][], room: Room): void {
    // 格子を追加
    for (let x = room.x + 2; x < room.x + room.width - 2; x += 2) {
      for (let y = room.y + 2; y < room.y + room.height - 2; y += 2) {
        if (Math.random() < 0.3) {
          dungeon[y][x] = {
            type: 'pillar',
            symbol: '‡',
            passable: false,
            color: '#2F4F4F'
          };
        }
      }
    }
  }

  private connectRoomsReliably(dungeon: DungeonTile[][]): void {
    if (this.rooms.length <= 1) return;

    // すべての部屋を順番に接続（確実性を優先）
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const roomA = this.rooms[i];
      const roomB = this.rooms[i + 1];
      this.createSimpleConnection(dungeon, roomA, roomB);
    }

    // 追加で循環接続を作成
    if (this.rooms.length > 2) {
      const lastRoom = this.rooms[this.rooms.length - 1];
      const firstRoom = this.rooms[0];
      this.createSimpleConnection(dungeon, lastRoom, firstRoom);
    }

    // 接続性を検証し、必要に応じて修正
    this.ensureAllConnected(dungeon);
  }

  private createSimpleConnection(dungeon: DungeonTile[][], roomA: Room, roomB: Room): void {
    const startX = roomA.centerX;
    const startY = roomA.centerY;
    const endX = roomB.centerX;
    const endY = roomB.centerY;

    // L字型の確実な接続
    let currentX = startX;
    let currentY = startY;

    // 水平移動
    while (currentX !== endX) {
      this.carveFloor(dungeon, currentX, currentY);
      currentX += currentX < endX ? 1 : -1;
    }

    // 垂直移動
    while (currentY !== endY) {
      this.carveFloor(dungeon, currentX, currentY);
      currentY += currentY < endY ? 1 : -1;
    }

    // 終点も床にする
    this.carveFloor(dungeon, currentX, currentY);
  }

  private carveFloor(dungeon: DungeonTile[][], x: number, y: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      // 特別なタイル（宝箱、祭壇など）は保護
      const currentTile = dungeon[y][x];
      if (currentTile.type === 'wall' || (currentTile.type === 'floor' && !currentTile.special)) {
        dungeon[y][x] = {
          type: 'floor',
          symbol: '.',
          passable: true,
          color: '#696969'
        };
      }
    }
  }

  private ensureAllConnected(dungeon: DungeonTile[][]): void {
    // フラッドフィルで到達可能性をチェック
    const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    const startRoom = this.rooms[0];
    
    if (!startRoom) return;
    
    this.floodFill(dungeon, visited, startRoom.centerX, startRoom.centerY);
    
    // 到達不可能な部屋を強制接続
    for (const room of this.rooms) {
      if (!visited[room.centerY][room.centerX]) {
        this.createSimpleConnection(dungeon, startRoom, room);
      }
    }
  }

  private floodFill(dungeon: DungeonTile[][], visited: boolean[][], x: number, y: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height || visited[y][x] || !dungeon[y][x].passable) {
      return;
    }
    
    visited[y][x] = true;
    
    // 4方向に拡散
    this.floodFill(dungeon, visited, x + 1, y);
    this.floodFill(dungeon, visited, x - 1, y);
    this.floodFill(dungeon, visited, x, y + 1);
    this.floodFill(dungeon, visited, x, y - 1);
  }

  private addSpecialFeatures(dungeon: DungeonTile[][]): void {
    // 水やマグマなどの環境要素を追加
    this.addEnvironmentalHazards(dungeon);
    
    // トラップを配置
    this.addTraps(dungeon);
    
    // 装飾的な柱を追加
    this.addDecorativePillars(dungeon);
  }

  private addEnvironmentalHazards(dungeon: DungeonTile[][]): void {
    const hazardCount = Math.floor(this.rooms.length * 0.2);
    
    for (let i = 0; i < hazardCount; i++) {
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const hazardType = Math.random() < 0.5 ? 'water' : 'lava';
      
      // ランダムな位置に小さな水たまりやマグマだまりを作成
      const startX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
      const startY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
      const size = Math.floor(Math.random() * 3) + 1;
      
      for (let y = startY; y < startY + size && y < room.y + room.height - 1; y++) {
        for (let x = startX; x < startX + size && x < room.x + room.width - 1; x++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            dungeon[y][x] = {
              type: hazardType,
              symbol: hazardType === 'water' ? '~' : '^',
              passable: hazardType === 'water',
              color: hazardType === 'water' ? '#4169E1' : '#FF4500'
            };
          }
        }
      }
    }
  }

  private addTraps(dungeon: DungeonTile[][]): void {
    const trapCount = Math.floor(this.rooms.length * 0.3);
    
    for (let i = 0; i < trapCount; i++) {
      // 廊下にトラップを配置
      let attempts = 50;
      while (attempts > 0) {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        
        if (dungeon[y][x].type === 'floor' && !dungeon[y][x].special && Math.random() < 0.1) {
          dungeon[y][x] = {
            type: 'trap',
            symbol: '.',
            passable: true,
            color: '#8B7355',
            special: true
          };
          break;
        }
        attempts--;
      }
    }
  }

  private addDecorativePillars(dungeon: DungeonTile[][]): void {
    // 大きな部屋に装飾的な柱を追加
    this.rooms.forEach(room => {
      if (room.width > 8 && room.height > 6 && Math.random() < 0.4) {
        const pillarX = room.centerX;
        const pillarY = room.centerY;
        
        if (pillarX >= 0 && pillarX < this.width && pillarY >= 0 && pillarY < this.height) {
          dungeon[pillarY][pillarX] = {
            type: 'pillar',
            symbol: 'O',
            passable: false,
            color: '#A9A9A9'
          };
        }
      }
    });
  }

  private placeDoors(dungeon: DungeonTile[][]): void {
    // 部屋の入り口に扉を配置
    this.rooms.forEach(room => {
      const doorPositions = this.findDoorPositions(dungeon, room);
      
      doorPositions.forEach(pos => {
        if (Math.random() < 0.3) { // 30%の確率で扉を配置
          dungeon[pos.y][pos.x] = {
            type: 'door',
            symbol: '+',
            passable: true,
            color: '#8B4513'
          };
        }
      });
    });
  }

  private findDoorPositions(dungeon: DungeonTile[][], room: Room): Position[] {
    const doorPositions: Position[] = [];
    
    // 部屋の境界をチェック
    for (let x = room.x; x < room.x + room.width; x++) {
      // 上の壁
      if (room.y > 0 && dungeon[room.y - 1][x].type === 'floor') {
        doorPositions.push({ x, y: room.y });
      }
      // 下の壁
      if (room.y + room.height < this.height && dungeon[room.y + room.height][x].type === 'floor') {
        doorPositions.push({ x, y: room.y + room.height - 1 });
      }
    }
    
    for (let y = room.y; y < room.y + room.height; y++) {
      // 左の壁
      if (room.x > 0 && dungeon[y][room.x - 1].type === 'floor') {
        doorPositions.push({ x: room.x, y });
      }
      // 右の壁
      if (room.x + room.width < this.width && dungeon[y][room.x + room.width].type === 'floor') {
        doorPositions.push({ x: room.x + room.width - 1, y });
      }
    }
    
    return doorPositions;
  }

  private placeStairsInSpecialRoom(dungeon: DungeonTile[][]): void {
    // ボス部屋があればそこに、なければランダムな部屋に階段を配置
    let stairRoom = this.rooms.find(room => room.type === 'boss');
    
    if (!stairRoom) {
      // ボス部屋がない場合は、メイン部屋以外からランダム選択
      const nonMainRooms = this.rooms.filter((_, index) => index !== 0);
      if (nonMainRooms.length > 0) {
        stairRoom = nonMainRooms[Math.floor(Math.random() * nonMainRooms.length)];
      } else {
        stairRoom = this.rooms[0]; // フォールバック
      }
    }
    
    if (stairRoom) {
      // 部屋の隅に階段を配置（中央の装飾を避ける）
      const stairX = stairRoom.x + stairRoom.width - 2;
      const stairY = stairRoom.y + stairRoom.height - 2;
      
      if (stairX >= 0 && stairX < this.width && stairY >= 0 && stairY < this.height) {
        dungeon[stairY][stairX] = {
          type: 'stairs',
          symbol: '>',
          passable: true,
          color: '#FFFF00'
        };
      }
    }
  }

  getRandomFloorPosition(dungeon: DungeonTile[][]): Position {
    const floorTiles: Position[] = [];
    
    for (let y = 0; y < dungeon.length; y++) {
      for (let x = 0; x < dungeon[y].length; x++) {
        if (dungeon[y][x].passable) {
          floorTiles.push({ x, y });
        }
      }
    }

    if (floorTiles.length === 0) {
      return { x: 1, y: 1 }; // フォールバック
    }

    return floorTiles[Math.floor(Math.random() * floorTiles.length)];
  }
}