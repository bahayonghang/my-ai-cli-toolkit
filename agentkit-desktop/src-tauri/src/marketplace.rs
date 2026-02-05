//! Marketplace Module
//!
//! Agent Skills Index API client for fetching community skills.
//!
//! Features:
//! - Browser-like headers to bypass Cloudflare protection
//! - Fallback to sample data when API is unavailable
//! - Graceful error handling with user-friendly messages

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use tracing::{debug, error, info, warn};

/// Base URL for Agent Skills Index public API
const AGENT_SKILLS_INDEX_BASE_URL: &str = "https://skillsmp.com/api/v1";

/// User-Agent string mimicking a real browser to bypass Cloudflare
const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/// Marketplace skill from API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceSkill {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub owner: String,
    pub repo: String,
    pub stars: u32,
    pub downloads: Option<u32>,
    pub categories: Vec<String>,
    pub platforms: Vec<String>,
    pub source: String,
    pub updated_at: String,
    #[serde(default)]
    pub installed: bool,
}

/// Query parameters for marketplace API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceQuery {
    #[serde(default = "default_sort")]
    pub sort_by: String,
    pub search: Option<String>,
    pub category: Option<String>,
    pub source: Option<String>,
    pub platform: Option<String>,
    #[serde(default = "default_page")]
    pub page: u32,
    #[serde(default = "default_per_page")]
    pub per_page: u32,
}

impl Default for MarketplaceQuery {
    fn default() -> Self {
        Self {
            sort_by: default_sort(),
            search: None,
            category: None,
            source: None,
            platform: None,
            page: default_page(),
            per_page: default_per_page(),
        }
    }
}

fn default_sort() -> String {
    "popular".to_string()
}

fn default_page() -> u32 {
    1
}

fn default_per_page() -> u32 {
    50
}

/// Filter options for marketplace
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MarketplaceFilters {
    pub category: Option<String>,
    pub source: Option<String>,
    pub platform: Option<String>,
    pub search: Option<String>,
}

/// Marketplace category
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceCategory {
    pub id: String,
    pub name: String,
    pub count: u32,
}

/// API response wrapper
#[derive(Debug, Clone, Deserialize)]
struct ApiResponse<T> {
    #[serde(default)]
    pub data: Option<T>,
    #[serde(default)]
    pub error: Option<serde_json::Value>,
}

/// Agent Skills Index API client
pub struct MarketplaceClient {
    client: reqwest::Client,
    base_url: String,
}

impl MarketplaceClient {
    /// Create a new marketplace client with browser-like configuration
    pub fn new() -> Self {
        use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, ACCEPT_LANGUAGE, USER_AGENT as UA};

        debug!("Creating MarketplaceClient with browser-like headers");

        let mut headers = HeaderMap::new();
        headers.insert(UA, HeaderValue::from_static(USER_AGENT));
        headers.insert(ACCEPT, HeaderValue::from_static("application/json, text/plain, */*"));
        headers.insert(ACCEPT_LANGUAGE, HeaderValue::from_static("en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7"));

