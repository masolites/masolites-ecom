#!/bin/bash
# Production Deployment Script

# 1. Set environment variables
echo "Setting up environment variables..."
export NODE_ENV=production
export MONGO_URI="mongodb+srv://prod_user:<password>@cluster.mongodb.net/weeyan_prod"
export BSC_NODE_URL="https://bsc-dataseed.binance.org"
export FLW_PUBLIC_KEY="FLWPUBK-<PROD-KEY>"
export FLW_SECRET_KEY="FLWSECK-<PROD-KEY>"
export JWT_SECRET="<strong_prod_secret>"

# 2. Install dependencies
echo "Installing dependencies..."
npm install --production
cd client && npm install --production && cd ..

# 3. Build React app
echo "Building frontend..."
cd client && npm run build && cd ..

# 4. Configure reverse proxy
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/weeyan > /dev/null <<EOF
server {
    listen 80;
    server_name weeyan.com www.weeyan.com;
    
    location / {
        root /home/ubuntu/weeyan/client/build;
        try_files \$uri /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

# 5. Enable firewall
echo "Configuring firewall..."
sudo ufw allow 80
sudo ufw allow 22
sudo ufw enable

# 6. Setup process management
echo "Setting up PM2..."
sudo npm install -g pm2
pm2 start server/index.js --name "weeyan-backend"
pm2 save
pm2 startup

echo "Deployment setup complete!"
