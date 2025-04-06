
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MCPServerFormValues } from '@/types/agent';
import FormTextField from './inputs/FormTextField';

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
            <FormTextField
              form={form}
              name="name"
              label="MCP Server Name"
              placeholder="Enter your MCP server name"
            />
            
            <FormTextField
              form={form}
              name="author"
              label="Author"
              placeholder="Your name or organization"
            />

            <FormTextField
              form={form}
              name="gitRepo"
              label="Git Repository"
              placeholder="https://github.com/your-username/mcp-server"
            />
            
            <FormTextField
              form={form}
              name="homepage"
              label="Homepage"
              placeholder="https://your-project-site.com"
              optional={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPServerBasicInfo;
