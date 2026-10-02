-- ====================================================================
-- FEZI AI DECISION INTELLIGENCE — PRODUCTION POSTGRESQL MIGRATION 001
-- Tables: users, decisions, decision_context, decision_options,
--         decision_criteria, decision_factors, evidence, sources,
--         scenarios, sensitivity_analysis, decision_reports, shared_decisions
-- ====================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 2. DECISIONS
CREATE TABLE IF NOT EXISTS decisions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    decision_question TEXT,
    category VARCHAR(64) NOT NULL DEFAULT 'career',
    status VARCHAR(32) NOT NULL DEFAULT 'analyzed', -- 'draft', 'analyzing', 'analyzed', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. DECISION_CONTEXT
CREATE TABLE IF NOT EXISTS decision_context (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    current_situation TEXT,
    constraints TEXT,
    goals TEXT,
    timeline VARCHAR(128),
    location VARCHAR(255),
    custom_context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DECISION_OPTIONS
CREATE TABLE IF NOT EXISTS decision_options (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    option_type VARCHAR(64) DEFAULT 'alternative', -- 'status_quo', 'alternative', 'pivot'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DECISION_CRITERIA
CREATE TABLE IF NOT EXISTS decision_criteria (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    source VARCHAR(64) DEFAULT 'user_specified', -- 'user_specified', 'ai_suggested', 'standard_benchmark'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SOURCES
CREATE TABLE IF NOT EXISTS sources (
    id VARCHAR(64) PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    publisher VARCHAR(255),
    source_type VARCHAR(64) NOT NULL, -- 'GOVERNMENT', 'OFFICIAL', 'UNIVERSITY', 'RESEARCH', 'FINANCIAL', 'COMPANY', 'NEWS', 'DATASET', 'OTHER'
    published_at TIMESTAMP WITH TIME ZONE,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    credibility_score INT NOT NULL DEFAULT 85,
    freshness_score INT NOT NULL DEFAULT 90,
    content_hash VARCHAR(128)
);

-- 7. DECISION_FACTORS
CREATE TABLE IF NOT EXISTS decision_factors (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    option_id VARCHAR(64) REFERENCES decision_options(id) ON DELETE SET NULL,
    criterion_id VARCHAR(64) REFERENCES decision_criteria(id) ON DELETE SET NULL,
    raw_score NUMERIC(5, 2) NOT NULL,
    weighted_score NUMERIC(5, 2) NOT NULL,
    confidence VARCHAR(16) NOT NULL DEFAULT 'MEDIUM',
    explanation TEXT
);

-- 8. EVIDENCE
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    factor_id VARCHAR(64) REFERENCES decision_factors(id) ON DELETE SET NULL,
    evidence_type VARCHAR(32) NOT NULL, -- 'VERIFIED', 'ESTIMATED', 'USER_PROVIDED', 'UNKNOWN', 'CONFLICTING'
    claim TEXT NOT NULL,
    evidence_text TEXT NOT NULL,
    confidence NUMERIC(4, 2) NOT NULL DEFAULT 0.80,
    source_id VARCHAR(64) REFERENCES sources(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SCENARIOS
CREATE TABLE IF NOT EXISTS scenarios (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL, -- 'BEST', 'EXPECTED', 'WORST'
    description TEXT,
    assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    score NUMERIC(5, 2) NOT NULL,
    confidence VARCHAR(16) NOT NULL DEFAULT 'MEDIUM'
);

-- 10. SENSITIVITY_ANALYSIS
CREATE TABLE IF NOT EXISTS sensitivity_analysis (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    variable VARCHAR(255) NOT NULL,
    baseline_value TEXT NOT NULL,
    changed_value TEXT NOT NULL,
    original_score NUMERIC(5, 2) NOT NULL,
    new_score NUMERIC(5, 2) NOT NULL,
    original_verdict VARCHAR(32) NOT NULL,
    new_verdict VARCHAR(32) NOT NULL,
    threshold TEXT NOT NULL
);

-- 11. DECISION_REPORTS
CREATE TABLE IF NOT EXISTS decision_reports (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) UNIQUE NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL,
    verdict VARCHAR(32) NOT NULL,
    confidence VARCHAR(16) NOT NULL,
    evidence_coverage NUMERIC(5, 2) DEFAULT 75.0,
    summary TEXT NOT NULL,
    advantages JSONB NOT NULL DEFAULT '[]'::jsonb,
    risks JSONB NOT NULL DEFAULT '[]'::jsonb,
    unknowns JSONB NOT NULL DEFAULT '[]'::jsonb,
    assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SHARED_DECISIONS
CREATE TABLE IF NOT EXISTS shared_decisions (
    id VARCHAR(64) PRIMARY KEY,
    decision_id VARCHAR(64) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    public_token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OPTIMIZING INDEXES
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_context_decision_id ON decision_context(decision_id);
CREATE INDEX IF NOT EXISTS idx_options_decision_id ON decision_options(decision_id);
CREATE INDEX IF NOT EXISTS idx_criteria_decision_id ON decision_criteria(decision_id);
CREATE INDEX IF NOT EXISTS idx_factors_decision_id ON decision_factors(decision_id);
CREATE INDEX IF NOT EXISTS idx_evidence_decision_id ON evidence(decision_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_decision_id ON scenarios(decision_id);
CREATE INDEX IF NOT EXISTS idx_sensitivity_decision_id ON sensitivity_analysis(decision_id);
CREATE INDEX IF NOT EXISTS idx_shared_token ON shared_decisions(public_token);