        Self {
            client: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .default_headers(headers)
                .build()
                .unwrap_or_default(),
            base_url: AGENT_SKILLS_INDEX_BASE_URL.to_string(),
        }
    }

    /// Create client with custom base URL (for testing)
    #[allow(dead_code)]
    pub fn with_base_url(base_url: String) -> Self {
        use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, ACCEPT_LANGUAGE, USER_AGENT as UA};

        debug!(base_url = %base_url, "Creating MarketplaceClient with custom base URL");

        let mut headers = HeaderMap::new();
        headers.insert(UA, HeaderValue::from_static(USER_AGENT));
        headers.insert(ACCEPT, HeaderValue::from_static("application/json, text/plain, */*"));
        headers.insert(ACCEPT_LANGUAGE, HeaderValue::from_static("en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7"));

        Self {
            client: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .default_headers(headers)
                .build()
                .unwrap_or_default(),
            base_url,
        }
    }

    /// Fetch skills from Agent Skills Index API with fallback to sample data
    pub async fn fetch_skills(&self, query: &MarketplaceQuery) -> Result<Vec<MarketplaceSkill>> {
        debug!(query = ?query, "Fetching skills from marketplace");
        match self.fetch_skills_from_api(query).await {
            Ok(skills) => {
                info!(count = skills.len(), "Successfully fetched skills from API");
                Ok(skills)
            }
            Err(e) => {
                warn!(error = %e, "API request failed, using fallback data");
                // Return sample skills when API is unavailable
                Ok(default_skills())
            }
        }
    }

    /// Internal method to fetch skills from API
    async fn fetch_skills_from_api(&self, query: &MarketplaceQuery) -> Result<Vec<MarketplaceSkill>> {
        let has_search = query
            .search
            .as_ref()
            .map(|s| !s.trim().is_empty())
            .unwrap_or(false);
        let mut url = if has_search {
            format!("{}/skills/search", self.base_url)
        } else {
            format!("{}/skills", self.base_url)
        };

        // Build query parameters
        let mut params = vec![];

        if has_search {
            let search = query.search.as_ref().map(|s| s.trim()).unwrap_or("");
            if !search.is_empty() {
                params.push(format!("q={}", urlencoding::encode(search)));
            }
            params.push(format!("page={}", query.page));
            if query.per_page > 0 {
                params.push(format!("limit={}", query.per_page));
            }
            if let Some(sort_by) = map_search_sort_param(&query.sort_by) {
                params.push(format!("sortBy={}", sort_by));
            }
        } else {
            params.push(format!("sort={}", map_sort_param(&query.sort_by)));
            params.push(format!("order={}", map_sort_order(&query.sort_by)));
            params.push(format!("page={}", query.page));
            if query.per_page > 0 {
                params.push(format!("limit={}", query.per_page));
            }

            if let Some(ref category) = query.category {
                if !category.is_empty() && category != "all" {
                    params.push(format!("category={}", urlencoding::encode(category)));
                }
            }

            if let Some(ref platform) = query.platform {
                if !platform.is_empty() && platform != "all" {
                    params.push(format!("platform={}", urlencoding::encode(platform)));
                }
            }
        }

        if !params.is_empty() {
            url = format!("{}?{}", url, params.join("&"));
        }

        debug!(url = %url, "Sending API request");

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| {
                error!(error = %e, "Network error during API request");
                anyhow!("Network error: {} (check your internet connection)", e)
            })?;

        let status = response.status();
        debug!(status = %status, "Received API response");

        if !status.is_success() {
            // Provide more helpful error messages based on status code
            let error_msg = match status.as_u16() {
                403 => {
                    warn!("API access blocked by Cloudflare protection");
                    "API access blocked (Cloudflare protection). Using offline data.".to_string()
                }
                404 => {
                    warn!("API endpoint not found");
                    "API endpoint not found. The service may have moved.".to_string()
                }
                429 => {
                    warn!("Rate limited by API");
                    "Rate limited. Please try again later.".to_string()
                }
                500..=599 => {
                    error!(status = %status, "Server error from API");
                    format!("Server error ({}). The service may be temporarily down.", status)
                }
                _ => {
                    error!(status = %status, "API request failed");
                    format!("API request failed with status: {}", status)
                }
            };
            return Err(anyhow!(error_msg));
        }

        // Try to parse as array directly first (common API pattern)
        let text = response.text().await?;
        debug!(response_length = text.len(), "Received response body");

        parse_skills_response(&text)
    }

    /// Search skills with keyword
    pub async fn search_skills(
        &self,
        keyword: &str,
        filters: &MarketplaceFilters,
    ) -> Result<Vec<MarketplaceSkill>> {
        info!(keyword = %keyword, filters = ?filters, "Searching marketplace skills");
        let query = MarketplaceQuery {
            search: Some(keyword.to_string()),
            category: filters.category.clone(),
            source: filters.source.clone(),
            platform: filters.platform.clone(),
            ..Default::default()
        };

        self.fetch_skills(&query).await
    }

    /// Get available categories
    pub async fn get_categories(&self) -> Result<Vec<MarketplaceCategory>> {
        debug!("Fetching marketplace categories");
        let url = format!("{}/categories", self.base_url);

        let response = self
            .client
            .get(&url)
            .header("Accept", "application/json")
            .send()
            .await
            .map_err(|e| {
                error!(error = %e, "Failed to fetch categories");
                anyhow!("Failed to fetch categories: {}", e)
            })?;

        if !response.status().is_success() {
            warn!(status = %response.status(), "Categories API failed, using defaults");
            // Return default categories if API fails
            return Ok(default_categories());
        }

        let text = response.text().await?;
        parse_categories_response(&text).or_else(|e| {
            warn!(error = %e, "Failed to parse categories response, using defaults");
            Ok(default_categories())
        })
    }
}

impl Default for MarketplaceClient {
    fn default() -> Self {
        Self::new()
    }
}

