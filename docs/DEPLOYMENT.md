# 🚀 FogueHack デプロイメントガイド

## 概要

FogueHackのデプロイメント手順とベストプラクティスを説明します。開発環境から本番環境まで、段階的なデプロイメント戦略を提供します。

## 🏗️ デプロイメント アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ localhost:5000  │ -> │ staging.app.com │ -> │ foguehack.com   │
│                 │    │                 │    │                 │
│ • Hot reload    │    │ • CI/CD testing │    │ • Load balancer │
│ • Dev database  │    │ • Staging DB    │    │ • Prod database │
│ • Debug mode    │    │ • Error tracking│    │ • Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 前提条件

### 必要なツール

- **Node.js**: 18以上
- **npm**: 9以上
- **Git**: 最新版
- **Docker**: (オプション) コンテナデプロイ用

### 環境変数

```bash
# .env.example を参考に設定
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/foguehack
```

## 🔧 ローカル開発環境

### セットアップ

```bash
# 1. リポジトリクローン
git clone https://github.com/yourusername/FogueHack.git
cd FogueHack

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env
# .env ファイルを編集

# 4. 開発サーバー起動
npm run dev
```

### 開発コマンド

```bash
# 開発サーバー（ホットリロード有効）
npm run dev

# TypeScript型チェック
npm run check

# Lint実行
npm run lint

# フォーマット実行
npm run format

# フォーマットチェック
npm run format:check

# テストコンソール
# http://localhost:5000/test-console.html
```

## 🏗️ ビルドプロセス

### 本番ビルド

```bash
# 1. クリーンビルド
rm -rf dist/

# 2. ビルド実行
npm run build

# 結果確認
# dist/
# ├── index.js        # サーバーバンドル
# └── public/         # クライアント静的ファイル
#     ├── index.html
#     ├── assets/
#     └── test-console.html
```

### ビルド検証

```bash
# 本番モードでローカル実行
NODE_ENV=production node dist/index.js

# ブラウザで確認
# http://localhost:5000
```

## 🌐 ステージング環境

### CI/CD パイプライン

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run check

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Build
        run: npm run build

      - name: Test
        run: npm test # 将来実装

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to Staging
        run: |
          # ステージング環境へのデプロイ
          echo "Deploy to staging"

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production
        run: |
          # 本番環境へのデプロイ
          echo "Deploy to production"
```

## 🐳 Docker デプロイメント

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S foguehack -u 1001

# Copy built application
COPY --from=builder --chown=foguehack:nodejs /app/dist ./dist
COPY --from=builder --chown=foguehack:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=foguehack:nodejs /app/package.json ./package.json

USER foguehack

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.js"]
```

### Docker Compose (開発用)

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:password@db:5432/foguehack
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=foguehack
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Docker 運用コマンド

```bash
# ビルドと起動
docker-compose up --build

# バックグラウンド実行
docker-compose up -d

# ログ確認
docker-compose logs -f app

# 停止
docker-compose down

# データも削除
docker-compose down -v
```

## ☁️ クラウドデプロイメント

### Vercel (推奨)

```bash
# 1. Vercel CLI インストール
npm i -g vercel

# 2. ログイン
vercel login

# 3. プロジェクト設定
vercel

# 4. 環境変数設定
vercel env add NODE_ENV
vercel env add PORT
vercel env add DATABASE_URL

# 5. デプロイ
vercel --prod
```

#### vercel.json 設定

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "dist/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "dist/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Netlify

```bash
# 1. Netlify CLI インストール
npm i -g netlify-cli

# 2. ログイン
netlify login

# 3. サイト作成
netlify init

# 4. デプロイ
netlify deploy --prod
```

#### netlify.toml 設定

```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Railway

```bash
# 1. Railway CLI インストール
npm i -g @railway/cli

# 2. ログイン
railway login

# 3. プロジェクト作成
railway init

# 4. 環境変数設定
railway variables set NODE_ENV=production
railway variables set PORT=5000

# 5. デプロイ
railway up
```

## 🗄️ データベース設定

### PostgreSQL (本番推奨)

```bash
# 1. データベース作成
createdb foguehack

# 2. マイグレーション実行
npm run db:push

# 3. 接続確認
psql postgresql://user:password@localhost:5432/foguehack
```

### マネージドデータベース

#### Supabase

```bash
# 1. プロジェクト作成
# https://supabase.com でプロジェクト作成

# 2. 接続文字列取得
# DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# 3. 環境変数設定
export DATABASE_URL="postgresql://postgres:..."
```

#### PlanetScale

```bash
# 1. ブランチ作成
pscale branch create foguehack development

# 2. 接続文字列取得
pscale connect foguehack development --port 3309

# 3. マイグレーション
npm run db:push
```

## 📊 監視とログ

### ヘルスチェック

```typescript
// server/routes.ts
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  });
});
```

### ログ設定

```typescript
// 構造化ログ
const logger = {
  info: (message: string, meta?: object) => {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      }),
    );
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: error?.stack,
        timestamp: new Date().toISOString(),
        ...meta,
      }),
    );
  },
};
```

### エラートラッキング

```bash
# Sentry 設定例
npm install @sentry/node @sentry/tracing
```

```typescript
// server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

## 🔒 セキュリティ設定

### 環境変数管理

```bash
# 本番環境での機密情報管理
# .env は絶対にコミットしない

# 必要な環境変数
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secret-key
JWT_SECRET=jwt-secret-key
```

### セキュリティヘッダー

```typescript
// server/index.ts で設定済み
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }),
);
```

## 🚨 トラブルシューティング

### よくある問題

#### ポート競合

```bash
# ポート使用状況確認
lsof -i :5000

# プロセス終了
kill -9 PID

# 別ポート使用
PORT=3000 npm run dev
```

#### ビルドエラー

```bash
# node_modules クリア
rm -rf node_modules package-lock.json
npm install

# TypeScript エラー確認
npm run check

# キャッシュクリア
npm run build -- --force
```

#### データベース接続エラー

```bash
# 接続文字列確認
echo $DATABASE_URL

# データベースサーバー確認
ping database-host

# マイグレーション再実行
npm run db:push
```

### デバッグモード

```bash
# 詳細ログ有効
DEBUG=* npm run dev

# Node.js インスペクター
node --inspect dist/index.js
```

## 📈 パフォーマンス最適化

### 本番最適化チェックリスト

- [ ] Gzip 圧縮有効
- [ ] 静的ファイルキャッシュ設定
- [ ] CDN 使用
- [ ] データベース接続プール
- [ ] 不要な依存関係削除
- [ ] バンドルサイズ最適化

### 監視メトリクス

```typescript
// パフォーマンス監視
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
    });
  });

  next();
});
```

## 🔄 ロールバック戦略

### Git ベースロールバック

```bash
# 前のコミットに戻す
git revert HEAD
git push origin main

# 特定のコミットに戻す
git revert <commit-hash>
```

### Blue-Green デプロイメント

```bash
# 2つの環境を準備
# Blue: 現在の本番
# Green: 新バージョン

# Green に新バージョンデプロイ
# 確認後、トラフィックを Green に切り替え
# 問題があれば即座に Blue に戻す
```

---

**注意**: 本番デプロイ前には必ずステージング環境でのテストを実施してください。
