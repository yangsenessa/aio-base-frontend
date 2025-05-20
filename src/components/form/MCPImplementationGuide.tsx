
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, FileCode, Terminal, Package } from 'lucide-react';

const MCPImplementationGuide: React.FC = () => {
  return (
    <Card className="mb-8 border-blue-200 bg-blue-50/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Image MCP Implementation Guide</CardTitle>
        <CardDescription>
          Follow these steps to adapt the MCP Image template to your own implementation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="structure">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="structure" className="flex-1"><FileCode size={16} className="mr-2" /> Project Structure</TabsTrigger>
            <TabsTrigger value="commands" className="flex-1"><Terminal size={16} className="mr-2" /> Build Commands</TabsTrigger>
            <TabsTrigger value="dependencies" className="flex-1"><Package size={16} className="mr-2" /> Dependencies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structure" className="space-y-4">
            <div className="bg-slate-800 text-slate-100 rounded-md p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`mcp_image
├── LICENSE           # MIT License file
├── README.md         # Main documentation
└── mcp_image_generate
    ├── README.md     # Service specific documentation
    ├── build.py      # Build script for executables
    ├── build_exec.sh # Shell script to build executables
    ├── image_service.py  # Core service implementation
    ├── mcp_server.py # MCP protocol server implementation
    ├── requirements.txt  # Python dependencies
    ├── stdio_server.py   # Standard IO server implementation
    ├── test_generate.sh  # Test script for image generation
    ├── test_generate_exec.sh  # Test script for executable
    └── test_help.sh  # Test script for help command`}
              </pre>
            </div>
            
            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                The key files to focus on are <code className="bg-amber-100 px-1 rounded">image_service.py</code> (core logic), 
                <code className="bg-amber-100 px-1 rounded">mcp_server.py</code> (MCP implementation), and 
                <code className="bg-amber-100 px-1 rounded">stdio_server.py</code> (standard IO interface).
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="commands" className="space-y-4">
            <div className="bg-slate-800 text-green-400 rounded-md p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`# Install dependencies
pip install -r requirements.txt

# Build stdio mode executable
python build.py
# or
./build_exec.sh

# Build MCP mode executable
python build.py mcp
# or
./build_exec.sh mcp

# Test help method
./test_help.sh

# Test image generation
./test_generate.sh
# or with executable
./test_generate_exec.sh`}
              </pre>
            </div>
            
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription>
                After building, you'll find executables in the <code className="bg-green-100 px-1 rounded">dist/</code> directory. 
                Use <code className="bg-green-100 px-1 rounded">image_stdio</code> for standard IO mode or 
                <code className="bg-green-100 px-1 rounded">image_mcp</code> for MCP protocol mode.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="dependencies" className="space-y-4">
            <div className="bg-slate-800 text-blue-300 rounded-md p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`python-dotenv>=1.0.1,<2.0.0
requests>=2.26.0,<3.0.0
pydantic>=2.10.6,<3.0.0
mcp==1.6.0
PyInstaller>=4.5.1,<5.0.0
pytest>=6.2.5,<7.0.0
pillow>=9.2.0,<11.0.0
modelcontextprotocol>=0.1.0,<1.0.0
python-multipart>=0.0.5,<1.0.0`}
              </pre>
            </div>
            
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                The <code className="bg-blue-100 px-1 rounded">mcp</code> package is essential for implementing the Model Context Protocol.
                Make sure to use compatible versions of all dependencies to avoid build issues.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-blue-100/50 text-blue-700 text-sm rounded-b-lg p-4">
        <div className="flex gap-2 items-start">
          <Info size={18} />
          <p>
            To implement your own MCP, focus on modifying the <code className="bg-blue-200 px-1 rounded">image_service.py</code> file
            to integrate with your preferred image processing API or library, then update the server implementations to expose your methods.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MCPImplementationGuide;