fn map_sort_param(sort_by: &str) -> &'static str {
    match sort_by {
        "latest" => "updated",
        "trending" => "updated",
        "top" => "stars",
        _ => "stars",
    }
}

fn map_sort_order(sort_by: &str) -> &'static str {
    match sort_by {
        "name" => "asc",
        _ => "desc",
    }
}

fn map_search_sort_param(sort_by: &str) -> Option<&'static str> {
    match sort_by {
        "latest" | "trending" => Some("recent"),
        "top" | "popular" => Some("stars"),
        _ => None,
    }
}

fn parse_skills_response(text: &str) -> Result<Vec<MarketplaceSkill>> {
    // Try direct array of expected struct
    if let Ok(skills) = serde_json::from_str::<Vec<MarketplaceSkill>>(text) {
        debug!(count = skills.len(), "Parsed skills as direct array");
        return Ok(skills);
    }

    // Try wrapped response
    if let Ok(api_response) = serde_json::from_str::<ApiResponse<Vec<MarketplaceSkill>>>(text) {
        if let Some(error) = api_response.error {
            let message = format_api_error(&error);
            error!(error = %message, "API returned error");
            return Err(anyhow!("API error: {}", message));
        }
        let skills = api_response.data.unwrap_or_default();
        debug!(count = skills.len(), "Parsed skills from wrapped response");
        return Ok(skills);
    }

    // Try value-based parsing for alternate field names
    let value: serde_json::Value = serde_json::from_str(text)?;
    if let Some(error) = value.get("error") {
        let message = format_api_error(error);
        error!(error = %message, "API returned error");
        return Err(anyhow!("API error: {}", message));
    }
    if let Some(skills) = parse_skills_from_value(&value) {
        debug!(count = skills.len(), "Parsed skills from value");
        return Ok(skills);
    }

    warn!("Failed to parse API response, unable to map skills");
    Err(anyhow!("Unexpected API response format"))
}

fn parse_skills_from_value(value: &serde_json::Value) -> Option<Vec<MarketplaceSkill>> {
    match value {
        serde_json::Value::Array(items) => Some(
            items
                .iter()
                .filter_map(normalize_skill_from_value)
                .collect(),
        ),
        serde_json::Value::Object(map) => {
            if let Some(data) = map.get("data") {
                return parse_skills_from_value(data);
            }
            if let Some(items) = map.get("skills") {
                return parse_skills_from_value(items);
            }
            None
        }
        _ => None,
    }
}

fn normalize_skill_from_value(value: &serde_json::Value) -> Option<MarketplaceSkill> {
    let obj = value.as_object()?;

    let owner = obj
        .get("owner")
        .and_then(|v| v.as_str())
        .or_else(|| obj.get("github_owner").and_then(|v| v.as_str()))
        .unwrap_or_default()
        .to_string();
    let repo = obj
        .get("repo")
        .and_then(|v| v.as_str())
        .or_else(|| obj.get("github_repo").and_then(|v| v.as_str()))
        .unwrap_or_default()
        .to_string();

    if owner.is_empty() || repo.is_empty() {
        return None;
    }

    let name = obj
        .get("name")
        .and_then(|v| v.as_str())
        .filter(|s| !s.is_empty())
        .unwrap_or(&repo)
        .to_string();

    let description = obj
        .get("description")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let stars = obj
        .get("stars")
        .and_then(|v| v.as_u64())
        .unwrap_or(0) as u32;

    let downloads = obj
        .get("downloads")
        .and_then(|v| v.as_u64())
        .map(|v| v as u32);

    let categories = extract_string_list(obj.get("categories"));
    let platforms = extract_string_list(obj.get("platforms"));

    let source = normalize_source(
        obj.get("source")
            .and_then(|v| v.as_str())
            .unwrap_or("community"),
    );

    let updated_at = obj
        .get("updated_at")
        .and_then(|v| v.as_str())
        .or_else(|| obj.get("updatedAt").and_then(|v| v.as_str()))
        .or_else(|| obj.get("updated").and_then(|v| v.as_str()))
        .unwrap_or_default()
        .to_string();

    let id = obj
        .get("id")
        .and_then(|v| v.as_str())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .unwrap_or_else(|| format!("{}/{}", owner, repo));

    let installed = obj
        .get("installed")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    Some(MarketplaceSkill {
        id,
        name,
        description,
        owner,
        repo,
        stars,
        downloads,
        categories,
        platforms,
        source,
        updated_at,
        installed,
    })
}

