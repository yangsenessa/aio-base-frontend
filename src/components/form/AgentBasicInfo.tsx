
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues } from '@/types/agent';
import { Button } from '@/components/ui/button';

interface AgentBasicInfoProps {
  form: UseFormReturn<AgentFormValues>;
}

const DESCRIPTION_TEMPLATE = `This agent implements the AIO protocol specification v1.2, communicating via standard input/output (stdio). It accepts text and file inputs and produces outputs according to the AIO protocol.

## Features
- Feature 1: ...
- Feature 2: ...
- Feature 3: ...

## Use Cases
- Use case 1: ...
- Use case 2: ...

## Technical Requirements
- ...
`;

const AgentBasicInfo = ({ form }: AgentBasicInfoProps) => {
  const applyTemplate = () => {
    form.setValue('description', DESCRIPTION_TEMPLATE);
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agent Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter agent name" {...field} />
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
              <Input placeholder="Enter author name" {...field} />
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
            <div className="flex items-center justify-between mb-2">
              <FormDescription>
                Describe what your agent does and how it can be used.
              </FormDescription>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={applyTemplate}
              >
                Apply Template
              </Button>
            </div>
            <FormControl>
              <Textarea 
                placeholder="Describe what your agent does" 
                className="min-h-24"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AgentBasicInfo;
