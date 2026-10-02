-- ====================================================================
-- FEZI AI DECISION INTELLIGENCE — POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Spec #25: users, decisions, decision_context, decision_criteria,
-- decision_factors, evidence, sources, scenarios, decision_scores,
-- decision_reports, shared_decisions
-- ====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DECISIONS TABLE (Root Decision Record)
CREATE TABLE IF NOT EXISTS decisions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'career',
    status VARCHAR(32) NOT NULL DEFAULT 'analyzed', -- 'draft', 'analyzing', 'analyzed', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. DECISION_CONTEXT TABLE (User Context & Circumstances)
CREATE TABLE IF NOT EXISTS decision_context (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    current_role VARCHAR(255),
    current_salary NUMERIC(12, 2),
    current_location VARCHAR(255),
    offered_role VARCHAR(255),
    offered_salary NUMERIC(12, 2),
    offered_location VARCHAR(255),
    experience_years NUMERIC(4, 1),
    work_mode VARCHAR(32), -- 'onsite', 'hybrid', 'remote'
    commute_minutes INT,
    company_size VARCHAR(64),
    notice_period_days INT,
    career_goal TEXT,
    other_offers TEXT,
    custom_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DECISION_CRITERIA & USER PRIORITIES TABLE
CREATE TABLE IF NOT EXISTS decision_criteria (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    career_growth_weight INT DEFAULT 30,
    salary_weight INT DEFAULT 25,
    stability_weight INT DEFAULT 15,
    work_life_balance_weight INT DEFAULT 15,
    location_commute_weight INT DEFAULT 15,
    learning_culture_weight INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. RESEARCH SOURCES TABLE
CREATE TABLE IF NOT EXISTS sources (
    id VARCHAR(64) PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    authority VARCHAR(64) NOT NULL, -- 'GOVERNMENT', 'OFFICIAL_EMPLOYER', 'MARKET_BENCHMARK', 'ACADEMIC'
    reliability_score INT NOT NULL DEFAULT 90,
    snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    source_id VARCHAR(64) REFERENCES sources(id) ON DELETE SET NULL,
    statement TEXT NOT NULL,
    evidence_type VARCHAR(32) NOT NULL, -- 'VERIFIED', 'ESTIMATED', 'USER_PROVIDED', 'UNKNOWN'
    confidence_impact VARCHAR(16) NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
    rationale TEXT,
    date_verified VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. DECISION_FACTORS TABLE (Individual Factor Contribution)
CREATE TABLE IF NOT EXISTS decision_factors (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    factor_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    weight INT NOT NULL,
    raw_score INT NOT NULL,
    weighted_contribution NUMERIC(5, 2) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SCENARIOS TABLE (Best, Expected, Worst)
CREATE TABLE IF NOT EXISTS scenarios (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    scenario_type VARCHAR(32) NOT NULL, -- 'BEST_CASE', 'EXPECTED_CASE', 'WORST_CASE'
    label VARCHAR(64) NOT NULL,
    score INT NOT NULL,
    verdict VARCHAR(32) NOT NULL,
    assumptions JSONB NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. DECISION_SCORES TABLE (Deterministic Final Score & Confidence)
CREATE TABLE IF NOT EXISTS decision_scores (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    final_score INT NOT NULL,
    verdict VARCHAR(32) NOT NULL, -- 'STRONG YES', 'LEAN YES', 'NEUTRAL', 'LEAN NO'
    confidence VARCHAR(16) NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
    confidence_score INT NOT NULL,
    confidence_reasons JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. DECISION_REPORTS TABLE (Full Compiled Dossier)
CREATE TABLE IF NOT EXISTS decision_reports (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) UNIQUE NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    executive_summary TEXT NOT NULL,
    why_recommended JSONB NOT NULL,
    biggest_advantages JSONB NOT NULL,
    biggest_risks JSONB NOT NULL,
    unknowns JSONB NOT NULL,
    sensitivity_analysis JSONB NOT NULL,
    comparison_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. SHARED_DECISIONS TABLE (Public/Private Shareable Links)
CREATE TABLE IF NOT EXISTS shared_decisions (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    access_token VARCHAR(128) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_decision ON evidence(decision_id);
CREATE INDEX IF NOT EXISTS idx_factors_decision ON decision_factors(decision_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_decision ON scenarios(decision_id);
CREATE INDEX IF NOT EXISTS idx_shared_token ON shared_decisions(access_token);
