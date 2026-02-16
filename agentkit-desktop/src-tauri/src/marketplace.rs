//! Marketplace Module
//!
//! Dual-source marketplace client:
//! - Primary source: skills.sh (leaderboard + search)
//! - Fallback source: skillsmp.com API (legacy)

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use tracing::{debug, error, info, warn};

/// Base URL for Agent Skills Index public API (fallback source)
const AGENT_SKILLS_INDEX_BASE_URL: &str = "https://skillsmp.com/api/v1";
/// Base URL for skills.sh (primary source)
const SKILLS_SH_BASE_URL: &str = "https://skills.sh";

/// User-Agent string mimicking a real browser to bypass Cloudflare checks
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
    #[serde(rename = "updatedAt", alias = "updated_at", default)]
    pub updated_at: String,
    #[serde(default)]
    pub installed: bool,
    #[serde(default)]
    pub skill: Option<String>,
    #[serde(rename = "metricLabel", alias = "metric_label", default)]
    pub metric_label: Option<String>,
    #[serde(rename = "metricValue", alias = "metric_value", default)]
    pub metric_value: Option<String>,
    #[serde(rename = "metricDelta", alias = "metric_delta", default)]
    pub metric_delta: Option<String>,
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
    "hot".to_string()
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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SkillsShSort {
    Hot,
    Trending,
    AllTime,
}

impl SkillsShSort {
    fn from_query_sort(sort_by: &str) -> Self {
        match sort_by {
            "trending" => SkillsShSort::Trending,
            "all_time" => SkillsShSort::AllTime,
            _ => SkillsShSort::Hot,
        }
    }

    fn path(self) -> &'static str {
        match self {
            SkillsShSort::Hot => "/hot",
            SkillsShSort::Trending => "/trending",
            SkillsShSort::AllTime => "/",
        }
    }

    fn label(self) -> &'static str {
        match self {
            SkillsShSort::Hot => "1H",
            SkillsShSort::Trending => "24H Installs",
            SkillsShSort::AllTime => "Installs",
        }
    }
}

pub fn is_skills_sh_sort(sort_by: &str) -> bool {
    matches!(sort_by, "hot" | "trending" | "all_time")
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProviderUsed {
    SkillsSh,
    SkillsMp,
    Offline,
}

pub struct FetchResult {
    pub skills: Vec<MarketplaceSkill>,
    pub provider: ProviderUsed,
}

#[derive(Debug, Clone, Deserialize)]
struct SkillsShSearchResponse {
    #[serde(default)]
    skills: Vec<SkillsShSearchItem>,
}

#[derive(Debug, Clone, Deserialize)]
struct SkillsShSearchItem {
    id: String,
    #[serde(rename = "skillId")]
    skill_id: Option<String>,
    name: Option<String>,
    installs: Option<u64>,
    source: Option<String>,
}

struct SkillsShClient {
    client: reqwest::Client,
    base_url: String,
}

impl SkillsShClient {
    fn new(client: reqwest::Client) -> Self {
        Self {
            client,
            base_url: SKILLS_SH_BASE_URL.to_string(),
        }
    }

    #[cfg(test)]
    fn with_base_url(client: reqwest::Client, base_url: String) -> Self {
        Self { client, base_url }
    }

    async fn fetch_skills(&self, query: &MarketplaceQuery) -> Result<Vec<MarketplaceSkill>> {
        let search = query.search.as_deref().unwrap_or("").trim();
        if !search.is_empty() {
            return self.search_skills(search, query.per_page).await;
        }

        self.fetch_leaderboard(SkillsShSort::from_query_sort(&query.sort_by))
            .await
    }

    async fn fetch_leaderboard(&self, sort: SkillsShSort) -> Result<Vec<MarketplaceSkill>> {
        let url = format!("{}{}", self.base_url, sort.path());
        debug!(url = %url, ?sort, "Fetching skills.sh leaderboard");

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| anyhow!("skills.sh leaderboard network error: {}", e))?;
        if !response.status().is_success() {
            return Err(anyhow!(
                "skills.sh leaderboard request failed with status {}",
                response.status()
            ));
        }

        let text = response.text().await?;
        parse_skills_sh_leaderboard_html(&text, sort)
    }

    async fn search_skills(&self, keyword: &str, limit: u32) -> Result<Vec<MarketplaceSkill>> {
        let trimmed = keyword.trim();
        if trimmed.len() < 2 {
            return Err(anyhow!("Query must be at least 2 characters"));
        }

        let effective_limit = limit.max(1);
        let url = format!(
            "{}/api/search?q={}&limit={}",
            self.base_url,
            urlencoding::encode(trimmed),
            effective_limit
        );
        debug!(url = %url, "Searching skills.sh API");

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| anyhow!("skills.sh search network error: {}", e))?;
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(anyhow!(
                "skills.sh search failed with status {}: {}",
                status,
                body
            ));
        }

        let text = response.text().await?;
        parse_skills_sh_search_response(&text)
    }
}

