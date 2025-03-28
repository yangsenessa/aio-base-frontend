
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MCPServerFormValues } from '@/types/agent';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MCPCapabilitiesSectionProps {
  form: UseFormReturn<MCPServerFormValues>;
}

const MCPCapabilitiesSection = ({ form }: MCPCapabilitiesSectionProps) => {
  return (
    <>
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
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
    </>
  );
};

export default MCPCapabilitiesSection;
