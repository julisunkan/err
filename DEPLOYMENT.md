# Online Hosting Guide - Business Documents Generator

## Hosting Options

### 1. Replit (Easiest - Free)
**Best for**: Testing, personal use, small teams
- **Cost**: Free tier available
- **Setup**: Already configured!
- **Steps**:
  1. Your app is already running on Replit
  2. Click "Share" button to get public URL
  3. App stays live as long as you're using it
  4. Upgrade to "Always On" for permanent hosting

### 2. Heroku (Popular - Free tier discontinued)
**Best for**: Small to medium applications
- **Cost**: $5-7/month minimum
- **Setup**:
  ```bash
  # Create Procfile
  echo "web: gunicorn main:app" > Procfile
  
  # Deploy
  git init
  git add .
  git commit -m "Initial commit"
  heroku create your-app-name
  git push heroku main
  ```

### 3. Railway (Modern & Simple)
**Best for**: Easy deployment with databases
- **Cost**: $5/month with usage-based pricing
- **Setup**:
  1. Connect GitHub account to Railway
  2. Import your repository
  3. Deploy automatically
  4. Add PostgreSQL database if needed

### 4. Render (Developer-friendly)
**Best for**: Free tier with automatic deployments
- **Cost**: Free tier available, $7/month for paid
- **Setup**:
  1. Connect GitHub repository
  2. Select "Web Service"
  3. Build command: `pip install -r requirements.txt`
  4. Start command: `gunicorn main:app`

### 5. DigitalOcean App Platform
**Best for**: Scalable production apps
- **Cost**: $5/month minimum
- **Features**: Auto-scaling, monitoring, databases

### 6. Vercel (Serverless)
**Best for**: Quick deployments
- **Cost**: Free tier available
- **Note**: May need configuration for Flask apps

## Recommended Setup for Each Platform

### For Heroku/Railway/Render:

1. **Create Procfile**:
   ```
   web: gunicorn --bind 0.0.0.0:$PORT main:app
   ```

2. **Set Environment Variables**:
   ```
   SESSION_SECRET=your-random-secret-key-here
   DATABASE_URL=postgresql://... (if using PostgreSQL)
   ```

3. **Requirements.txt** (already handled):
   ```
   flask==3.1.0
   flask-sqlalchemy==3.1.1
   gunicorn==23.0.0
   psycopg2-binary==2.9.10
   ```

### Database Options

**SQLite (Default)**:
- Works for small apps
- Data stored in file
- May not persist on some platforms

**PostgreSQL (Recommended for production)**:
- Most platforms offer free PostgreSQL
- Better for multiple users
- Data persists reliably

## Step-by-Step: Deploy to Render (Recommended)

### Why Render?
- Free tier available
- Easy GitHub integration
- Automatic deployments
- Built-in database options

### Steps:
1. **Prepare Your Code**:
   - Your app is already configured correctly
   - No additional files needed

2. **Create Render Account**:
   - Go to render.com
   - Sign up with GitHub

3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose your repository

4. **Configure Deployment**:
   - **Name**: business-documents-generator
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app`

5. **Set Environment Variables**:
   - Add `SESSION_SECRET` with a random string
   - Add `DATABASE_URL` if using PostgreSQL

6. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Get your live URL

## Step-by-Step: Deploy to Railway

### Why Railway?
- Very simple setup
- Great free tier
- Easy database integration

### Steps:
1. **Create Railway Account**:
   - Go to railway.app
   - Sign in with GitHub

2. **Create Project**:
   - Click "Deploy from GitHub repo"
   - Select your repository

3. **Configure**:
   - Railway auto-detects Flask
   - Set environment variables in dashboard
   - Add PostgreSQL if needed

4. **Deploy**:
   - Automatic deployment starts
   - Get your live URL from dashboard

## Environment Variables Needed

For any hosting platform, set these:

```bash
SESSION_SECRET=your-very-secure-random-string-here
DATABASE_URL=your-database-connection-string (optional)
```

**Generate SESSION_SECRET**:
```python
import secrets
print(secrets.token_hex(32))
```

## Domain Setup (Optional)

### Custom Domain:
1. Buy domain from registrar (Namecheap, GoDaddy, etc.)
2. Add CNAME record pointing to your hosting platform
3. Configure domain in hosting dashboard
4. Enable SSL (usually automatic)

### Free Subdomains:
- Most platforms provide free subdomains
- Format: `your-app-name.platform-domain.com`

## Cost Comparison

| Platform | Free Tier | Paid Plans | Database |
|----------|-----------|------------|----------|
| Replit | Yes (limited) | $7/month | SQLite |
| Render | Yes | $7/month | PostgreSQL $7/month |
| Railway | $5 credit/month | $5/month | PostgreSQL included |
| Heroku | No | $7/month | PostgreSQL $5/month |
| DigitalOcean | No | $5/month | $15/month |

## Production Checklist

Before going live:
- [ ] Set strong SESSION_SECRET
- [ ] Configure database (PostgreSQL recommended)
- [ ] Test all features
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Add custom domain (optional)
- [ ] Enable SSL (usually automatic)

## Monitoring & Maintenance

### Health Checks:
- Most platforms provide uptime monitoring
- Set up alerts for downtime

### Backups:
- Database backups (automatic on most platforms)
- Export business settings regularly
- Keep code in version control

### Updates:
- Push code changes to GitHub
- Most platforms auto-deploy from main branch
- Test changes before merging

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check requirements.txt
2. **Database Errors**: Verify DATABASE_URL
3. **502 Errors**: Check start command
4. **Static Files**: Ensure proper paths

### Getting Help:
- Check platform documentation
- Review deployment logs
- Test locally first

Your app is production-ready and can be deployed to any of these platforms within minutes!