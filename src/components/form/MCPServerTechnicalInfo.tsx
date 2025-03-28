import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MCPServerFormValues } from '@/types/agent';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Server, Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MCPServerTechnicalInfoProps {
  form: UseFormReturn<MCPServerFormValues>;
}

const MCPServerTechnicalInfo = ({ form }: MCPServerTechnicalInfoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Server className="h-5 w-5" />
          Protocol Configuration
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how your MCP server communicates according to the AIO-MCP protocol
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Communication Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stdio" id="stdio" />
                      <label htmlFor="stdio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        stdio
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="http" id="http" />
                      <label htmlFor="http" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        http
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mcp" id="mcp" />
                      <label htmlFor="mcp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        mcp
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sse" id="sse" />
                      <label htmlFor="sse" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        sse (Server-Sent Events)
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  The primary communication method for your MCP server
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supportedModalities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supported Modalities</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="text,image,audio,file" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of supported input/output modalities
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="supportedMethods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supported Methods</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="server::resources.list,server::tools.call" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of namespace methods supported
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="traceSupport"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Trace ID Support
                  </FormLabel>
                  <FormDescription>
                    Enable trace_id tracking for cross-agent workflows
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Database className="h-5 w-5" />
          MCP Capabilities
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select which MCP protocol modules your server implements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="resources"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Resources Module
                </FormLabel>
                <FormDescription>
                  Provides context resources (resources.list, resources.get)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prompts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Prompts Module
                </FormLabel>
                <FormDescription>
                  Provides prompt templates (prompts.list, prompts.get)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tools"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Tools Module
                </FormLabel>
                <FormDescription>
                  Provides tool calling capability (tools.list, tools.call)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sampling"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Sampling Module
                </FormLabel>
                <FormDescription>
                  Provides LLM sampling (sampling.start, sampling.step)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold">Implementation Details</h2>
      </div>

      <FormField
        control={form.control}
        name="gitRepo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Git Repository URL</FormLabel>
            <FormControl>
              <Input placeholder="https://github.com/yourusername/your-mcp-server" {...field} />
            </FormControl>
            <FormDescription>
              Link to the source code repository for your MCP server
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="homepage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Homepage URL (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://yourmcpserver.com" {...field} />
            </FormControl>
            <FormDescription>
              Public website or documentation for your MCP server
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="entities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entities</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List entities your MCP server works with"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the main entities your MCP server works with
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="relations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relations</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe entity relationships"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Explain how different entities in your system relate to each other
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
        <h3 className="font-medium mb-1">Important Notes:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your executable file name must match your MCP server name. For example, if your server is named "mysql-mcp", your executable should be named "mysql-mcp".</li>
          <li>The server must support JSON-RPC formatted requests with namespace methods.</li>
          <li>For MCP communication type, at least one module must be implemented.</li>
        </ul>
      </div>
    </div>
  );
};

export default MCPServerTechnicalInfo;
