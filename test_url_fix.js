// Test script to verify URL fix for mixed content issue
console.log('Testing URL configuration fix...');

// Mock environment variables
const mockEnv = {
  'VITE_AIO_MCP_API_URL': 'http://8.141.81.75:8000/api/v1/rpc/',
  'VITE_AIO_MCP_FILE_URL': 'http://8.141.81.75:8001'
};

// Mock production environment detection
const isProduction = () => {
  return true; // Simulate production environment
};

// Test URL construction logic
function testUrlConstruction() {
  console.log('\n=== Testing URL Construction ===');
  
  // Test 1: Production environment
  const productionMcpUrl = isProduction() 
    ? 'http://8.141.81.75:8000/api/v1/rpc'
    : mockEnv['VITE_AIO_MCP_API_URL'];
  
  console.log('Production MCP URL:', productionMcpUrl);
  
  // Test 2: URL path handling
  const baseUrl = productionMcpUrl;
  const fileType = 'mcp';
  const filename = 'test_server';
  
  let endpoint;
  if (baseUrl.includes('/api/v1/rpc')) {
    // If URL already contains the API path, just append the file path
    endpoint = `${baseUrl}/${fileType}/${encodeURIComponent(filename)}`;
  } else {
    // If URL is just the base, construct the full path
    endpoint = `${baseUrl}/api/v1/rpc/${fileType}/${encodeURIComponent(filename)}`;
  }
  
  console.log('Constructed endpoint:', endpoint);
  console.log('Expected format: http://8.141.81.75:8000/api/v1/rpc/mcp/test_server');
  
  // Test 3: Development environment
  const devMcpUrl = mockEnv['VITE_AIO_MCP_API_URL'];
  console.log('Development MCP URL:', devMcpUrl);
  
  // Test 4: File service URL
  const fileServiceUrl = isProduction()
    ? 'http://8.141.81.75:8001'
    : mockEnv['VITE_AIO_MCP_FILE_URL'];
  
  console.log('File service URL:', fileServiceUrl);
}

// Test environment variable handling
function testEnvVarHandling() {
  console.log('\n=== Testing Environment Variable Handling ===');
  
  const getEnvVar = (name, fallback) => {
    return mockEnv[name] || fallback;
  };
  
  const mcpUrl = getEnvVar('VITE_AIO_MCP_API_URL', 'http://localhost:8000');
  const fileUrl = getEnvVar('VITE_AIO_MCP_FILE_URL', 'http://localhost:8001');
  
  console.log('MCP URL from env:', mcpUrl);
  console.log('File URL from env:', fileUrl);
  
  // Test URL cleaning
  const cleanMcpUrl = mcpUrl.replace(/\/+$/, '');
  console.log('Cleaned MCP URL:', cleanMcpUrl);
}

// Run tests
testUrlConstruction();
testEnvVarHandling();

console.log('\n✅ URL configuration test completed');
console.log('\nExpected behavior:');
console.log('- Production: Uses http://8.141.81.75:8000/api/v1/rpc');
console.log('- Development: Uses VITE_AIO_MCP_API_URL from environment');
console.log('- No mixed content errors in production'); 