// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // Fix PATH for GUI apps on macOS/Linux — sourced from the login shell so
  // tools in /opt/homebrew/bin, ~/.local/bin, ~/.cargo/bin, etc. are visible.
  fix_path_env::fix().ok();
  app_lib::run();
}
