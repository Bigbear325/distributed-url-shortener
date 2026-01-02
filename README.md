# Distributed URL Shortener (TinyURL)

A production-grade, distributed URL shortening service built to demonstrate system design concepts for Senior Software Engineer interviews.

## 🚀 Features

- **Distributed ID Generation**: Uses a Redis-based block allocator strategy to ensure unique, non-colliding short codes without heavy database write locks.
- **High Performance**:
  - **Reads**: Heavily cached via Redis (Look-aside cache pattern) to handle high read-to-write ratios.
  - **Writes**: Optimized via block allocation to minimize coordination.
- **Scalable Architecture**: Stateless backend, horizontally scalable.
- **Premium UI**: Modern, responsive React frontend with glassmorphism design.

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Persistent storage)
- **Cache / Counter**: Redis (Caching hot URLs + Block Counter)
- **Frontend**: React, Vite, Vanilla CSS (CSS Modules)
- **Infrastructure**: Docker Compose

## 🏗 Architecture Definitions

### ID Generation Strategy
We use a **Distributed Block Allocator** approach:
1. A global counter is maintained in Redis.
2. Application instances fetch a "block" of IDs (e.g., 1000 IDs) by atomically incrementing the Redis counter.
3. The instance consumes this block in-memory to generate short codes without further network calls until the block is exhausted.
4. IDs are converted to Base62 strings for the short URL.

### Data Model
**Postgres `urls` Table**:
- `id` (PK): BigInt (Generated from the block allocator)
- `short_code`: String (Indexed, Unique)
- `long_url`: Text
- `expires_at`: Timestamp (Optional)

## 🏃‍♂️ Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bigbear325/distributed-url-shortener.git
   cd distributed-url-shortener
   ```

2. **Start Infrastructure (Postgres & Redis)**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Visit the App**
   Open http://localhost:5173 to create short URLs.

## 🧪 API Endpoints

- `POST /api/v1/shorten`
  - Body: `{ "long_url": "https://google.com", "custom_alias": "optional" }`
- `GET /:shortCode`
  - Redirects to the original URL (302 Found)

## 📝 License

MIT
