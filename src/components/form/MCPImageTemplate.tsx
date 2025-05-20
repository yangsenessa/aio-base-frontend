
import React from 'react';
import { Check, Image, Brush, Camera, Filter, Wand2, Info } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { MCPServerFormValues } from '@/types/agent';
import { Badge } from '@/components/ui/badge';

interface MCPImageTemplateProps {
  form: UseFormReturn<MCPServerFormValues>;
}

const MCPImageTemplate = ({ form }: MCPImageTemplateProps) => {
  const imageTemplates = [
    {
      id: 'image-generation',
      name: 'Image Generation MCP',
      description: 'Generate beautiful images from text prompts using Silicon Flow API',
      icon: <Image className="text-blue-500" />,
      category: 'Generative',
      badges: ['tools', 'prompts'],
      data: {
        name: 'image-generation',
        description: 'MCP server for generating images from text prompts using Silicon Flow API',
        author: 'Your Name',
        gitRepo: 'https://github.com/username/mcp_image_generate',
        homepage: 'https://github.com/username/mcp_image_generate',
        remoteEndpoint: '',
        type: 'stdio',
        communityBody: JSON.stringify({
          "jsonrpc": "2.0",
          "method": "image-generation::generate_image",
          "params": {
            "prompt": "an island near sea, with seagulls, moon shining over the sea, light house, boats in the background, fish flying over the sea",
            "negative_prompt": "blurry, low quality",
            "num_inference_steps": 20,
            "guidance_scale": 7.5
          },
          "id": 1,
          "trace_id": "AIO-TR-20250520-0001"
        }, null, 2),
        resources: false,
        prompts: true,
        tools: true,
        sampling: false,
      }
    },
    {
      id: 'image-enhancement',
      name: 'Image Enhancement MCP',
      description: 'Enhance and improve image quality with professional filters and color adjustments',
      icon: <Brush className="text-purple-500" />,
      category: 'Enhancement',
      badges: ['tools'],
      data: {
        name: 'image-enhancement',
        description: 'MCP server for enhancing images with professional filters and color adjustments',
        author: 'Your Name',
        gitRepo: 'https://github.com/username/mcp_image_enhance',
        homepage: 'https://github.com/username/mcp_image_enhance',
        remoteEndpoint: '',
        type: 'stdio',
        communityBody: JSON.stringify({
          "jsonrpc": "2.0",
          "method": "image-enhancement::enhance_image",
          "params": {
            "image_base64": "base64_encoded_image_here",
            "brightness": 1.2,
            "contrast": 1.1,
            "saturation": 1.1,
            "filter_name": "cinematic"
          },
          "id": 1,
          "trace_id": "AIO-TR-20250520-0002"
        }, null, 2),
        resources: true,
        prompts: false,
        tools: true,
        sampling: false,
      }
    },
    {
      id: 'image-analysis',
      name: 'Image Analysis MCP',
      description: 'Extract information, detect objects, and analyze content in images',
      icon: <Camera className="text-green-500" />,
      category: 'Analysis',
      badges: ['tools', 'sampling'],
      data: {
        name: 'image-analysis',
        description: 'MCP server for extracting information and analyzing image content',
        author: 'Your Name',
        gitRepo: 'https://github.com/username/mcp_image_analysis',
        homepage: 'https://github.com/username/mcp_image_analysis',
        remoteEndpoint: '',
        type: 'stdio',
        communityBody: JSON.stringify({
          "jsonrpc": "2.0",
          "method": "image-analysis::analyze_image",
          "params": {
            "image_base64": "base64_encoded_image_here",
            "analysis_type": "object_detection",
            "include_captions": true,
            "confidence_threshold": 0.6
          },
          "id": 1,
          "trace_id": "AIO-TR-20250520-0003"
        }, null, 2),
        resources: true,
        prompts: false,
        tools: true,
        sampling: true,
      }
    },
    {
      id: 'image-transformation',
      name: 'Image Transformation MCP',
      description: 'Apply artistic effects, style transfers, and creative transformations to images',
      icon: <Wand2 className="text-amber-500" />,
      category: 'Creative',
      badges: ['tools', 'prompts'],
      data: {
        name: 'image-transformation',
        description: 'MCP server for applying artistic effects and style transfers to images',
        author: 'Your Name',
        gitRepo: 'https://github.com/username/mcp_image_transform',
        homepage: 'https://github.com/username/mcp_image_transform',
        remoteEndpoint: '',
        type: 'stdio',
        communityBody: JSON.stringify({
          "jsonrpc": "2.0",
          "method": "image-transformation::transform_image",
          "params": {
            "image_base64": "base64_encoded_image_here",
            "style": "watercolor",
            "intensity": 0.8,
            "reference_image_base64": "optional_style_reference_image"
          },
          "id": 1,
          "trace_id": "AIO-TR-20250520-0004"
        }, null, 2),
        resources: true,
        prompts: true,
        tools: true,
        sampling: false,
      }
    },
    {
      id: 'custom-image-mcp',
      name: 'Custom Image MCP',
      description: 'Build a completely custom image processing MCP with your own implementation',
      icon: <Filter className="text-red-500" />,
      category: 'Custom',
      badges: ['customizable'],
      data: {
        name: 'custom-image-mcp',
        description: 'Custom MCP server for image processing with your own implementation',
        author: 'Your Name',
        gitRepo: 'https://github.com/username/custom_image_mcp',
        homepage: 'https://github.com/username/custom_image_mcp',
        remoteEndpoint: '',
        type: 'stdio',
        communityBody: JSON.stringify({
          "jsonrpc": "2.0",
          "method": "custom-image-mcp::process_image",
          "params": {
            "image_base64": "base64_encoded_image_here",
            "operation": "custom_operation",
            "parameters": {
              "param1": "value1",
              "param2": "value2"
            }
          },
          "id": 1,
          "trace_id": "AIO-TR-20250520-0005"
        }, null, 2),
        resources: true,
        prompts: true,
        tools: true,
        sampling: true,
      }
    },
  ];

  const applyTemplate = (templateData: any) => {
    form.reset(templateData);
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Generative': return 'bg-blue-50 text-blue-800';
      case 'Enhancement': return 'bg-purple-50 text-purple-800';
      case 'Analysis': return 'bg-green-50 text-green-800';
      case 'Creative': return 'bg-amber-50 text-amber-800';
      case 'Custom': return 'bg-red-50 text-red-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-2">Image MCP Templates</h3>
      <p className="text-sm text-gray-500 mb-4">
        Select a template to quickly set up an image processing MCP server based on the sample project
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {imageTemplates.map((template) => (
          <div 
            key={template.id}
            className="border rounded-xl p-6 hover:border-primary cursor-pointer transition-colors hover:shadow-md"
            onClick={() => applyTemplate(template.data)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gray-100">
                  {template.icon}
                </div>
                <div>
                  <h4 className="font-medium text-lg">{template.name}</h4>
                  <Badge variant="outline" className={`text-xs mt-1 ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  applyTemplate(template.data);
                }}
              >
                <Check size={16} className="mr-1" />
                Use
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-3">
              {template.description}
            </p>

            <div className="flex flex-wrap gap-1 mt-3">
              {template.badges.includes('tools') && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">Tools</span>
              )}
              {template.badges.includes('prompts') && (
                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">Prompts</span>
              )}
              {template.badges.includes('resources') && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Resources</span>
              )}
              {template.badges.includes('sampling') && (
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Sampling</span>
              )}
              {template.badges.includes('customizable') && (
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">Customizable</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-full text-blue-700">
            <Info size={18} />
          </div>
          <div>
            <strong className="font-medium">Pro Tip:</strong> All templates use the AIO-MCP protocol v1.2.1 which enables seamless integration with other AI agents. The example implementations work with the Silicon Flow API for image processing. Remember to add your API key when implementing.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPImageTemplate;
