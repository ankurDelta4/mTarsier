use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(
    name = "tsr",
    about = "mTarsier CLI — manage MCP servers from your terminal",
    version
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// List all MCP servers across configured clients
    List,

    /// Add a new MCP server
    Add {
        /// Server name
        name: String,
        /// Server URL or command
        url: String,
    },

    /// Ping an MCP server
    Ping {
        /// Server name
        name: String,
    },

    /// List detected MCP clients
    Clients,

    /// Show or edit the config for a client
    Config {
        /// Client ID (e.g. claude-desktop, cursor)
        client_id: String,
        /// Open config in $EDITOR
        #[arg(long)]
        edit: bool,
    },

    /// Install an MCP from the marketplace
    Install {
        /// MCP name from the marketplace
        name: String,
    },
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        None => {
            println!("mTarsier CLI — use --help to see available commands");
        }
        Some(Commands::List) => {
            eprintln!("tsr list: not yet implemented");
        }
        Some(Commands::Add { name, url }) => {
            eprintln!("tsr add {name} {url}: not yet implemented");
        }
        Some(Commands::Ping { name }) => {
            eprintln!("tsr ping {name}: not yet implemented");
        }
        Some(Commands::Clients) => {
            eprintln!("tsr clients: not yet implemented");
        }
        Some(Commands::Config { client_id, edit }) => {
            if edit {
                eprintln!("tsr config {client_id} --edit: not yet implemented");
            } else {
                eprintln!("tsr config {client_id}: not yet implemented");
            }
        }
        Some(Commands::Install { name }) => {
            eprintln!("tsr install {name}: not yet implemented");
        }
    }
}
