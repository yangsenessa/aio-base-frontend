
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp, Github, Globe, Save } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { mcpServerFormSchema, type MCPServerFormValues } from '@/types/agent';
import FileUploader from '@/components/form/FileUploader';
import { useToast } from '@/components/ui/use-toast';
import { submitMCPServer } from '@/services/apiService';
import { useNavigate } from 'react-router-dom';
import { MCPServerSubmission } from '@/services/mockApi';

const AddMCPServer = () => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [serverFile, setServerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<MCPServerFormValues>({
    resolver: zodResolver(mcpServerFormSchema),
    defaultValues: {
      name: '',
      description: '',
      author: '',
      implementation: 'docker',
      gitRepo: '',
      homepage: '',
      entities: '',
      relations: '',
      observations: '',
    }
  });
  
  const onSubmit = async (data: MCPServerFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Form data:', data);
      console.log('Server file:', serverFile);
      
      // Ensure we have all required fields before submitting
      const serverSubmission: MCPServerSubmission = {
        name: data.name,
        description: data.description,
        author: data.author,
        implementation: data.implementation,
        gitRepo: data.gitRepo,
        homepage: data.homepage,
        entities: data.entities,
        relations: data.relations,
        observations: data.observations
      };
      
      // Submit the data to the backend
      const response = await submitMCPServer(serverSubmission, serverFile || undefined);
      
      console.log('Submission response:', response);
      
      if (response.success) {
        toast({
          title: "MCP Server submitted",
          description: `Your MCP Server has been submitted for review with ID: ${response.id}`,
          variant: "default",
        });
        
        // Redirect to the MCP store page after a short delay
        setTimeout(() => {
          navigate('/mcp-store');
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error submitting MCP server:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit MCP server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateServerFile = (file: File) => {
    // Check file extension
    const validExtensions = ['.js', '.json', '.ts'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      return { valid: false, message: 'Only .js, .json, and .ts files are allowed' };
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, message: 'File size must be less than 5MB' };
    }
    
    return { valid: true };
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add Your MCP Server</h1>
        <p className="text-muted-foreground">
          Submit your MCP server to be featured in the MCP Store
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>MCP Server Information</CardTitle>
          <CardDescription>
            Please provide the details of your MCP server implementation
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <Tabs defaultValue="basic" value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="implementation">Implementation</TabsTrigger>
                  <TabsTrigger value="api">API Examples</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter MCP server name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what your MCP server does" 
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name or organization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gitRepo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Repository</FormLabel>
                        <FormControl>
                          <div className="flex items-center relative">
                            <Github className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="https://github.com/username/repo" 
                              className="pl-9"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homepage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Homepage URL</FormLabel>
                        <FormControl>
                          <div className="flex items-center relative">
                            <Globe className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="https://example.com/my-project" 
                              className="pl-9"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button 
                      type="button"
                      onClick={() => setCurrentTab('implementation')}
                      className="ml-auto"
                    >
                      Next: Implementation
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="implementation" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="implementation"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Implementation Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-4"
                          >
                            <div className="flex items-start space-x-3 p-4 border rounded-md hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="docker" id="docker" />
                              <div className="grid gap-1">
                                <Label htmlFor="docker" className="font-semibold">Docker</Label>
                                <p className="text-sm text-muted-foreground">
                                  Run your MCP server in a Docker container
                                </p>
                                <div className="mt-2 text-xs bg-muted p-2 rounded-md font-mono">
                                  <pre>
                                    {`{
  "mcpServers": {
    "memory": {
      "command": "docker",
      "args": ["run", "-i", "-v", "claude-memory:/app/dist", "--rm", "mcp/memory"]
    }
  }
}`}
                                  </pre>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-4 border rounded-md hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="npx" id="npx" />
                              <div className="grid gap-1">
                                <Label htmlFor="npx" className="font-semibold">NPX Standard</Label>
                                <p className="text-sm text-muted-foreground">
                                  Run your MCP server using NPX with standard configuration
                                </p>
                                <div className="mt-2 text-xs bg-muted p-2 rounded-md font-mono">
                                  <pre>
                                    {`{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}`}
                                  </pre>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-4 border rounded-md hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="npx-custom" id="npx-custom" />
                              <div className="grid gap-1">
                                <Label htmlFor="npx-custom" className="font-semibold">NPX Custom</Label>
                                <p className="text-sm text-muted-foreground">
                                  Run your MCP server using NPX with custom environment variables
                                </p>
                                <div className="mt-2 text-xs bg-muted p-2 rounded-md font-mono">
                                  <pre>
                                    {`{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "env": {
        "MEMORY_FILE_PATH": "/path/to/custom/memory.json"
      }
    }
  }
}`}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FileUploader
                    id="server-file-upload"
                    label="Upload Server Implementation File"
                    accept=".js,.json,.ts"
                    buttonText="Select Server File"
                    noFileText="No file selected"
                    onChange={setServerFile}
                    validateFile={validateServerFile}
                    currentFile={serverFile}
                  />

                  <div className="pt-4 flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCurrentTab('basic')}
                    >
                      Back
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setCurrentTab('api')}
                    >
                      Next: API Examples
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="api" className="space-y-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">API Examples</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Provide examples of how to use your MCP server's API. Include JSON for entity, relation, and observation examples.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="entities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entities Example</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={`{
  "name": "John_Smith",
  "entityType": "person",
  "observations": ["Speaks fluent Spanish"]
}`}
                            className="min-h-24 font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relations Example</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={`{
  "from": "John_Smith",
  "to": "Anthropic",
  "relationType": "works_at"
}`}
                            className="min-h-24 font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observations Example</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={`{
  "entityName": "John_Smith",
  "observations": [
    "Speaks fluent Spanish",
    "Graduated in 2019",
    "Prefers morning meetings"
  ]
}`}
                            className="min-h-24 font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCurrentTab('implementation')}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Submitting...' : 'Submit MCP Server'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </form>
        </Form>

        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            By submitting, you agree to our terms and conditions
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddMCPServer;
