
import React from 'react';
import { Link, Linkedin, Twitter, Facebook, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactUs = () => {
  return (
    <div className="mt-16 mb-8">
      <h2 className="text-2xl font-bold text-primary mb-6">Contact us</h2>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-secondary/30 hover:bg-primary/20 hover:text-primary border-0"
          asChild
        >
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" aria-label="Website">
            <Link size={20} />
          </a>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-secondary/30 hover:bg-primary/20 hover:text-primary border-0"
          asChild
        >
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-secondary/30 hover:bg-primary/20 hover:text-primary border-0"
          asChild
        >
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <Twitter size={20} />
          </a>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-secondary/30 hover:bg-primary/20 hover:text-primary border-0"
          asChild
        >
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Facebook size={20} />
          </a>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-secondary/30 hover:bg-primary/20 hover:text-primary border-0"
          asChild
        >
          <a href="mailto:contact@example.com" aria-label="Email">
            <Mail size={20} />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ContactUs;
