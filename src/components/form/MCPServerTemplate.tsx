
import React from 'react';
import { Check } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { MCPServerFormValues } from '@/types/agent';

interface MCPServerTemplateProps {
  form: UseFormReturn<MCPServerFormValues>;
}

const MCPServerTemplate = ({ form }: MCPServerTemplateProps) => {
  const quickTemplates = [
    {
      id: 'math-tools',
      name: 'Math Tools Server',
      description: 'Template for a Math tools MCP server with area calculation capabilities',
      data: {
        name: 'math-tools',
        description: 'A simple MCP server that provides mathematical utility functions including area calculation',
        author: 'Your Name',
        gitRepo: 'https://github.com/username/math-tools',
        homepage: 'https://github.com/username/math-tools',
        remoteEndpoint: '',
        type: 'stdio',
        communityBody: JSON.stringify({
          method: "math_agent::tools.call",
          params: {
            tool: "calculate_area",
            args: { x: 3, y: 4 }
          }
        }, null, 2),
        resources: false,
        prompts: false,
        tools: true,
        sampling: false,
      }
    },
    {
      id: 'llm-sampling',
      name: 'LLM Sampling Server',
      description: 'Template for an LLM sampling server with text generation capabilities',
      data: {
        name: 'llm-sampling',
        description: 'MCP server that provides LLM sampling capabilities for text generation and completion',
        author: 'Your Name',
        gitRepo: 'https://github.com/username/llm-sampling',
        homepage: 'https://github.com/username/llm-sampling',
        remoteEndpoint: '',
        type: 'sse',
        communityBody: JSON.stringify({
          method: "llm_agent::sampling.start",
          params: {
            input: {
              type: "text",
              value: "Please summarize the following content..."
            }
          }
        }, null, 2),
        resources: false,
        prompts: true,
        tools: false,
        sampling: true,
      }
    }
  ];

  const applyTemplate = (templateData: any) => {
    // Reset form with template data
    form.reset(templateData);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-2">Quick Templates</h3>
      <p className="text-sm text-gray-500 mb-4">
        Select a template to quickly fill the form with sample data
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickTemplates.map((template) => (
          <div 
            key={template.id}
            className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
            onClick={() => applyTemplate(template.data)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              </div>
              <Button
                variant="outline" 
                size="sm" 
                className="flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  applyTemplate(template.data);
                }}
              >
                <Check size={16} className="mr-1" />
                Use
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
        <strong>Note:</strong> Using a template will override any data you've already entered in the form.
      </div>
    </div>
  );
};

export default MCPServerTemplate;
