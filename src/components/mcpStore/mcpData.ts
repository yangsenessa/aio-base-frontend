
export interface MCPServer {
  id: string;
  title: string;
  description: string;
  isNew?: boolean;
  githubUrl?: string;
}

export const mcpServers: MCPServer[] = [
  {
    id: "npm-search",
    title: "NPM Search",
    description: "Search for npm packages",
    isNew: true,
    githubUrl: "https://github.com",
  },
  {
    id: "cloudflare",
    title: "Cloudflare",
    description: "Interacting with Cloudflare services",
    isNew: true,
    githubUrl: "https://github.com",
  },
  {
    id: "openai",
    title: "OpenAI",
    description: "Query OpenAI models directly from Claude using MCP protocol",
    isNew: true,
    githubUrl: "https://github.com",
  },
  {
    id: "apple-notes",
    title: "Apple Notes",
    description: "Talk with your Apple Notes",
    isNew: true,
    githubUrl: "https://github.com",
  },
  {
    id: "everything-search",
    title: "Everything Search",
    description: "Fast Windows file search using Everything SDK",
    isNew: true,
    githubUrl: "https://github.com",
  },
  {
    id: "mysql",
    title: "MySQL",
    description: "MySQL database integration with configurable access controls and schema inspection",
    isNew: true,
    githubUrl: "https://github.com",
  },
  {
    id: "apple-shortcuts",
    title: "Apple Shortcuts",
    description: "An MCP Server Integration with Apple Shortcuts",
    githubUrl: "https://github.com",
  },
  {
    id: "data-exploration",
    title: "Data Exploration",
    description: "MCP server for autonomous data exploration on .csv-based datasets, providing intelligent insights with minimal effort.",
    githubUrl: "https://github.com",
  },
  {
    id: "search1api",
    title: "Search1API",
    description: "Search and crawl in one API",
    githubUrl: "https://github.com",
  },
];
