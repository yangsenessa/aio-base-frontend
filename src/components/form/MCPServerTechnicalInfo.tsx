
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MCPServerFormValues } from '@/types/agent';

interface MCPServerTechnicalInfoProps {
  form: UseFormReturn<MCPServerFormValues>;
}

const MCPServerTechnicalInfo = ({ form }: MCPServerTechnicalInfoProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Technical Information</h2>
      
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
      
      <FormField
        control={form.control}
        name="entities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Entities</FormLabel>
            <FormControl>
              <Textarea
                placeholder="List the entities your MCP server works with (e.g., documents, images, transactions, etc.)"
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
                placeholder="Describe how entities relate to each other in your MCP server"
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
      
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
        <strong>Important File Naming:</strong> Your executable file name must match your MCP server name. 
        For example, if your server is named "mysql-mcp", your executable should be named "mysql-mcp".
        The file will be stored in a dedicated MCP server directory on our Linux servers.
      </div>
    </div>
  );
};

export default MCPServerTechnicalInfo;
