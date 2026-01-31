//! Marketplace Module
//!
//! SkillsMP API client for fetching community skills from https://skillsmp.com/
//!
//! Features:
//! - Browser-like headers to bypass Cloudflare protection
//! - Fallback to sample data when API is unavailable
//! - Graceful error handling with user-friendly messages

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use tracing::{debug, error, info, warn};

/// Base URL for SkillsMP API
const SKILLSMP_BASE_URL: &str = "https://skillsmp.com/api";

/// User-Agent string mimicking a real browser to bypass Cloudflare
const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/// Marketplace skill from SkillsMP API
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
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
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
    pub error: Option<String>,
}

/// SkillsMP API client
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
            base_url: SKILLSMP_BASE_URL.to_string(),
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

    /// Fetch skills from SkillsMP API with fallback to sample data
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
        let mut url = format!("{}/skills", self.base_url);

        // Build query parameters
        let mut params = vec![];

        if let Some(ref search) = query.search {
            if !search.is_empty() {
                params.push(format!("q={}", urlencoding::encode(search)));
            }
        }

        params.push(format!("sort={}", query.sort_by));
        params.push(format!("page={}", query.page));
        params.push(format!("per_page={}", query.per_page));

        if let Some(ref category) = query.category {
            params.push(format!("category={}", urlencoding::encode(category)));
        }

        if let Some(ref source) = query.source {
            params.push(format!("source={}", urlencoding::encode(source)));
        }

        if let Some(ref platform) = query.platform {
            params.push(format!("platform={}", urlencoding::encode(platform)));
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

        // Try parsing as direct array
        if let Ok(skills) = serde_json::from_str::<Vec<MarketplaceSkill>>(&text) {
            debug!(count = skills.len(), "Parsed skills as direct array");
            return Ok(skills);
        }

        // Try parsing as wrapped response
        if let Ok(api_response) = serde_json::from_str::<ApiResponse<Vec<MarketplaceSkill>>>(&text)
        {
            if let Some(error) = api_response.error {
                error!(error = %error, "API returned error");
                return Err(anyhow!("API error: {}", error));
            }
            let skills = api_response.data.unwrap_or_default();
            debug!(count = skills.len(), "Parsed skills from wrapped response");
            return Ok(skills);
        }

        // Return empty if parsing fails
        warn!("Failed to parse API response, returning empty list");
        Ok(vec![])
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

        // Try parsing as direct array
        if let Ok(categories) = serde_json::from_str::<Vec<MarketplaceCategory>>(&text) {
            info!(count = categories.len(), "Fetched categories from API");
            return Ok(categories);
        }

        // Try parsing as wrapped response
        if let Ok(api_response) =
            serde_json::from_str::<ApiResponse<Vec<MarketplaceCategory>>>(&text)
        {
            if let Some(data) = api_response.data {
                info!(count = data.len(), "Fetched categories from wrapped response");
                return Ok(data);
            }
        }

        // Return default categories
        warn!("Failed to parse categories response, using defaults");
        Ok(default_categories())
    }
}

impl Default for MarketplaceClient {
    fn default() -> Self {
        Self::new()
    }
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
