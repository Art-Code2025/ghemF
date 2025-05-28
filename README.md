# مواسم - متجر إلكتروني

## 🚀 Deployment Instructions

### Frontend (Netlify)
1. Upload the `dist/` folder to Netlify
2. Or connect your GitHub repository
3. Environment variables are already configured in `netlify.toml`

### Backend (Render)
- Already deployed at: `https://ghemb.onrender.com`
- MongoDB Atlas connected
- CORS configured for Netlify

## 🔧 Environment Variables

### Production (Netlify)
```
VITE_API_BASE_URL=https://ghemb.onrender.com
VITE_NODE_ENV=production
```

### Development (Local)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_NODE_ENV=development
```

## 📦 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## 🌐 Live URLs

- **Frontend (Netlify):** https://ghemf.netlify.app
- **Backend (Render):** https://ghemb.onrender.com
- **Database:** MongoDB Atlas

## ✅ Status

- ✅ Frontend: Ready for deployment
- ✅ Backend: Deployed and running
- ✅ Database: Connected
- ✅ CORS: Configured
- ✅ Environment Variables: Set
- ✅ Build: Successful
