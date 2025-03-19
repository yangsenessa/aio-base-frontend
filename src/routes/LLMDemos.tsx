
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description: string;
  parameters: string;
  samplePrompt: string;
}

const models: Model[] = [
  {
    id: 'palm',
    name: 'PaLM Assistant',
    description: 'Google\'s Pathways Language Model with strong reasoning and language capabilities.',
    parameters: '540B',
    samplePrompt: 'Explain quantum computing to a 5-year old.',
  },
  {
    id: 'llama',
    name: 'Llama 2',
    description: 'Meta\'s open-source large language model with enhanced safety and helpfulness.',
    parameters: '70B',
    samplePrompt: 'Write a short poem about artificial intelligence.',
  },
  {
    id: 'claude',
    name: 'Claude 2',
    description: 'Anthropic\'s assistant with strong safety features and reduced hallucination.',
    parameters: '100B',
    samplePrompt: 'What are three ways to improve global education?',
  },
];

const LLMDemos = () => {
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  const [prompt, setPrompt] = useState(selectedModel.samplePrompt);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleModelChange = (modelId: string) => {
    const model = models.find(m => m.id === modelId) || models[0];
    setSelectedModel(model);
    setPrompt(model.samplePrompt);
    setResponse('');
  };

  const generateResponse = () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    // Simulate API call with timeout
    setTimeout(() => {
      const responses: Record<string, string> = {
        'palm': `Imagine you have a box of toy blocks. But these blocks are super tiny, so tiny you can't even see them! These blocks can be in different places at the same time, which is really weird but cool.

Quantum computers use these super tiny blocks to solve really hard puzzles that normal computers can't solve. They're like super-smart puzzle solvers!

Just like you can build amazing towers with your blocks, scientists use quantum computers to build amazing new medicines and solve big problems to help people.`,
        'llama': `In circuits of thought and wire,
Silicon dreams begin to transpire.
Not alive, yet learning still,
A digital mind with human will.

Through data seas it gently wades,
As understanding slowly pervades.
A reflection of our own design,
Where human and machine entwine.`,
        'claude': `1. **Universal Access to Internet**: Ensuring every child globally has reliable internet access would democratize information and educational resources, particularly benefiting remote and underserved communities.

2. **Personalized Learning Paths**: Using adaptive technology to create customized education experiences that respond to each student's individual strengths, weaknesses, and learning style would improve engagement and outcomes.

3. **Teacher Training and Support**: Investing in comprehensive, ongoing professional development for educators worldwide would enhance teaching quality and effectiveness, ultimately benefiting students across all socioeconomic backgrounds.`,
      };
      
      setResponse(responses[selectedModel.id] || 'No response generated for this model.');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">LLM Demos</h1>
        <p className="text-muted-foreground">
          Experience the capabilities of different large language models through interactive demonstrations.
          Select a model, enter a prompt, and see how different architectures respond.
        </p>
      </section>
      
      <section className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-lg border border-border/40 overflow-hidden">
            <div className="p-4 border-b border-border/40">
              <h2 className="font-medium">Select a Model</h2>
            </div>
            <div className="p-4 space-y-2">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={`
                    p-3 rounded-md cursor-pointer transition-all
                    ${selectedModel.id === model.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-secondary'
                    }
                  `}
                  onClick={() => handleModelChange(model.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs bg-secondary/80 px-2 py-0.5 rounded-full">
                      {model.parameters}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {model.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-border/40 p-4">
            <h2 className="font-medium mb-3">Model Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground">Name</div>
                <div>{selectedModel.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Parameters</div>
                <div>{selectedModel.parameters}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Description</div>
                <div>{selectedModel.description}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg border border-border/40 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-border/40">
              <h2 className="font-medium">Interactive Demo</h2>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {response ? (
                <div className="rounded-lg bg-secondary/50 p-4 animate-fade-in">
                  <div className="text-sm font-medium mb-2">Response from {selectedModel.name}:</div>
                  <div className="whitespace-pre-line">{response}</div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-muted-foreground h-48 flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 size={24} className="animate-spin mb-2" />
                      <span>Generating response...</span>
                    </div>
                  ) : (
                    <span>Enter a prompt and click "Generate" to see a response</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-border/40">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={generateResponse}
                  disabled={isLoading || !prompt.trim()}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LLMDemos;