/// Marketplace API client with skills.sh primary source and skillsmp fallback source.
pub struct MarketplaceClient {
    client: reqwest::Client,
    base_url: String,
    skills_sh: SkillsShClient,
}

impl MarketplaceClient {
    /// Build default browser-like HTTP headers shared by all client constructors
    fn build_default_headers() -> reqwest::header::HeaderMap {
        use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, ACCEPT_LANGUAGE, USER_AGENT as UA};

        let mut headers = HeaderMap::new();
        headers.insert(UA, HeaderValue::from_static(USER_AGENT));
        headers.insert(
            ACCEPT,
            HeaderValue::from_static("application/json, text/plain, */*"),
        );
        headers.insert(
            ACCEPT_LANGUAGE,
            HeaderValue::from_static("en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7"),
        );
        headers
    }

    /// Build a reqwest::Client with default headers and timeout
    fn build_client() -> reqwest::Client {
        reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(4))
            .default_headers(Self::build_default_headers())
            .build()
            .unwrap_or_default()
    }

    /// Create a new marketplace client with browser-like configuration
    pub fn new() -> Self {
        debug!("Creating MarketplaceClient with browser-like headers");
        let client = Self::build_client();
        Self {
            skills_sh: SkillsShClient::new(client.clone()),
            client,
            base_url: AGENT_SKILLS_INDEX_BASE_URL.to_string(),
        }
    }

    /// Create client with custom base URL (for testing)
    #[allow(dead_code)]
    pub fn with_base_url(base_url: String) -> Self {
        debug!(base_url = %base_url, "Creating MarketplaceClient with custom base URL");
        let client = Self::build_client();
        Self {
            skills_sh: SkillsShClient::new(client.clone()),
            client,
            base_url,
        }
    }

    #[cfg(test)]
    pub fn with_base_urls(base_url: String, skills_sh_base_url: String) -> Self {
        let client = Self::build_client();
        Self {
            skills_sh: SkillsShClient::with_base_url(client.clone(), skills_sh_base_url),
            client,
            base_url,
        }
    }

    pub async fn fetch_skills_with_provider(
        &self,
        query: &MarketplaceQuery,
    ) -> Result<FetchResult> {
        if is_skills_sh_sort(&query.sort_by) || query.search.as_ref().is_some() {
            match self.fetch_skills_from_skills_sh(query).await {
                Ok(skills) => {
                    info!(count = skills.len(), "Fetched skills from skills.sh");
                    return Ok(FetchResult {
                        skills,
                        provider: ProviderUsed::SkillsSh,
                    });
                }
                Err(e) => {
                    warn!(error = %e, "skills.sh fetch failed, falling back to skillsmp");
                }
            }
        }

        match self.fetch_skills_from_skillsmp(query).await {
            Ok(skills) => {
                info!(count = skills.len(), "Fetched skills from skillsmp");
                Ok(FetchResult {
                    skills,
                    provider: ProviderUsed::SkillsMp,
                })
            }
            Err(e) => {
                warn!(error = %e, "skillsmp fetch failed, using offline sample data");
                Ok(FetchResult {
                    skills: default_skills(),
                    provider: ProviderUsed::Offline,
                })
            }
        }
    }

    /// Fetch skills with automatic fallback (skills.sh -> skillsmp -> defaults).
    pub async fn fetch_skills(&self, query: &MarketplaceQuery) -> Result<Vec<MarketplaceSkill>> {
        Ok(self.fetch_skills_with_provider(query).await?.skills)
    }

    /// Fetch skills from skills.sh (primary source).
    pub async fn fetch_skills_from_skills_sh(
        &self,
        query: &MarketplaceQuery,
    ) -> Result<Vec<MarketplaceSkill>> {
        self.skills_sh.fetch_skills(query).await
    }

    /// Fetch skills from skillsmp (fallback source).
    pub async fn fetch_skills_from_skillsmp(
        &self,
        query: &MarketplaceQuery,
    ) -> Result<Vec<MarketplaceSkill>> {
        self.fetch_skills_from_skillsmp_api(query).await
    }

    /// Internal method to fetch skills from skillsmp API.
    async fn fetch_skills_from_skillsmp_api(
        &self,
        query: &MarketplaceQuery,
    ) -> Result<Vec<MarketplaceSkill>> {
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

        debug!(url = %url, "Sending skillsmp API request");

        let response = self.client.get(&url).send().await.map_err(|e| {
            error!(error = %e, "Network error during skillsmp API request");
            anyhow!("Network error: {} (check your internet connection)", e)
        })?;

        let status = response.status();
        debug!(status = %status, "Received skillsmp API response");

        if !status.is_success() {
            let error_msg = match status.as_u16() {
                403 => {
                    warn!("skillsmp API access blocked");
                    "skillsmp API access blocked. Falling back to local defaults.".to_string()
                }
                404 => {
                    warn!("skillsmp API endpoint not found");
                    "skillsmp API endpoint not found.".to_string()
                }
                429 => {
                    warn!("skillsmp API rate limited");
                    "skillsmp API rate limited. Please try again later.".to_string()
                }
                500..=599 => {
                    error!(status = %status, "skillsmp server error");
                    format!(
                        "skillsmp server error ({}). The service may be temporarily down.",
                        status
                    )
                }
                _ => format!("skillsmp API request failed with status: {}", status),
            };
            return Err(anyhow!(error_msg));
        }

        let text = response.text().await?;
        debug!(
            response_length = text.len(),
            "Received skillsmp response body"
        );
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
            sort_by: default_sort(),
            search: Some(keyword.to_string()),
            category: filters.category.clone(),
            source: filters.source.clone(),
            platform: filters.platform.clone(),
            page: 1,
            per_page: 50,
        };

        self.fetch_skills(&query).await
    }

    /// Get available categories (skillsmp only).
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
        "trending" | "hot" => "updated",
        "all_time" => "stars",
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
        "trending" => Some("recent"),
        "all_time" | "hot" => Some("stars"),
        _ => Some("stars"),
    }
}

