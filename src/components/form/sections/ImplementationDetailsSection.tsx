
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MCPServerFormValues } from '@/types/agent';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ImplementationDetailsSectionProps {
  form: UseFormReturn<MCPServerFormValues>;
}

const ImplementationDetailsSection = ({ form }: ImplementationDetailsSectionProps) => {
  return (
    <>
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
      
      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
        <h3 className="font-medium mb-1">Important Notes:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your executable file name must match your MCP server name. For example, if your server is named "mysql-mcp", your executable should be named "mysql-mcp".</li>
          <li>The server must support JSON-RPC formatted requests with namespace methods.</li>
          <li>For MCP communication type, at least one module must be implemented.</li>
        </ul>
      </div>
    </>
  );
};

export default ImplementationDetailsSection;
