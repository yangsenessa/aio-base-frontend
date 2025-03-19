
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues } from '@/types/agent';

interface AgentTechnicalInfoProps {
  form: UseFormReturn<AgentFormValues>;
}

const AgentTechnicalInfo = ({ form }: AgentTechnicalInfoProps) => {
  return (
    <div className="space-y-6">
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
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Platform</FormLabel>
            <FormControl>
              <RadioGroup 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="windows" id="windows" />
                  <Label htmlFor="windows">Windows</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="linux" id="linux" />
                  <Label htmlFor="linux">Linux</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both</Label>
                </div>
              </RadioGroup>
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
            <FormLabel>Git Repository URL</FormLabel>
            <FormControl>
              <Input placeholder="https://github.com/username/repo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AgentTechnicalInfo;
