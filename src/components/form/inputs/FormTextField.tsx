
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface FormTextFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  description?: string;
  optional?: boolean;
}

const FormTextField = ({
  form,
  name,
  label,
  placeholder,
  description,
  optional = false
}: FormTextFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={name} className="block text-sm font-medium">
            {label}{optional && " (Optional)"}
          </FormLabel>
          <FormControl>
            <Input 
              id={name} 
              placeholder={placeholder} 
              className="w-full p-2 border border-gray-300 rounded-md text-black"
              {...field}
            />
          </FormControl>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormTextField;