fn parse_skills_sh_search_response(text: &str) -> Result<Vec<MarketplaceSkill>> {
    let response: SkillsShSearchResponse = serde_json::from_str(text)?;
    let mut skills = Vec::with_capacity(response.skills.len());
    for item in response.skills {
        if let Some(skill) = normalize_skills_sh_search_item(item) {
            skills.push(skill);
        }
    }

    if skills.is_empty() {
        return Err(anyhow!("skills.sh search returned zero parseable skills"));
    }

    Ok(skills)
}

fn normalize_skills_sh_search_item(item: SkillsShSearchItem) -> Option<MarketplaceSkill> {
    let (owner, repo, path_skill) = parse_skill_path(&item.id)?;
    let skill = item
        .skill_id
        .or(Some(path_skill))
        .unwrap_or_else(|| slugify(&item.name.clone().unwrap_or_else(|| repo.clone())));

    let installs = item.installs.map(|v| v.min(u32::MAX as u64) as u32);
    let source = item.source.unwrap_or_else(|| format!("{}/{}", owner, repo));
    let name = item.name.unwrap_or_else(|| skill.clone());

    Some(MarketplaceSkill {
        id: format!("{}/{}/{}", owner, repo, skill),
        name,
        description: None,
        owner,
        repo,
        stars: installs.unwrap_or(0),
        downloads: installs,
        categories: Vec::new(),
        platforms: Vec::new(),
        source,
        updated_at: String::new(),
        installed: false,
        skill: Some(skill),
        metric_label: Some("Installs".to_string()),
        metric_value: installs.map(format_compact_number),
        metric_delta: None,
    })
}

fn parse_skills_sh_leaderboard_html(
    text: &str,
    sort: SkillsShSort,
) -> Result<Vec<MarketplaceSkill>> {
    let mut skills = parse_skills_sh_rows_primary(text, sort);

    if skills.is_empty() {
        skills = parse_skills_sh_rows_fallback(text, sort);
    }

    if skills.is_empty() {
        return Err(anyhow!("skills.sh leaderboard parse returned zero rows"));
    }

    if skills.len() > 200 {
        skills.truncate(200);
    }

    Ok(skills)
}

