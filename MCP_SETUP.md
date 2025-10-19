# MCP Server Configuration for Supabase

## Overview

This project is configured to use the **Model Context Protocol (MCP)** server for Supabase, providing full read/write/edit/delete access to your Supabase database through compatible MCP clients (like Claude Desktop, Cline, or other MCP-enabled tools).

## Setup Instructions

### 1. Get Your Supabase Credentials

You need two pieces of information from your Supabase project:

#### A. Project Reference ID
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **General**
4. Copy your **Reference ID** (looks like: `abcdefghijklmnop`)

#### B. Personal Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Click **Generate new token**
3. Give it a name (e.g., "MCP Server Access")
4. Set appropriate permissions:
   - ✅ Read access to database
   - ✅ Write access to database
   - ✅ Manage database schemas
5. Click **Generate token**
6. **Copy the token immediately** (you won't be able to see it again!)

### 2. Configure the MCP Server

The MCP configuration file is located at `mcp.json` in the project root.

**Replace the placeholders with your actual credentials:**

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=YOUR_PROJECT_REF_HERE"  // ← Replace with your Reference ID
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN_HERE"  // ← Replace with your token
      }
    }
  }
}
```

**Example with real values:**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=abcdefghijklmnop"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_1234567890abcdef1234567890abcdef"
      }
    }
  }
}
```

### 3. Using the MCP Server

The MCP server will be automatically discovered and used by MCP-compatible clients:

#### Claude Desktop
1. Restart Claude Desktop
2. The Supabase MCP server will appear in the available tools
3. You can now ask Claude to:
   - Query your database
   - Create/update/delete records
   - Manage schemas
   - Execute SQL queries

#### Cline (VS Code Extension)
1. Restart VS Code or reload the window
2. Cline will automatically detect the MCP server
3. Use natural language to interact with your database

#### Other MCP Clients
Any MCP-compatible client that reads `mcp.json` in the project root will automatically connect.

## Features & Capabilities

The Supabase MCP server provides:

### ✅ Full Database Access
- **Read**: Query tables, views, and functions
- **Write**: Insert new records
- **Update**: Modify existing records
- **Delete**: Remove records
- **Schema Management**: Create/alter tables, indexes, policies

### ✅ Available Operations
- Execute raw SQL queries
- List all tables and schemas
- Describe table structures
- Manage Row Level Security (RLS) policies
- Create and manage database functions
- Handle migrations
- View and modify data

### ✅ Security
- Uses personal access tokens (never service role keys)
- Respects your Supabase project's RLS policies
- All operations are logged in Supabase dashboard

## Security Best Practices

### 🔒 Protecting Your Credentials

1. **Never commit `mcp.json` to Git**
   - Already added to `.gitignore`
   - Use `mcp.json.example` for sharing templates

2. **Use a template file**
   - Copy `.vscode/mcp.json.example` to `.vscode/mcp.json`
   - Fill in your credentials locally

3. **Rotate tokens regularly**
   - Generate new tokens periodically
   - Revoke old tokens in Supabase dashboard

4. **Use least-privilege tokens**
   - Only grant permissions needed for your workflow
   - Create separate tokens for different purposes

### 🔐 Token Permissions

For MCP server usage, your token needs:
- ✅ **Database Read** - Query data and schemas
- ✅ **Database Write** - Insert/update/delete records
- ✅ **Schema Management** - Create/alter tables (if needed)

For read-only access, you can disable write permissions.

## Troubleshooting

### MCP Server Not Appearing

1. **Check file location**: Ensure `mcp.json` is in the project root directory
2. **Verify JSON syntax**: Use a JSON validator
3. **Restart client**: Completely restart your MCP client (Claude Desktop, Cline, etc.)
4. **Check credentials**: Verify project ref and token are correct

### Connection Errors

1. **Invalid token**: Generate a new token in Supabase dashboard
2. **Wrong project ref**: Double-check your Reference ID
3. **Network issues**: Ensure you can access Supabase dashboard
4. **Permissions**: Verify token has required permissions

### Permission Denied

1. **Check RLS policies**: Your token must respect RLS rules
2. **Verify token scope**: Ensure token has needed permissions
3. **Review Supabase logs**: Check dashboard for detailed errors

## Alternative: Environment Variables

You can also use environment variables instead of hardcoding in the JSON:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=${SUPABASE_PROJECT_REF}"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

Then set environment variables in your system or `.env` file.

## Commands Reference

### Manual MCP Server Test
```bash
# Test the MCP server connection
npx -y @supabase/mcp-server-supabase@latest --project-ref=YOUR_REF
```

### List Available Tools
Once connected, the MCP server exposes these tools:
- `supabase_query` - Execute SQL queries
- `supabase_list_tables` - List all tables
- `supabase_describe_table` - Get table schema
- `supabase_insert` - Insert records
- `supabase_update` - Update records
- `supabase_delete` - Delete records
- And more...

## Example Usage with Claude Desktop

```
User: "Show me all tables in my Supabase database"
Claude: [Uses supabase_list_tables tool]

User: "Get the first 10 users from the profiles table"
Claude: [Uses supabase_query with SELECT * FROM profiles LIMIT 10]

User: "Create a new series called 'My Novel'"
Claude: [Uses supabase_insert on series table]
```

## Resources

- **Supabase MCP Server**: https://github.com/supabase/mcp-server-supabase
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Supabase Docs**: https://supabase.com/docs
- **Token Management**: https://supabase.com/dashboard/account/tokens

## Support

For issues with:
- **MCP Server**: Check Supabase MCP repository
- **Claude Desktop**: Check Anthropic documentation
- **This Project**: Check project documentation or create an issue

---

**⚠️ Important**: Keep your `mcp.json` file private. Never share or commit it with credentials!
