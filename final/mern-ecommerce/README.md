# Storehouse — MERN E-Commerce Store

Full-stack e-commerce app: React + Redux Toolkit frontend, Node/Express/MongoDB backend, JWT auth.

## Folder Structure

```
mern-ecommerce/
├── backend/
│   ├── config/db.js
│   ├── controllers/ (user, product, order)
│   ├── middleware/ (auth, error, upload)
│   ├── models/ (User, Product, Order)
│   ├── routes/ (user, product, order, upload)
│   ├── uploads/            <- product images uploaded via admin panel
│   ├── seeder.js           <- test data
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── public/index.html
    └── src/
        ├── app/store.js
        ├── features/ (auth, products, cart, wishlist, orders, users) — Redux slices
        ├── components/ (Navbar, Footer, ProductCard, routes guards, etc.)
        ├── pages/ (Home, Shop, Product, Cart, Checkout flow, Orders, Profile)
        ├── pages/admin/ (Dashboard, Products, Orders, Users)
        ├── utils/axiosConfig.js
        ├── App.js / App.css
        └── index.js
```

## Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## MongoDB

Run MongoDB locally, or use Atlas:

```bash
# Local (after installing MongoDB Community Server)
mongod
```

## Environment Variables

Copy `.env.example` → `.env` in both folders and fill in values.

**backend/.env**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_ecommerce
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Seed Test Data (test accounts + sample products)

```bash
cd backend
npm run seed
```

## Run

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm start
```

## Test Accounts (after seeding)

| Role  | Email               | Password  |
|-------|----------------------|-----------|
| Admin | admin@example.com    | admin123  |
| User  | john@example.com     | john1234  |

## API Endpoints

**Users**
- `POST /api/users` — register
- `POST /api/users/login` — login
- `GET /api/users/profile` — get own profile (auth)
- `PUT /api/users/profile` — update own profile (auth)
- `GET /api/users` — list all users (admin)
- `GET/PUT/DELETE /api/users/:id` — manage a user (admin)

**Products**
- `GET /api/products` — list (supports `keyword`, `category`, `minPrice`, `maxPrice`, `minRating`, `sort`, `page`, `limit`)
- `GET /api/products/categories` — distinct categories
- `GET /api/products/top` — top rated
- `GET /api/products/:id` — single product
- `POST /api/products` — create (admin)
- `PUT /api/products/:id` — update (admin)
- `DELETE /api/products/:id` — delete (admin)
- `POST /api/products/:id/reviews` — add review (auth)

**Orders**
- `POST /api/orders` — create order (auth)
- `GET /api/orders/myorders` — logged-in user's orders (auth)
- `GET /api/orders/:id` — order details (auth, owner or admin)
- `PUT /api/orders/:id/pay` — mark paid (auth)
- `GET /api/orders` — all orders (admin)
- `PUT /api/orders/:id/status` — update status (admin)
- `GET /api/orders/stats` — dashboard stats (admin)

**Upload**
- `POST /api/upload` — upload product image, multipart/form-data, field name `image` (admin)

## Deployment Steps

1. **Backend**: deploy to Render/Railway/Heroku. Set env vars (`MONGO_URI` from Atlas, `JWT_SECRET`, `CLIENT_URL` = your deployed frontend URL). Ensure `uploads/` is either persisted via a volume or switched to cloud storage (S3/Cloudinary) for production.
2. **Frontend**: `npm run build` in `frontend/`, deploy the `build/` folder to Vercel/Netlify. Set `REACT_APP_API_URL` to your deployed backend URL + `/api`.
3. **Database**: create a MongoDB Atlas cluster, whitelist your backend's IP (or `0.0.0.0/0` for simplicity), and use that connection string as `MONGO_URI`.
4. **CORS**: confirm `CLIENT_URL` in backend `.env` matches your deployed frontend origin exactly (including protocol).
