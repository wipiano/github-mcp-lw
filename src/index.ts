#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { GitHubClient } from './github-client.js';
import { ListIssuesParams, ListPullRequestsParams } from './types.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

/**
 * Validate parameters for listing issues
 */
const isValidListIssuesParams = (args: any): args is ListIssuesParams =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.owner === 'string' &&
  typeof args.repo === 'string' &&
  typeof args.since === 'string';

/**
 * Validate parameters for listing pull requests
 */
const isValidListPullRequestsParams = (args: any): args is ListPullRequestsParams =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.owner === 'string' &&
  typeof args.repo === 'string' &&
  typeof args.since === 'string';

class GitHubLightweightServer {
  private server: Server;
  private githubClient: GitHubClient;

  constructor() {
    this.server = new Server(
      {
        name: 'github-mcp-lightweight',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.githubClient = new GitHubClient(GITHUB_TOKEN!);
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_repository_issues',
          description: 'List issues from a GitHub repository with minimal response size for efficient analysis',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner (username or organization)',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
              since: {
                type: 'string',
                description: 'Only show issues updated at or after this time (ISO 8601 format)',
              },
            },
            required: ['owner', 'repo', 'since'],
          },
        },
        {
          name: 'list_repository_pull_requests',
          description: 'List pull requests from a GitHub repository with minimal response size for efficient analysis',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner (username or organization)',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
              since: {
                type: 'string',
                description: 'Only show pull requests updated at or after this time (ISO 8601 format)',
              },
            },
            required: ['owner', 'repo', 'since'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_repository_issues':
            if (!isValidListIssuesParams(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid parameters for list_repository_issues. Required: owner (string), repo (string), since (string)'
              );
            }

            const issues = await this.githubClient.getIssues(args.owner, args.repo, args.since);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    repository: `${args.owner}/${args.repo}`,
                    since: args.since,
                    total_issues: issues.length,
                    issues: issues
                  }, null, 2),
                },
              ],
            };

          case 'list_repository_pull_requests':
            if (!isValidListPullRequestsParams(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid parameters for list_repository_pull_requests. Required: owner (string), repo (string), since (string)'
              );
            }

            const pullRequests = await this.githubClient.getPullRequests(args.owner, args.repo, args.since);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    repository: `${args.owner}/${args.repo}`,
                    since: args.since,
                    total_pull_requests: pullRequests.length,
                    pull_requests: pullRequests
                  }, null, 2),
                },
              ],
            };

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        // Handle other errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    // Test GitHub connection on startup
    const isConnected = await this.githubClient.testConnection();
    if (!isConnected) {
      console.error('Failed to connect to GitHub API. Please check your GITHUB_TOKEN.');
      process.exit(1);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitHub Lightweight MCP server running on stdio');
  }
}

const server = new GitHubLightweightServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
