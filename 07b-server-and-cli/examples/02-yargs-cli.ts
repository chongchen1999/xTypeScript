/**
 * Yargs CLI — subcommands, options, validation
 * Run: bun examples/07b-server-and-cli/02-yargs-cli.ts -- --help
 *      bun examples/07b-server-and-cli/02-yargs-cli.ts -- user create Alice --role admin
 *      bun examples/07b-server-and-cli/02-yargs-cli.ts -- deploy staging --tag v1.2.3
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// In-memory "database" for demo purposes
const users: Array<{ id: number; name: string; role: string }> = [
  { id: 1, name: "Alice", role: "admin" },
  { id: 2, name: "Bob",   role: "user"  },
];

yargs(hideBin(process.argv))
  .scriptName("mytool")
  .usage("$0 <command> [options]")

  // --- user subcommand group ---
  .command("user", "Manage users", (yargs) =>
    yargs
      .command(
        "list",
        "List all users",
        (y) => y.option("role", { type: "string", describe: "Filter by role" }),
        (argv) => {
          const filtered = argv.role
            ? users.filter(u => u.role === argv.role)
            : users;
          console.table(filtered);
        },
      )
      .command(
        "create <name>",
        "Create a new user",
        (y) =>
          y
            .positional("name", { type: "string", demandOption: true })
            .option("role", {
              alias: "r",
              choices: ["admin", "user", "guest"] as const,
              default: "user" as const,
            }),
        (argv) => {
          const user = { id: Date.now(), name: argv.name!, role: argv.role };
          users.push(user);
          console.log(`Created user:`, user);
        },
      )
      .demandCommand(1, "Specify a user subcommand")
  )

  // --- deploy subcommand ---
  .command(
    "deploy <env>",
    "Deploy to an environment",
    (y) =>
      y
        .positional("env", {
          choices: ["staging", "production"] as const,
          demandOption: true,
        })
        .option("tag", { type: "string", demandOption: true, describe: "Git tag to deploy" })
        .option("dry-run", { type: "boolean", default: false })
        .check((argv) => {
          if (argv.env === "production" && !argv.tag.match(/^v\d+\.\d+\.\d+$/)) {
            throw new Error("Production deployments require a semver tag (e.g. v1.2.3)");
          }
          return true;
        }),
    (argv) => {
      if (argv["dry-run"]) {
        console.log(`[DRY RUN] Would deploy ${argv.tag} to ${argv.env}`);
      } else {
        console.log(`Deploying ${argv.tag} to ${argv.env}...`);
      }
    },
  )

  .demandCommand(1, "Please provide a command")
  .strict()
  .help()
  .parse();