fn extract_string_list(value: Option<&serde_json::Value>) -> Vec<String> {
    let mut result = Vec::new();
    let Some(value) = value else {
        return result;
    };

    match value {
        serde_json::Value::Array(items) => {
            for item in items {
                if let Some(text) = item.as_str() {
                    result.push(text.to_string());
                    continue;
                }
                if let Some(obj) = item.as_object() {
                    if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                        result.push(name.to_string());
                        continue;
                    }
                    if let Some(slug) = obj.get("slug").and_then(|v| v.as_str()) {
                        result.push(slug.to_string());
                    }
                }
            }
        }
        serde_json::Value::String(text) => {
            result.push(text.to_string());
        }
        _ => {}
    }

    result
}

fn normalize_source(source: &str) -> String {
    match source {
        "official" | "community" | "vercel-labs" => source.to_string(),
        _ => "community".to_string(),
    }
}

fn parse_categories_response(text: &str) -> Result<Vec<MarketplaceCategory>> {
    if let Ok(categories) = serde_json::from_str::<Vec<MarketplaceCategory>>(text) {
        info!(count = categories.len(), "Fetched categories from API");
        return Ok(categories);
    }

    if let Ok(api_response) = serde_json::from_str::<ApiResponse<Vec<MarketplaceCategory>>>(text)
    {
        if let Some(error) = api_response.error {
            let message = format_api_error(&error);
            error!(error = %message, "API returned error");
            return Err(anyhow!("API error: {}", message));
        }
        if let Some(data) = api_response.data {
            info!(count = data.len(), "Fetched categories from wrapped response");
            return Ok(data);
        }
    }

    let value: serde_json::Value = serde_json::from_str(text)?;
    if let Some(error) = value.get("error") {
        let message = format_api_error(error);
        error!(error = %message, "API returned error");
        return Err(anyhow!("API error: {}", message));
    }
    if let Some(categories) = parse_categories_from_value(&value) {
        info!(count = categories.len(), "Parsed categories from value");
        return Ok(categories);
    }

    Err(anyhow!("Unexpected categories response format"))
}

fn parse_categories_from_value(value: &serde_json::Value) -> Option<Vec<MarketplaceCategory>> {
    match value {
        serde_json::Value::Array(items) => Some(
            items
                .iter()
                .filter_map(normalize_category_from_value)
                .collect(),
        ),
        serde_json::Value::Object(map) => {
            if let Some(data) = map.get("data") {
                return parse_categories_from_value(data);
            }
            if let Some(items) = map.get("categories") {
                return parse_categories_from_value(items);
            }
            None
        }
        _ => None,
    }
}

fn normalize_category_from_value(value: &serde_json::Value) -> Option<MarketplaceCategory> {
    if let Some(text) = value.as_str() {
        let id = text.to_lowercase().replace(' ', "-");
        return Some(MarketplaceCategory {
            id,
            name: text.to_string(),
            count: 0,
        });
    }

    let obj = value.as_object()?;
    let name = obj
        .get("name")
        .and_then(|v| v.as_str())
        .or_else(|| obj.get("title").and_then(|v| v.as_str()))
        .or_else(|| obj.get("slug").and_then(|v| v.as_str()))
        .unwrap_or_default()
        .to_string();

    if name.is_empty() {
        return None;
    }

    let id = obj
        .get("id")
        .and_then(|v| v.as_str())
        .or_else(|| obj.get("slug").and_then(|v| v.as_str()))
        .unwrap_or_else(|| name.as_str())
        .to_string();

    let count = obj
        .get("skillCount")
        .or_else(|| obj.get("count"))
        .and_then(|v| v.as_u64())
        .unwrap_or(0) as u32;

    Some(MarketplaceCategory { id, name, count })
}

fn format_api_error(error: &serde_json::Value) -> String {
    if let Some(message) = error.get("message").and_then(|v| v.as_str()) {
        return message.to_string();
    }
    if let Some(message) = error.as_str() {
        return message.to_string();
    }
    error.to_string()
}

/// Default categories when API is unavailable
fn default_categories() -> Vec<MarketplaceCategory> {
    vec![
        MarketplaceCategory {
            id: "web".to_string(),
            name: "Web Development".to_string(),
            count: 0,
        },
        MarketplaceCategory {
            id: "ai".to_string(),
            name: "AI/ML".to_string(),
            count: 0,
        },
        MarketplaceCategory {
            id: "devops".to_string(),
            name: "DevOps".to_string(),
            count: 0,
        },
        MarketplaceCategory {
            id: "mobile".to_string(),
            name: "Mobile".to_string(),
            count: 0,
        },
        MarketplaceCategory {
            id: "database".to_string(),
            name: "Database".to_string(),
            count: 0,
        },
        MarketplaceCategory {
            id: "testing".to_string(),
            name: "Testing".to_string(),
            count: 0,
        },
    ]
}