fn parse_skills_sh_rows_primary(text: &str, sort: SkillsShSort) -> Vec<MarketplaceSkill> {
    let mut result = Vec::new();
    let mut cursor = 0usize;

    while let Some(start_rel) = text[cursor..].find("<a class=\"group") {
        let start = cursor + start_rel;
        let tail = &text[start..];
        let Some(end_rel) = tail.find("</a>") else {
            break;
        };
        let row_html = &tail[..end_rel + 4];
        if let Some(skill) = parse_skills_sh_row(row_html, sort) {
            result.push(skill);
        }
        cursor = start + end_rel + 4;
    }

    result
}

fn parse_skills_sh_rows_fallback(text: &str, sort: SkillsShSort) -> Vec<MarketplaceSkill> {
    let mut result = Vec::new();
    let mut seen = HashSet::new();

    for path in extract_all_skill_paths(text) {
        let Some((owner, repo, skill)) = parse_skill_path(&path) else {
            continue;
        };
        let id = format!("{}/{}/{}", owner, repo, skill);
        if !seen.insert(id.clone()) {
            continue;
        }

        result.push(MarketplaceSkill {
            id,
            name: skill.clone(),
            description: None,
            owner: owner.clone(),
            repo: repo.clone(),
            stars: 0,
            downloads: None,
            categories: Vec::new(),
            platforms: Vec::new(),
            source: format!("{}/{}", owner, repo),
            updated_at: String::new(),
            installed: false,
            skill: Some(skill),
            metric_label: Some(sort.label().to_string()),
            metric_value: None,
            metric_delta: None,
        });
    }

    result
}

fn parse_skills_sh_row(row_html: &str, sort: SkillsShSort) -> Option<MarketplaceSkill> {
    let path = extract_attr_value(row_html, "href")?;
    let (owner, repo, skill) = parse_skill_path(&path)?;

    let name = extract_first_tag_text(row_html, "h3").unwrap_or_else(|| skill.clone());
    let source =
        extract_first_tag_text(row_html, "p").unwrap_or_else(|| format!("{}/{}", owner, repo));
    let spans = extract_all_tag_texts(row_html, "span");

    let metric_label = Some(sort.label().to_string());
    let (metric_value, metric_delta) = match sort {
        SkillsShSort::Hot => {
            if spans.len() >= 3 {
                (
                    Some(spans[spans.len() - 2].clone()),
                    Some(spans[spans.len() - 1].clone()),
                )
            } else if spans.len() >= 2 {
                (Some(spans[spans.len() - 1].clone()), None)
            } else {
                (None, None)
            }
        }
        SkillsShSort::Trending | SkillsShSort::AllTime => {
            if spans.len() >= 2 {
                (Some(spans[spans.len() - 1].clone()), None)
            } else {
                (None, None)
            }
        }
    };

    Some(MarketplaceSkill {
        id: format!("{}/{}/{}", owner, repo, skill),
        name,
        description: None,
        owner,
        repo,
        stars: 0,
        downloads: None,
        categories: Vec::new(),
        platforms: Vec::new(),
        source,
        updated_at: String::new(),
        installed: false,
        skill: Some(skill),
        metric_label,
        metric_value,
        metric_delta,
    })
}

fn extract_all_skill_paths(text: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut cursor = 0usize;
    let mut seen = HashSet::new();
    let needle = "href=\"/";

    while let Some(start_rel) = text[cursor..].find(needle) {
        let start = cursor + start_rel + needle.len();
        let tail = &text[start..];
        let Some(end_rel) = tail.find('"') else {
            break;
        };
        let candidate = tail[..end_rel].trim_matches('/').to_string();
        if parse_skill_path(&candidate).is_some() && seen.insert(candidate.clone()) {
            result.push(candidate);
        }
        cursor = start + end_rel + 1;
    }

    result
}

fn extract_attr_value(text: &str, attr: &str) -> Option<String> {
    let needle = format!("{}=\"", attr);
    let start = text.find(&needle)? + needle.len();
    let tail = &text[start..];
    let end = tail.find('"')?;
    Some(tail[..end].to_string())
}

fn extract_first_tag_text(text: &str, tag: &str) -> Option<String> {
    extract_all_tag_texts(text, tag).into_iter().next()
}

