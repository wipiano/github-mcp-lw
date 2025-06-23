import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  GitHubIssue,
  GitHubComment,
  LightweightIssue,
  LightweightPullRequest,
  GitHubError,
  LightweightComment
} from './types.js';

export class GitHubClient {
  private client: AxiosInstance;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'github-mcp-lightweight/1.0.0'
      },
      timeout: 30000
    });
  }

  /**
   * Fetch issues from a repository with minimal data
   */
  async getIssues(owner: string, repo: string, since: string): Promise<LightweightIssue[]> {
    try {
      // Fetch issues from GitHub API
      const response = await this.client.get<GitHubIssue[]>(
        `/repos/${owner}/${repo}/issues`,
        {
          params: {
            since,
            state: 'all',
            per_page: 100,
            sort: 'updated',
            direction: 'desc'
          }
        }
      );

      const issues = response.data.filter(issue => !issue.pull_request);
      const lightweightIssues: LightweightIssue[] = [];

      // Process each issue and fetch its comments
      for (const issue of issues) {
        const comments = await this.getComments(issue.comments_url);
        
        lightweightIssues.push({
          id: issue.id,
          html_url: issue.html_url,
          title: issue.title,
          body: issue.body,
          comments
        });
      }

      return lightweightIssues;
    } catch (error) {
      this.handleError(error, `Failed to fetch issues for ${owner}/${repo}`);
      throw error;
    }
  }

  /**
   * Fetch pull requests from a repository with minimal data
   */
  async getPullRequests(owner: string, repo: string, since: string): Promise<LightweightPullRequest[]> {
    try {
      // Fetch pull requests from GitHub API
      const response = await this.client.get<GitHubIssue[]>(
        `/repos/${owner}/${repo}/issues`,
        {
          params: {
            since,
            state: 'all',
            per_page: 100,
            sort: 'updated',
            direction: 'desc'
          }
        }
      );

      const pullRequests = response.data.filter(issue => issue.pull_request);
      const lightweightPRs: LightweightPullRequest[] = [];

      // Process each pull request and fetch its comments
      for (const pr of pullRequests) {
        const comments = await this.getComments(pr.comments_url);
        
        lightweightPRs.push({
          id: pr.id,
          html_url: pr.html_url,
          title: pr.title,
          body: pr.body,
          comments
        });
      }

      return lightweightPRs;
    } catch (error) {
      this.handleError(error, `Failed to fetch pull requests for ${owner}/${repo}`);
      throw error;
    }
  }

  /**
   * Fetch comments for an issue or pull request
   */
  private async getComments(commentsUrl: string): Promise<LightweightComment[]> {
    try {
      // Extract the path from the full URL
      const url = new URL(commentsUrl);
      const path = url.pathname;

      const response = await this.client.get<GitHubComment[]>(path, {
        params: {
          per_page: 100
        }
      });

      return response.data.map(comment => ({
        body: comment.body,
        author: comment.user.login,
        created_at: comment.created_at
      }));
    } catch (error) {
      // If comments fail to load, return empty array rather than failing the entire request
      console.error('Failed to fetch comments:', error);

      return [];
    }
  }

  /**
   * Handle and format GitHub API errors
   */
  private handleError(error: unknown, context: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GitHubError>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message || axiosError.message;

      switch (status) {
        case 401:
          console.error(`${context}: Authentication failed. Please check your GitHub token.`);
          break;
        case 403:
          if (message.includes('rate limit')) {
            console.error(`${context}: GitHub API rate limit exceeded. Please wait before retrying.`);
          } else {
            console.error(`${context}: Access forbidden. Please check repository permissions.`);
          }
          break;
        case 404:
          console.error(`${context}: Repository not found or access denied.`);
          break;
        default:
          console.error(`${context}: ${message}`);
      }
    } else {
      console.error(`${context}:`, error);
    }
  }

  /**
   * Test the GitHub token and connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/user');
      return true;
    } catch (error) {
      this.handleError(error, 'GitHub connection test failed');
      return false;
    }
  }
}
