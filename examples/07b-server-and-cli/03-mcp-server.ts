/**
 * MCP (Model Context Protocol) server — tools and resources
 *
 * This is a minimal stdio MCP server. To test it manually:
 *   bun examples/07b-server-and-cli/03-mcp-server.ts
 * (Then send JSON-RPC messages over stdin, or connect with an MCP client)
 *
 * Run as a demonstration (prints server info then exits):
 *   bun examples/07b-server-and-cli/03-mcp-server.ts --demo
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "filesystem-tools",
  version: "1.0.0",
});

// --- Tool: read file ---
server.tool(
  "read_file",
  "Read the text contents of a file",
  { path: z.string().describe("Absolute path to the file") },
  async ({ path }) => {
    const file = Bun.file(path);
    if (!(await file.exists())) {
      return { content: [{ type: "text" as const, text: `Error: ${path} not found` }], isError: true };
    }
    return { content: [{ type: "text" as const, text: await file.text() }] };
  },
);

// --- Tool: list directory ---
server.tool(
  "list_directory",
  "List files in a directory matching an optional glob pattern",
  {
    path:    z.string().describe("Directory path"),
    pattern: z.string().optional().describe("Glob pattern (default: *)"),
  },
  async ({ path, pattern = "*" }) => {
    const files = Array.from(new Bun.Glob(pattern).scanSync({ cwd: path }));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(files, null, 2) }],
    };
  },
);

// --- Tool: write file ---
server.tool(
  "write_file",
  "Write text content to a file (creates or overwrites)",
  {
    path:    z.string().describe("Absolute path to write"),
    content: z.string().describe("Text content to write"),
  },
  async ({ path, content }) => {
    await Bun.write(path, content);
    return { content: [{ type: "text" as const, text: `Written ${content.length} bytes to ${path}` }] };
  },
);

// --- Demo mode: print schema and exit without starting stdio transport ---
if (process.argv.includes("--demo")) {
  console.log("MCP Server:", server.server.name);
  console.log("Tools registered: read_file, list_directory, write_file");
  console.log("Run without --demo to start the stdio transport for an MCP host.");
  process.exit(0);
}

// --- Start server ---
const transport = new StdioServerTransport();
await server.connect(transport);