fn extract_all_tag_texts(text: &str, tag: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut cursor = 0usize;
    let open_needle = format!("<{}", tag);
    let close_needle = format!("</{}>", tag);

    while let Some(start_rel) = text[cursor..].find(&open_needle) {
        let start = cursor + start_rel;
        let tail = &text[start..];
        let Some(open_end_rel) = tail.find('>') else {
            break;
        };
        let content_start = start + open_end_rel + 1;
        let content_tail = &text[content_start..];
        let Some(content_end_rel) = content_tail.find(&close_needle) else {
            cursor = content_start;
            continue;
        };

        let raw_content = &content_tail[..content_end_rel];
        let normalized = normalize_html_text(raw_content);
        if !normalized.is_empty() {
            result.push(normalized);
        }
        cursor = content_start + content_end_rel + close_needle.len();
    }

    result
}

fn normalize_html_text(raw: &str) -> String {
    collapse_whitespace(&decode_html_entities(&strip_html_tags(raw)))
}

fn strip_html_tags(raw: &str) -> String {
    let mut output = String::with_capacity(raw.len());
    let mut in_tag = false;
    for ch in raw.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => output.push(ch),
            _ => {}
        }
    }
    output
}

fn decode_html_entities(raw: &str) -> String {
    raw.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace("&#x27;", "'")
        .replace("&#x2F;", "/")
        .replace("&#47;", "/")
        .replace("&nbsp;", " ")
}

fn collapse_whitespace(raw: &str) -> String {
    raw.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn parse_skill_path(path: &str) -> Option<(String, String, String)> {
    let trimmed = path.trim_matches('/');
    let mut parts = trimmed.split('/');
    let owner = parts.next()?.trim();
    let repo = parts.next()?.trim();
    let skill = parts.next()?.trim();
    if owner.is_empty() || repo.is_empty() || skill.is_empty() {
        return None;
    }
    Some((owner.to_string(), repo.to_string(), skill.to_string()))
}

fn parse_owner_repo_and_skill(path: &str) -> Option<(String, String, Option<String>)> {
    let trimmed = path.trim_matches('/');
    let mut parts = trimmed.split('/');
    let owner = parts.next()?.trim();
    let repo = parts.next()?.trim();
    if owner.is_empty() || repo.is_empty() {
        return None;
    }
    let skill = parts
        .next()
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string);
    Some((owner.to_string(), repo.to_string(), skill))
}

fn slugify(value: &str) -> String {
    let slug = value
        .trim()
        .to_lowercase()
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
        .collect::<String>();
    let slug = slug
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    if slug.is_empty() {
        "skill".to_string()
    } else {
        slug
    }
}

fn format_compact_number(value: u32) -> String {
    if value >= 1_000_000 {
        format!("{:.1}M", value as f64 / 1_000_000_f64)
    } else if value >= 1_000 {
        format!("{:.1}K", value as f64 / 1_000_f64)
    } else {
        value.to_string()
    }
}

fn parse_skills_response(text: &str) -> Result<Vec<MarketplaceSkill>> {
    if let Ok(skills) = serde_json::from_str::<Vec<MarketplaceSkill>>(text) {
        let normalized = skills
            .into_iter()
            .map(normalize_marketplace_skill)
            .collect::<Vec<_>>();
        debug!(count = normalized.len(), "Parsed skills as direct array");
        return Ok(normalized);
    }

    if let Ok(api_response) = serde_json::from_str::<ApiResponse<Vec<MarketplaceSkill>>>(text) {
        if let Some(error) = api_response.error {
            let message = format_api_error(&error);
            error!(error = %message, "API returned error");
            return Err(anyhow!("API error: {}", message));
        }
        let normalized = api_response
            .data
            .unwrap_or_default()
            .into_iter()
            .map(normalize_marketplace_skill)
            .collect::<Vec<_>>();
        debug!(
            count = normalized.len(),
            "Parsed skills from wrapped response"
        );
        return Ok(normalized);
    }

    let value: serde_json::Value = serde_json::from_str(text)?;
    if let Some(error) = value.get("error") {
        let message = format_api_error(error);
        error!(error = %message, "API returned error");
        return Err(anyhow!("API error: {}", message));
    }
    if let Some(skills) = parse_skills_from_value(&value) {
        let normalized = skills
            .into_iter()
            .map(normalize_marketplace_skill)
            .collect::<Vec<_>>();
        debug!(count = normalized.len(), "Parsed skills from value");
        return Ok(normalized);
    }

    warn!("Failed to parse API response, unable to map skills");
    Err(anyhow!("Unexpected API response format"))
}