/// Default/sample skills when API is unavailable (offline mode)
fn default_skills() -> Vec<MarketplaceSkill> {
    vec![
        MarketplaceSkill {
            id: "anthropics/claude-code".to_string(),
            name: "Claude Code".to_string(),
            description: Some("Official Claude Code skills and workflows for AI-assisted development".to_string()),
            owner: "anthropics".to_string(),
            repo: "claude-code".to_string(),
            stars: 5000,
            downloads: Some(10000),
            categories: vec!["ai".to_string(), "development".to_string()],
            platforms: vec!["claude".to_string()],
            source: "official".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
            installed: false,
        },
        MarketplaceSkill {
            id: "anthropics/prompt-engineering".to_string(),
            name: "Prompt Engineering".to_string(),
            description: Some("Best practices and templates for effective prompt engineering".to_string()),
            owner: "anthropics".to_string(),
            repo: "prompt-engineering".to_string(),
            stars: 3500,
            downloads: Some(8000),
            categories: vec!["ai".to_string()],
            platforms: vec!["claude".to_string(), "gemini".to_string()],
            source: "official".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
            installed: false,
        },
        MarketplaceSkill {
            id: "community/web-developer".to_string(),
            name: "Web Developer".to_string(),
            description: Some("Full-stack web development skills with React, Vue, and Node.js".to_string()),
            owner: "community".to_string(),
            repo: "web-developer".to_string(),
            stars: 2800,
            downloads: Some(6000),
            categories: vec!["web".to_string(), "development".to_string()],
            platforms: vec!["claude".to_string(), "codex".to_string()],
            source: "community".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
            installed: false,
        },
        MarketplaceSkill {
            id: "community/rust-expert".to_string(),
            name: "Rust Expert".to_string(),
            description: Some("Advanced Rust programming patterns and best practices".to_string()),
            owner: "community".to_string(),
            repo: "rust-expert".to_string(),
            stars: 2200,
            downloads: Some(4500),
            categories: vec!["development".to_string()],
            platforms: vec!["claude".to_string()],
            source: "community".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
            installed: false,
        },
        MarketplaceSkill {
            id: "community/devops-toolkit".to_string(),
            name: "DevOps Toolkit".to_string(),
            description: Some("CI/CD, Docker, Kubernetes, and infrastructure automation skills".to_string()),
            owner: "community".to_string(),
            repo: "devops-toolkit".to_string(),
            stars: 1800,
            downloads: Some(3500),
            categories: vec!["devops".to_string()],
            platforms: vec!["claude".to_string(), "codex".to_string()],
            source: "community".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
            installed: false,
        },
        MarketplaceSkill {
            id: "community/python-data-science".to_string(),
            name: "Python Data Science".to_string(),
            description: Some("Data analysis, visualization, and machine learning with Python".to_string()),
            owner: "community".to_string(),
            repo: "python-data-science".to_string(),
            stars: 1500,
            downloads: Some(3000),
            categories: vec!["ai".to_string(), "database".to_string()],
            platforms: vec!["claude".to_string(), "gemini".to_string()],
            source: "community".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
            installed: false,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_marketplace_query_default() {
        let query = MarketplaceQuery::default();
        assert_eq!(query.sort_by, "popular");
        assert_eq!(query.page, 1);
        assert_eq!(query.per_page, 50);
    }

    #[test]
    fn test_marketplace_skill_serialization() {
        let skill = MarketplaceSkill {
            id: "test-skill".to_string(),
            name: "Test Skill".to_string(),
            description: Some("A test skill".to_string()),
            owner: "test-owner".to_string(),
            repo: "test-repo".to_string(),
            stars: 100,
            downloads: Some(500),
            categories: vec!["web".to_string()],
            platforms: vec!["claude".to_string()],
            source: "community".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            installed: false,
        };

        let json = serde_json::to_string(&skill).unwrap();
        assert!(json.contains("test-skill"));
        assert!(json.contains("Test Skill"));
    }

    #[test]
    fn test_default_categories() {
        let categories = default_categories();
        assert!(!categories.is_empty());
        assert!(categories.iter().any(|c| c.id == "web"));
    }
}
