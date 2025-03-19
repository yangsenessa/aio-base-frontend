
export interface Agent {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  hasVideo?: boolean;
}

export const caseStudies = [
  {
    id: "cartage",
    title: "How Cartage Automated Customer Reporting",
    description: "Using Wordware, Cartage built a smart agent that can quickly dig into their huge database and give customers the right answers to complex queries—all without needing extra engineering help. This automation significantly improved their customer service and operational efficiency.",
  },
  {
    id: "acme",
    title: "ACME's AI Customer Support Revolution",
    description: "ACME implemented an AI agent that handles 80% of their customer support queries automatically, reducing response time from days to minutes and improving customer satisfaction scores by 45%.",
  }
];

export const agents: Agent[] = [
  {
    id: "job-screening",
    title: "Job Candidate Screening",
    description: "Automate CV-sifting away - spend your time on the best candidates instead! You know the feeling: 1000 resumes and limited time to review them all.",
    category: "HR & Operations",
    image: "/placeholder.svg",
    hasVideo: true
  },
  {
    id: "survey-analyzer",
    title: "Survey Response Analyzer",
    description: "The Survey Response Analyzer is a tool designed to streamline the process of analyzing survey data, specifically for product feedback and customer satisfaction surveys.",
    category: "HR & Operations",
    image: "/placeholder.svg",
    hasVideo: true
  },
  {
    id: "competition-analysis",
    title: "Competition research and analysis",
    description: "Get list of your competition and instant insights on them. This WordApp - a Wordware application - summarizes your competitors' strengths and weaknesses.",
    category: "Research & Education",
    image: "/placeholder.svg"
  },
  {
    id: "lego-figure",
    title: "Turn Yourself into a Lego Figure",
    description: "Ever wondered what you'd look like if you were a Lego minifigure? This fun application turns your photo into a Lego-style character.",
    category: "Fun & Lifestyle",
    image: "/placeholder.svg",
    hasVideo: true
  },
  {
    id: "landing-page",
    title: "Start-up Landing Page Generator",
    description: "Need a new home page? This WordApp will generate and deploy one for you! Instantly create a home and description for your new product.",
    category: "Marketing & Sales",
    image: "/placeholder.svg",
    hasVideo: true
  },
  {
    id: "chatbotify",
    title: "Chatbotify a website",
    description: "Reading a website can get pretty dull. How about chatting with its content instead? Turn any website into a friendly AI assistant that can answer questions about it.",
    category: "Autonomous Agents",
    image: "/placeholder.svg"
  }
];