fn normalize_marketplace_skill(mut skill: MarketplaceSkill) -> MarketplaceSkill {
    let parsed = parse_owner_repo_and_skill(&skill.id).or_else(|| {
        if skill.owner.is_empty() || skill.repo.is_empty() {
            None
        } else {
            Some((skill.owner.clone(), skill.repo.clone(), None))
        }
    });

    if let Some((owner, repo, skill_from_id)) = parsed {
        skill.owner = owner.clone();
        skill.repo = repo.clone();
        if skill.skill.is_none() {
            skill.skill = skill_from_id;
        }
    }

    if skill.skill.is_none() {
        skill.skill = Some(slugify(&skill.name));
    }

    if let Some(skill_name) = skill.skill.clone() {
        skill.id = format!("{}/{}/{}", skill.owner, skill.repo, skill_name);
    }

    if skill.source.trim().is_empty() {
        skill.source = format!("{}/{}", skill.owner, skill.repo);
    }

    if skill.metric_label.is_none() && skill.downloads.is_some() {
        skill.metric_label = Some("Installs".to_string());
    }
    if skill.metric_value.is_none() {
        skill.metric_value = skill.downloads.map(format_compact_number);
    }

    skill
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
    let id_candidate = obj
        .get("id")
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .to_string();

    let id_parts = parse_owner_repo_and_skill(&id_candidate);

    let owner = obj
        .get("owner")
        .and_then(|v| v.as_str())
        .or_else(|| obj.get("github_owner").and_then(|v| v.as_str()))
        .map(|s| s.to_string())
        .or_else(|| id_parts.as_ref().map(|(owner, _, _)| owner.clone()))?;

    let repo = obj
        .get("repo")
        .and_then(|v| v.as_str())
        .or_else(|| obj.get("github_repo").and_then(|v| v.as_str()))
        .map(|s| s.to_string())
        .or_else(|| id_parts.as_ref().map(|(_, repo, _)| repo.clone()))?;

    let name = obj
        .get("name")
        .and_then(|v| v.as_str())
        .filter(|s| !s.is_empty())
        .unwrap_or(&repo)
        .to_string();

    let skill = obj
        .get("skill")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .or_else(|| id_parts.as_ref().and_then(|(_, _, skill)| skill.clone()))
        .unwrap_or_else(|| slugify(&name));

    let description = obj
        .get("description")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let stars = obj.get("stars").and_then(|v| v.as_u64()).unwrap_or(0) as u32;

    let downloads = obj
        .get("downloads")
        .or_else(|| obj.get("installs"))
        .and_then(|v| v.as_u64())
        .map(|v| v as u32);

    let categories = extract_string_list(obj.get("categories"));
    let platforms = extract_string_list(obj.get("platforms"));

    let source = obj
        .get("source")
        .and_then(|v| v.as_str())
        .map(normalize_source)
        .unwrap_or_else(|| format!("{}/{}", owner, repo));

    let updated_at = obj
        .get("updated_at")
        .and_then(|v| v.as_str())
        .or_else(|| obj.get("updatedAt").and_then(|v| v.as_str()))
        .or_else(|| obj.get("updated").and_then(|v| v.as_str()))
        .unwrap_or_default()
        .to_string();

    let installed = obj
        .get("installed")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let metric_label = obj
        .get("metricLabel")
        .or_else(|| obj.get("metric_label"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .or_else(|| downloads.map(|_| "Installs".to_string()));

    let metric_value = obj
        .get("metricValue")
        .or_else(|| obj.get("metric_value"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .or_else(|| downloads.map(format_compact_number));

    let metric_delta = obj
        .get("metricDelta")
        .or_else(|| obj.get("metric_delta"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    Some(MarketplaceSkill {
        id: format!("{}/{}/{}", owner, repo, skill.clone()),
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
        skill: Some(skill),
        metric_label,
        metric_value,
        metric_delta,
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
    if source.trim().is_empty() {
        return "community".to_string();
    }

    match source {
        "official" | "community" | "vercel-labs" => source.to_string(),
        other => other.to_string(),
    }
}

fn parse_categories_response(text: &str) -> Result<Vec<MarketplaceCategory>> {
    if let Ok(categories) = serde_json::from_str::<Vec<MarketplaceCategory>>(text) {
        info!(count = categories.len(), "Fetched categories from API");
        return Ok(categories);
    }

    if let Ok(api_response) = serde_json::from_str::<ApiResponse<Vec<MarketplaceCategory>>>(text) {
        if let Some(error) = api_response.error {
            let message = format_api_error(&error);
            error!(error = %message, "API returned error");
            return Err(anyhow!("API error: {}", message));
        }
        if let Some(data) = api_response.data {
            info!(
                count = data.len(),
                "Fetched categories from wrapped response"
            );
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
        .unwrap_or(name.as_str())
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

/// Default/sample skills when all remote APIs are unavailable.
pub(crate) fn default_skills() -> Vec<MarketplaceSkill> {
    vec![
        MarketplaceSkill {
            id: "vercel-labs/skills/find-skills".to_string(),
            name: "find-skills".to_string(),
            description: Some("Search and discover installable skills quickly".to_string()),
            owner: "vercel-labs".to_string(),
            repo: "skills".to_string(),
            stars: 5000,
            downloads: Some(10000),
            categories: vec!["ai".to_string(), "development".to_string()],
            platforms: vec!["claude".to_string(), "codex".to_string()],
            source: "vercel-labs/skills".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
            installed: false,
            skill: Some("find-skills".to_string()),
            metric_label: Some("Installs".to_string()),
            metric_value: Some("10.0K".to_string()),
            metric_delta: None,
        },
        MarketplaceSkill {
            id: "vercel-labs/agent-browser/agent-browser".to_string(),
            name: "agent-browser".to_string(),
            description: Some("Browser automation toolkit for AI agents".to_string()),
            owner: "vercel-labs".to_string(),
            repo: "agent-browser".to_string(),
            stars: 3200,
            downloads: Some(7000),
            categories: vec!["web".to_string()],
            platforms: vec!["claude".to_string(), "codex".to_string()],
            source: "vercel-labs/agent-browser".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
            installed: false,
            skill: Some("agent-browser".to_string()),
            metric_label: Some("Installs".to_string()),
            metric_value: Some("7.0K".to_string()),
            metric_delta: None,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::thread;
    use std::time::{Duration, Instant};

    fn spawn_skills_mock_server() -> (String, thread::JoinHandle<()>) {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind test server");
        listener
            .set_nonblocking(true)
            .expect("set non-blocking listener");
        let addr = listener.local_addr().expect("local addr");

        let handle = thread::spawn(move || {
            let started_at = Instant::now();
            let mut handled = 0usize;

            while handled < 2 && started_at.elapsed() < Duration::from_secs(3) {
                match listener.accept() {
                    Ok((mut stream, _)) => {
                        stream.set_nonblocking(false).expect("set blocking stream");
                        let mut buffer = [0u8; 4096];
                        let size = stream.read(&mut buffer).unwrap_or(0);
                        let request = String::from_utf8_lossy(&buffer[..size]);
                        let first_line = request.lines().next().unwrap_or_default();

                        let (status, body) = if first_line.contains("GET /skillssh/hot") {
                            ("500 Internal Server Error", "{}".to_string())
                        } else if first_line.contains("GET /api/v1/skills?") {
                            (
                                "200 OK",
                                r#"{"data":[{"id":"vercel-labs/skills/find-skills","name":"find-skills","owner":"vercel-labs","repo":"skills","stars":100,"downloads":2500,"categories":[],"platforms":[],"source":"vercel-labs/skills","updated_at":"2025-01-01T00:00:00Z","installed":false}]}"#.to_string(),
                            )
                        } else {
                            ("404 Not Found", "{}".to_string())
                        };

                        let response = format!(
                            "HTTP/1.1 {}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                            status,
                            body.len(),
                            body
                        );
                        let _ = stream.write_all(response.as_bytes());
                        handled += 1;
                    }
                    Err(err) if err.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(Duration::from_millis(10));
                    }
                    Err(_) => break,
                }
            }
        });

        (format!("http://{}", addr), handle)
    }

    #[test]
    fn test_marketplace_query_default() {
        let query = MarketplaceQuery::default();
        assert_eq!(query.sort_by, "hot");
        assert_eq!(query.page, 1);
        assert_eq!(query.per_page, 50);
    }

    #[test]
    fn test_marketplace_skill_serialization() {
        let skill = MarketplaceSkill {
            id: "test-owner/test-repo/test-skill".to_string(),
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
            skill: Some("test-skill".to_string()),
            metric_label: Some("Installs".to_string()),
            metric_value: Some("500".to_string()),
            metric_delta: None,
        };

        let json = serde_json::to_string(&skill).unwrap();
        assert!(json.contains("test-owner/test-repo/test-skill"));
        assert!(json.contains("metricLabel"));
    }

    #[test]
    fn test_parse_skills_sh_search_response() {
        let json = r#"{
          "query":"agent",
          "searchType":"fuzzy",
          "skills":[
            {
              "id":"vercel-labs/agent-browser/agent-browser",
              "skillId":"agent-browser",
              "name":"agent-browser",
              "installs":31733,
              "source":"vercel-labs/agent-browser"
            }
          ],
          "count":1
        }"#;

        let parsed = parse_skills_sh_search_response(json).unwrap();
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].id, "vercel-labs/agent-browser/agent-browser");
        assert_eq!(parsed[0].skill.as_deref(), Some("agent-browser"));
        assert_eq!(parsed[0].metric_label.as_deref(), Some("Installs"));
    }

    #[test]
    fn test_parse_skills_sh_leaderboard_all_time() {
        let html = r#"
        <a class="group grid grid-cols-16" href="/vercel-labs/skills/find-skills">
          <span>1</span>
          <h3>find-skills</h3>
          <p>vercel-labs/skills</p>
          <span>197.6K</span>
        </a>
        "#;

        let parsed = parse_skills_sh_leaderboard_html(html, SkillsShSort::AllTime).unwrap();
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].id, "vercel-labs/skills/find-skills");
        assert_eq!(parsed[0].metric_value.as_deref(), Some("197.6K"));
        assert_eq!(parsed[0].metric_delta, None);
    }

    #[test]
    fn test_parse_skills_sh_leaderboard_hot_with_delta() {
        let html = r#"
        <a class="group grid grid-cols-16" href="/vercel-labs/skills/find-skills">
          <span>1</span>
          <h3>find-skills</h3>
          <p>vercel-labs/skills</p>
          <span>561</span>
          <span>+106</span>
        </a>
        "#;

        let parsed = parse_skills_sh_leaderboard_html(html, SkillsShSort::Hot).unwrap();
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].metric_value.as_deref(), Some("561"));
        assert_eq!(parsed[0].metric_delta.as_deref(), Some("+106"));
    }

    #[test]
    fn test_parse_skills_sh_leaderboard_trending() {
        let html = r#"
        <a class="group grid grid-cols-16" href="/vercel-labs/agent-browser/agent-browser">
          <span>1</span>
          <h3>agent-browser</h3>
          <p>vercel-labs/agent-browser</p>
          <span>1.2K</span>
        </a>
        "#;

        let parsed = parse_skills_sh_leaderboard_html(html, SkillsShSort::Trending).unwrap();
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].id, "vercel-labs/agent-browser/agent-browser");
        assert_eq!(parsed[0].metric_label.as_deref(), Some("24H Installs"));
        assert_eq!(parsed[0].metric_value.as_deref(), Some("1.2K"));
        assert_eq!(parsed[0].metric_delta, None);
    }

    #[tokio::test]
    async fn test_skills_sh_failure_falls_back_to_skillsmp() {
        let (server_base, handle) = spawn_skills_mock_server();
        let client = MarketplaceClient::with_base_urls(
            format!("{}/api/v1", server_base),
            format!("{}/skillssh", server_base),
        );

        let query = MarketplaceQuery {
            sort_by: "hot".to_string(),
            ..Default::default()
        };

        let result = client.fetch_skills_with_provider(&query).await.unwrap();
        assert_eq!(result.provider, ProviderUsed::SkillsMp);
        assert_eq!(result.skills.len(), 1);
        assert_eq!(result.skills[0].id, "vercel-labs/skills/find-skills");

        handle.join().expect("join mock server thread");
    }

    #[test]
    fn test_default_categories() {
        let categories = default_categories();
        assert!(!categories.is_empty());
        assert!(categories.iter().any(|c| c.id == "web"));
    }
}
