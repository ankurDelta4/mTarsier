use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Clone)]
pub struct ServerEntry {
    pub enabled: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub externally_removed: Option<bool>,
    pub config: Value,
}

fn mtarsier_store_path(store_key: &str) -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or_else(|| "Cannot find home directory".to_string())?;
    Ok(home.join(".mtarsier/clients").join(format!("{}.json", store_key)))
}

/// Non-command helper — callable from tsr.rs binary.
pub fn read_store(store_key: &str) -> Result<HashMap<String, ServerEntry>, String> {
    let path = mtarsier_store_path(store_key)?;
    if !path.exists() {
        return Ok(HashMap::new());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

/// Non-command helper — callable from tsr.rs binary.
pub fn write_store(store_key: &str, store: &HashMap<String, ServerEntry>) -> Result<(), String> {
    let path = mtarsier_store_path(store_key)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let content = serde_json::to_string_pretty(store).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_mtarsier_store(store_key: String) -> Result<HashMap<String, ServerEntry>, String> {
    read_store(&store_key)
}

#[tauri::command]
pub fn write_mtarsier_store(
    store_key: String,
    store: HashMap<String, ServerEntry>,
) -> Result<(), String> {
    write_store(&store_key, &store)
}
