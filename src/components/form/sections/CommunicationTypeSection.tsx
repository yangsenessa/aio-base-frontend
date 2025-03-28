
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MCPServerFormValues } from '@/types/agent';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Server } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CommunicationTypeSectionProps {
  form: UseFormReturn<MCPServerFormValues>;
}

const CommunicationTypeSection = ({ form }: CommunicationTypeSectionProps) => {
  return (
    <>
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
                    className="min-h-[100px] resize-none" 
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
                    className="min-h-[100px] resize-none" 
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of namespace methods supported
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} 
          />
        </div>
      </div>

      <Separator />
    </>
  );
};

export default CommunicationTypeSection;
