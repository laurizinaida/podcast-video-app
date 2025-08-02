## **第九部分：数据库结构 (Database Schema)**

```sql
-- Users Table: 存储所有用户的信息
CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Assets Table: 存储所有媒体素材的元数据
CREATE TABLE Assets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    storage_url TEXT NOT NULL, -- This will be the 'key' of the object in R2
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK(file_type IN ('audio', 'image', 'video')),
    file_size REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Projects Table: 存储所有视频项目的信息
CREATE TABLE Projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('draft', 'rendering', 'complete', 'failed')) DEFAULT 'draft',
    audio_asset_id TEXT NOT NULL,
    video_asset_id TEXT,
    design_state TEXT NOT NULL, -- Storing JSON as TEXT
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (audio_asset_id) REFERENCES Assets(id),
    FOREIGN KEY (video_asset_id) REFERENCES Assets(id)
);

-- Indexes for performance optimization
CREATE INDEX idx_assets_user_id ON Assets(user_id);
CREATE INDEX idx_projects_user_id ON Projects(user_id);
```