/**
 * Lightweight GitHub issue representation with minimal fields
 */
export interface LightweightIssue {
  id: number;
  html_url: string;
  title: string;
  body: string | null;
  comments: LightweightComment[];
}

/**
 * Lightweight GitHub pull request representation with minimal fields
 */
export interface LightweightPullRequest {
  id: number;
  html_url: string;
  title: string;
  body: string | null;
  comments: LightweightComment[];
}

export interface LightweightComment {
  body: string;
  author: string;
  created_at: string;
}

/**
 * GitHub API issue response (partial interface for what we need)
 */
export interface GitHubIssue {
  id: number;
  html_url: string;
  title: string;
  body: string | null;
  comments_url: string;
  pull_request?: {
    url: string;
  };
}

/**
 * GitHub API comment response (partial interface for what we need)
 */
export interface GitHubComment {
  body: string;
  user: {
    login: string;
  },
  created_at: string;
}

/**
 * Tool input parameters for listing issues
 */
export interface ListIssuesParams {
  owner: string;
  repo: string;
  since: string;
}

/**
 * Tool input parameters for listing pull requests
 */
export interface ListPullRequestsParams {
  owner: string;
  repo: string;
  since: string;
}

/**
 * GitHub API error response
 */
export interface GitHubError {
  message: string;
  documentation_url?: string;
}
