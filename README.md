# GitHub MCP Lightweight

A lightweight GitHub MCP (Model Context Protocol) server optimized for efficient issue and pull request analysis. This server provides minimal response sizes by returning only essential fields, making it perfect for bulk analysis of GitHub repositories.

## 🚀 Features

- **Lightweight responses**: 90%+ smaller than full GitHub API responses
- **Essential data only**: Returns only id, html_url, title, body, and comment bodies
- **Efficient bulk analysis**: Optimized for processing large numbers of issues/PRs
- **Simple setup**: Easy installation and configuration
- **Rate limit aware**: Built-in GitHub API rate limiting awareness

## 📦 Installation

```bash
npm install -g @wipiano/github-mcp-lightweight
```

## 🔧 Configuration

### 1. Get a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (for private repositories) or `public_repo` (for public repositories only)
   - `read:org` (if accessing organization repositories)
4. Copy the generated token

### 2. Configure MCP Settings

Add the server to your MCP settings configuration file:

**For Cline/Claude Dev:**
Edit `~/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "github-lightweight": {
      "command": "npx",
      "type": "stdio",
      "args": [
        "-y",
        "@wipiano/github-mcp-lightweight"
      ],
      "env": {
        "GITHUB_TOKEN": "ghp_your_personal_access_token_here"
      }
    }
  }
}
```

**For Claude Desktop:**
Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or equivalent:

```json
{
  "mcpServers": {
    "github-lightweight": {
      "command": "github-mcp-lightweight",
      "env": {
        "GITHUB_TOKEN": "ghp_your_personal_access_token_here"
      }
    }
  }
}
```

## 🛠️ Available Tools

### `list_repository_issues`

List issues from a GitHub repository with minimal response size.

**Parameters:**
- `owner` (string, required): Repository owner (username or organization)
- `repo` (string, required): Repository name
- `since` (string, required): Only show issues updated at or after this time (ISO 8601 format)

**Example:**
```json
{
  "owner": "microsoft",
  "repo": "vscode",
  "since": "2024-01-01T00:00:00Z"
}
```

### `list_repository_pull_requests`

List pull requests from a GitHub repository with minimal response size.

**Parameters:**
- `owner` (string, required): Repository owner (username or organization)
- `repo` (string, required): Repository name
- `since` (string, required): Only show pull requests updated at or after this time (ISO 8601 format)

**Example:**
```json
{
  "owner": "microsoft",
  "repo": "vscode",
  "since": "2024-01-01T00:00:00Z"
}
```

## 📊 Response Format

Both tools return a lightweight response containing only essential fields:

```json
{
  "repository": "owner/repo",
  "since": "2024-01-01T00:00:00Z",
  "total_issues": 42,
  "issues": [
    {
      "id": 123456789,
      "html_url": "https://github.com/owner/repo/issues/1",
      "title": "Issue title",
      "body": "Issue description...",
      "comments": [
        "First comment body...",
        "Second comment body..."
      ]
    }
  ]
}
```

## 🔄 Comparison with Full GitHub MCP

| Feature | Full GitHub MCP | Lightweight MCP |
|---------|----------------|-----------------|
| Response size | ~50+ fields per issue | 5 fields per issue |
| Bandwidth usage | High | Low (90%+ reduction) |
| Processing speed | Slower | Faster |
| Use case | Comprehensive operations | Bulk analysis |
| Comment data | Full metadata | Body text only |

## 🚨 Error Handling

The server provides clear error messages for common issues:

- **401 Unauthorized**: Invalid or expired GitHub token
- **403 Forbidden**: Rate limit exceeded or insufficient permissions
- **404 Not Found**: Repository not found or access denied

## 🔒 Security Best Practices

1. **Token Storage**: Store your GitHub token securely in environment variables
2. **Token Permissions**: Use minimal required scopes for your use case
3. **Token Rotation**: Regularly rotate your personal access tokens
4. **Environment Isolation**: Use different tokens for different environments

## 📈 Rate Limiting

- GitHub allows 5,000 requests per hour for authenticated requests
- The server is aware of rate limits and will provide appropriate error messages
- For large repositories, consider using more specific `since` parameters to reduce API calls

## 🐛 Troubleshooting

### Server won't start
- Verify `GITHUB_TOKEN` environment variable is set
- Check token permissions include required scopes
- Ensure token is not expired

### Authentication errors
- Regenerate your GitHub personal access token
- Verify token has access to the target repository
- Check if repository is private and token has `repo` scope

### Empty responses
- Verify repository exists and is accessible
- Check `since` parameter isn't too recent
- Ensure repository has issues/PRs updated after the `since` date

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/wipiano/github-mcp-lw)
- [npm Package](https://www.npmjs.com/package/@wipiano/github-mcp-lightweight)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
