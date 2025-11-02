# 🌐 FogueHack API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

現在、APIは認証を必要としません。将来的にはJWTベースの認証を実装予定です。

## Endpoints

### Health Check

#### `GET /api/health`

サーバーの稼働状況を確認します。

**Response:**

```json
{
  "ok": true
}
```

**Status Codes:**

- `200` - サーバー正常稼働

---

### Users

#### `POST /api/users`

新しいユーザーを作成します。

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "player1"
}
```

**Status Codes:**

- `201` - ユーザー作成成功
- `400` - 無効なリクエストデータ
- `409` - ユーザー名が既に存在

#### `GET /api/users/:id`

ユーザーIDでユーザー情報を取得します。

**Parameters:**

- `id` (integer) - ユーザーID

**Response:**

```json
{
  "id": 1,
  "username": "player1"
}
```

**Status Codes:**

- `200` - 取得成功
- `400` - 無効なID
- `404` - ユーザーが見つからない

#### `GET /api/users/by-username/:username`

ユーザー名でユーザー情報を取得します。

**Parameters:**

- `username` (string) - ユーザー名

**Response:**

```json
{
  "id": 1,
  "username": "player1"
}
```

**Status Codes:**

- `200` - 取得成功
- `404` - ユーザーが見つからない

## Error Responses

全てのエラーレスポンスは以下の形式です：

```json
{
  "message": "エラーメッセージ"
}
```

## Rate Limiting

- 1分間に100リクエストまで
- 制限に達した場合は `429 Too Many Requests` が返されます

## Future Endpoints (計画中)

### Game Data

- `POST /api/game/save` - ゲームデータの保存
- `GET /api/game/load/:userId` - ゲームデータの読み込み
- `GET /api/leaderboard` - リーダーボード取得
- `POST /api/game/achievements` - 実績の更新

### Multiplayer (将来実装)

- `POST /api/rooms` - ゲームルーム作成
- `GET /api/rooms/:id` - ルーム情報取得
- `POST /api/rooms/:id/join` - ルーム参加
- `WebSocket /api/ws` - リアルタイム通信
