
import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(3, 'Agent name must be at least 3 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  author: z.string().min(2, 'Author name required'),
  platform: z.enum(['windows', 'linux', 'both']),
  gitRepo: z.string().url('Must be a valid URL'),
  inputParams: z.string().optional(),
  outputExample: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddAgent = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      author: '',
      platform: 'both',
      gitRepo: '',
      inputParams: '',
      outputExample: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImagePreview(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const onSubmit = (data: FormValues) => {
    if (!image) {
      toast({
        title: "Image Required",
        description: "Please upload an image for your agent",
        variant: "destructive",
      });
      return;
    }

    console.log('Form submitted:', { ...data, image });
    
    // Here you would typically send this data to your backend
    // For now, we'll just show a success message and redirect
    
    toast({
      title: "Agent Submitted",
      description: "Your agent has been submitted successfully",
    });
    
    // Redirect back to agent store after successful submission
    setTimeout(() => {
      navigate('/agent-store');
    }, 2000);
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/agent-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add My Agent</h1>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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

            <div className="space-y-2">
              <Label htmlFor="image">Upload Image</Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Choose Image
                  </Button>
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                  <span className="text-sm text-muted-foreground">
                    {image ? image.name : 'No file chosen'}
                  </span>
                </div>

                {imagePreview && (
                  <div className="mt-2 overflow-hidden rounded-md border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

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

            <FormField
              control={form.control}
              name="inputParams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input Parameters Example (JSON)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='{"param1": "value1", "param2": "value2"}' 
                      className="font-mono"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outputExample"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Example (JSON)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='{"result": "success", "data": {"key": "value"}}' 
                      className="font-mono"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button type="submit" className="w-full">Submit Agent</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddAgent;
