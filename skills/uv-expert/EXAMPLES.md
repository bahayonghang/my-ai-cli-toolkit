# UV Usage Examples

## Example 1: Web Project Setup

```bash
# Initialize FastAPI project
uv init fastapi-app
cd fastapi-app

# Add dependencies
uv add fastapi "uvicorn[standard]"
uv add --dev pytest httpx

# Create main.py
cat > main.py << 'EOF'
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
EOF

# Run development server
uv run uvicorn main:app --reload
```

## Example 2: Data Science Project

```bash
# Initialize data science project
uv init data-analysis
cd data-analysis

# Add data science packages
uv add pandas numpy matplotlib seaborn
uv add --dev jupyter pytest

# Create analysis script
cat > analysis.py << 'EOF'
import pandas as pd
import matplotlib.pyplot as plt

# Load data
df = pd.read_csv("data.csv")
print(df.head())

# Create plot
plt.figure(figsize=(10, 6))
df.plot(kind='bar')
plt.savefig("output.png")
EOF

# Run analysis
uv run python analysis.py
```

## Example 3: Script with Inline Dependencies

```python
# weather.py
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "requests",
#     "rich",
# ]
# ///

import requests
from rich.console import Console
from rich.table import Table

def get_weather(city):
    """Get weather data for city"""
    # This is a mock example - replace with real API
    return {
        "city": city,
        "temperature": 22,
        "humidity": 65,
        "condition": "Partly Cloudy"
    }

def main():
    console = Console()

    cities = ["London", "Tokyo", "New York"]

    table = Table(title="Weather Report")
    table.add_column("City", style="cyan")
    table.add_column("Temperature", style="red")
    table.add_column("Humidity", style="blue")
    table.add_column("Condition", style="green")

    for city in cities:
        weather = get_weather(city)
        table.add_row(
            weather["city"],
            f"{weather['temperature']}°C",
            f"{weather['humidity']}%",
            weather["condition"]
        )

    console.print(table)

if __name__ == "__main__":
    main()
```

```bash
# Run script - UV will auto-install dependencies
uv run weather.py
```

## Example 4: Migrating from pip

**Before (pip workflow):**
```bash
# requirements.txt
requests==2.28.0
pandas>=1.5.0
numpy

# Installation
pip install -r requirements.txt

# Running
python script.py
```

**After (UV workflow):**
```bash
# Convert to UV project
uv init

# Add dependencies
uv add "requests==2.28.0" "pandas>=1.5.0" numpy

# Running
uv run python script.py
```

## Example 5: Workspace Setup

```
my-workspace/
├── pyproject.toml
├── packages/
│   ├── utils/
│   │   └── pyproject.toml
│   └── cli/
│       └── pyproject.toml
```

`pyproject.toml` (root):
```toml
[tool.uv.workspace]
members = ["packages/*"]

[project]
name = "my-workspace"
version = "0.1.0"
```

```bash
# Add shared dependency to all workspace packages
uv add requests --workspace

# Sync all packages
uv sync --workspace
```