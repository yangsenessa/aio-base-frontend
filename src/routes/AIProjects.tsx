
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Chapter1 from '../components/ai-projects/Chapter1';
import Chapter2 from '../components/ai-projects/Chapter2';
import Chapter3 from '../components/ai-projects/Chapter3';
import Chapter4 from '../components/ai-projects/Chapter4';
import Chapter5 from '../components/ai-projects/Chapter5';
import Chapter6 from '../components/ai-projects/Chapter6';

const AIProjects = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">AIO Protocol Analysis</h1>
      
      <div className="mb-8">
        <p className="text-lg">
          A comprehensive analysis of the AIO Protocol for Web3 AIOps systems, 
          exploring its architecture, economics, and future research directions.
        </p>
      </div>

      <Tabs defaultValue="chapter1" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
          <TabsTrigger value="chapter1">Ch.1</TabsTrigger>
          <TabsTrigger value="chapter2">Ch.2</TabsTrigger>
          <TabsTrigger value="chapter3">Ch.3</TabsTrigger>
          <TabsTrigger value="chapter4">Ch.4</TabsTrigger>
          <TabsTrigger value="chapter5">Ch.5</TabsTrigger>
          <TabsTrigger value="chapter6">Ch.6</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chapter1" className="mt-6">
          <Chapter1 />
        </TabsContent>
        
        <TabsContent value="chapter2" className="mt-6">
          <Chapter2 />
        </TabsContent>
        
        <TabsContent value="chapter3" className="mt-6">
          <Chapter3 />
        </TabsContent>
        
        <TabsContent value="chapter4" className="mt-6">
          <Chapter4 />
        </TabsContent>
        
        <TabsContent value="chapter5" className="mt-6">
          <Chapter5 />
        </TabsContent>
        
        <TabsContent value="chapter6" className="mt-6">
          <Chapter6 />
        </TabsContent>
      </Tabs>
      
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          © 2025 AIO Protocol Foundation. All research materials are provided under 
          Creative Commons Attribution 4.0 International License.
        </p>
      </div>
    </div>
  );
};

export default AIProjects;
