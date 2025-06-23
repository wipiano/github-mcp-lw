# Publishing Guide

This document contains instructions for publishing the GitHub MCP Lightweight server to npm.

## Prerequisites

1. **npm Account**: Ensure you're logged into npm with the `wipiano` account
   ```bash
   npm whoami
   # Should return: wipiano
   ```

2. **Login if needed**:
   ```bash
   npm login
   ```

## Publishing Steps

1. **Final Build**: Ensure the latest build is ready
   ```bash
   npm run build
   ```

2. **Version Check**: Verify the version in package.json is correct
   ```bash
   npm version patch  # for patch updates
   npm version minor  # for minor updates  
   npm version major  # for major updates
   ```

3. **Dry Run**: Test the package contents
   ```bash
   npm pack --dry-run
   ```

4. **Publish**: Publish to npm
   ```bash
   npm publish --access public
   ```

## Post-Publishing

1. **Verify Installation**: Test the global installation
   ```bash
   npm install -g @wipiano/github-mcp-lightweight
   github-mcp-lightweight --version
   ```

2. **Update Documentation**: Update any version references in README.md if needed

3. **Tag Release**: Create a git tag for the release
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Troubleshooting

- **403 Forbidden**: Check npm login and package name availability
- **Version Conflict**: Increment version number in package.json
- **Build Errors**: Run `npm run build` and fix any TypeScript errors

## Package Information

- **Package Name**: `@wipiano/github-mcp-lightweight`
- **Registry**: https://www.npmjs.com/
- **Scope**: `@wipiano`
- **License**: MIT
