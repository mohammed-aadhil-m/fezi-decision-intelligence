-- ====================================================================
-- FEZI AI DECISION INTELLIGENCE — INITIAL DATABASE SEEDS
-- ====================================================================

-- Demo User
INSERT INTO users (id, email, full_name)
VALUES ('user_demo_1', 'founder@fezi.ai', 'FEZI Research Candidate')
ON CONFLICT (id) DO NOTHING;

-- Canonical MVP Decision: Chennai Software Developer Job Offer
INSERT INTO decisions (id, user_id, title, category, status)
VALUES ('dec-chennai-job', 'user_demo_1', 'Should I accept this ₹8 LPA software developer job in Chennai?', 'career', 'analyzed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO decision_context (id, decision_id, current_role, current_salary, current_location, offered_role, offered_salary, offered_location, experience_years, work_mode, commute_minutes)
VALUES ('ctx-1', 'dec-chennai-job', 'Junior Software Engineer', 5.5, 'Coimbatore', 'Software Developer', 8.0, 'Chennai', 2.5, 'hybrid', 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO decision_scores (id, decision_id, final_score, verdict, confidence, confidence_score)
VALUES ('score-1', 'dec-chennai-job', 78, 'LEAN YES', 'MEDIUM', 74)
ON CONFLICT (id) DO NOTHING;

INSERT INTO decision_factors (id, decision_id, factor_name, category, weight, raw_score, weighted_contribution, explanation)
VALUES 
('f1', 'dec-chennai-job', 'Career Growth', 'Professional', 30, 85, 25.5, 'Upward mobility into modern production microservices architecture.'),
('f2', 'dec-chennai-job', 'Compensation & Financial Net', 'Financial', 25, 78, 19.5, '₹8.0 LPA represents a 45% hike placing in the 68th percentile for Chennai tech.'),
('f3', 'dec-chennai-job', 'Market Stability', 'Risk', 15, 82, 12.3, 'Established sector presence with multi-year enterprise contracts.'),
('f4', 'dec-chennai-job', 'Work-Life Balance', 'Lifestyle', 15, 65, 9.75, 'Hybrid schedule demands typical 45-50 hrs/week with standard rotation.'),
('f5', 'dec-chennai-job', 'Location & Commute', 'Environment', 15, 70, 10.5, '45-minute transit along OMR IT corridor.')
ON CONFLICT (id) DO NOTHING;
