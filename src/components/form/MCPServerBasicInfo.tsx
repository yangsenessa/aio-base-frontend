
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MCPServerFormValues } from '@/types/agent';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MCPServerBasicInfoProps {
  form: UseFormReturn<MCPServerFormValues>;
}

const MCPServerBasicInfo = ({
  form
}: MCPServerBasicInfoProps) => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="gitRepo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="gitRepo" className="block text-sm font-medium">
                    Git Repository
                  </FormLabel>
                  <FormControl>
                    <Input 
                      id="gitRepo" 
                      placeholder="https://github.com/your-username/mcp-server" 
                      className="w-full p-2 border border-gray-300 rounded-md text-black" // Updated to text-black
                      {...field}
                    />
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
                  <FormLabel htmlFor="homepage" className="block text-sm font-medium">
                    Homepage (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      id="homepage" 
                      placeholder="https://your-project-site.com" 
                      className="w-full p-2 border border-gray-300 rounded-md text-black" // Updated to text-black
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPServerBasicInfo;
