# Production Environment Deployment Guide

## Mixed Content Issue Solution

### Problem Description
In production environment, the website loads over HTTPS but needs to send requests to HTTP backend services, which causes mixed content errors.

### Environment Configuration
- **Production Application URL**: `https://scswk-paaaa-aaaau-abyaq-cai.icp0.io/`
- **MCP API Service**: `https://8.141.81.75:8000/api/v1/rpc`
- **File Service**: `https://8.141.81.75:8001`

### Solutions

#### Solution 1: Direct Remote Service Usage (Recommended)

We have modified the code to let production environment use remote service addresses directly, instead of through proxy:

```javascript
// Production environment detection
const isProduction = () => {
  return import.meta.env.PROD || window.location.protocol === 'https:';
};

// Production environment uses remote services directly with HTTPS
const MCP_API_URL = isProduction() 
  ? 'https://8.141.81.75:8000/api/v1/rpc'  // Production environment uses remote MCP service with HTTPS
  : 'http://localhost:8000';     // Development environment uses local service

const FILE_SERVICE_URL = isProduction()
  ? 'https://8.141.81.75:8001'   // Production environment uses remote file service with HTTPS
  : 'http://localhost:8001';     // Development environment uses local service
```

#### Solution 2: Configure CORS (Alternative)

If direct access encounters CORS issues, you can configure CORS in the backend service:

```python
# FastAPI CORS configuration example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://scswk-paaaa-aaaau-abyaq-cai.icp0.io",
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 方案2：配置Nginx反向代理

如果您使用Nginx作为Web服务器，可以配置反向代理：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    # SSL配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 前端静态文件
    location / {
        root /path/to/your/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 代理MCP API请求
    location /api/mcp/ {
        proxy_pass http://8.141.81.75:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 代理文件服务请求
    location /api/files/ {
        proxy_pass http://8.141.81.75:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Solution 3: Use Apache Proxy

If you use Apache:

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    
    # SSL configuration
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    # Frontend static files
    DocumentRoot /path/to/your/frontend/dist
    
    # Proxy MCP API requests
    ProxyPass /api/mcp/ https://8.141.81.75:8000/api/v1/rpc/
    ProxyPassReverse /api/mcp/ https://8.141.81.75:8000/api/v1/rpc/
    
    # Proxy file service requests
    ProxyPass /api/files/ https://8.141.81.75:8001/
    ProxyPassReverse /api/files/ https://8.141.81.75:8001/
</VirtualHost>
```

### Environment Variable Configuration

Ensure correct environment variables are set in production:

```bash
# Development environment
VITE_AIO_MCP_API_URL=https://8.141.81.75:8000/api/v1/rpc
VITE_AIO_MCP_FILE_URL=https://8.141.81.75:8001

# Production environment (direct remote service)
# No need to set these variables, code will automatically use remote service addresses
```

### Code Modification Summary

We have modified the following files to support production environment:

1. **vite.config.ts** - Added proxy configuration
2. **apiConfig.ts** - Added production environment detection and remote service paths
3. **ExecFileCommonBuss.ts** - Support production environment
4. **AIOProtocalExecutor.ts** - Support production environment
5. **ApiContext.tsx** - Support production environment
6. **ExecFileUpload.ts** - Support production environment
7. **ImgFileUpload.ts** - Support production environment

### Deployment Steps

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Configure Web Server**:
   - Choose one of the above solutions to configure proxy
   - Ensure SSL certificates are properly configured

3. **Deploy static files**:
   - Deploy the `dist` directory to the web server
   - Ensure all routes point to `index.html`

4. **Testing**:
   - Access your HTTPS website
   - Test MCP functionality to ensure it works properly
   - Check browser console for mixed content errors

### Troubleshooting

1. **If mixed content errors still occur**:
   - Check if proxy configuration is correct
   - Ensure all HTTP requests go through proxy
   - Check CORS configuration

2. **If proxy doesn't work**:
   - Check if backend services are accessible
   - Verify proxy path configuration
   - Check server logs

3. **If file upload fails**:
   - Check file service proxy configuration
   - Verify file service is running properly
   - Check file permissions

### Security Considerations

1. **HTTPS Enforcement**:
   - Ensure all user access is through HTTPS
   - Configure HTTP to HTTPS redirect

2. **Proxy Security**:
   - Limit proxy access IP ranges
   - Configure appropriate request header filtering
   - Monitor proxy access logs

3. **CORS Configuration**:
   - Limit CORS origins in production environment
   - Only allow necessary HTTP methods
   - Configure appropriate request headers 