
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AgentFormValues } from '@/types/agent';

interface AgentTechnicalInfoProps {
  form: UseFormReturn<AgentFormValues>;
}

const AgentTechnicalInfo = ({ form }: AgentTechnicalInfoProps) => {
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
              <Input placeholder="https://github.com/yourusername/your-agent" {...field} />
            </FormControl>
            <FormDescription>
              Link to the source code repository for your agent
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
              <Input placeholder="https://youragent.com" {...field} />
            </FormControl>
            <FormDescription>
              Public website or documentation for your agent
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
        <strong>Important File Naming:</strong> Your executable file name must match your agent name. 
        For example, if your agent is named "image-analyzer", your executable should be named "image-analyzer".
        The file will be stored in a dedicated agent directory on our Linux servers.
      </div>
    </div>
  );
};

export default AgentTechnicalInfo;
