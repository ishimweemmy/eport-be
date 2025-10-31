-- First ensure we create and use the right database
CREATE DATABASE IF NOT EXISTS ai_analytics;

USE ai_analytics;

-- Enable to create columns with JSON type
SET enable_json_type = 1;

-- Create destination tables for local storage
CREATE TABLE IF NOT EXISTS ai_analytics.colleges
(
   id String,
   name String,
   modules String,
   _sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);

-- Create refreshable materialized views,  -- Will refresh at 1 AM UTC daily
CREATE MATERIALIZED VIEW ai_analytics.colleges_mv
REFRESH EVERY 1 DAY OFFSET 1 HOUR 
TO ai_analytics.colleges
AS SELECT 
   c.id,
   c.name,
   toString(cm.modules) as modules,
   now() as _sync_time
FROM postgresql(
    '164.92.247.171:5434', 
    'ijabo_database',
    'college',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) c
LEFT JOIN postgresql(
    '164.92.247.171:5434',
    'ijabo_database',
    'college_modules',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) cm ON toString(c.id) = cm.college_id_uuid
;


-- Create the main table

CREATE TABLE IF NOT EXISTS ai_analytics.students
(
    id String,
    registration_id String,
    email String,
    gender String,
    badges String,
    experiences String,
    recommendations String,
    awards_and_recognition String,
    extracurricular_activities String,
    industrial_attachment String,
    status String,
    is_recommended String,
    college_id String, 
    sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);

CREATE TABLE IF NOT EXISTS ai_analytics.student_llm_suggestions
(
    student_id String,
    suggestion_type String,
    suggestion_content String,
    created_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (student_id, suggestion_type);

-- Create refreshable materialized view with PostgreSQL connection

--- Create a materialized view

CREATE MATERIALIZED VIEW ai_analytics.students_mv
REFRESH EVERY 1 WEEK OFFSET 2 HOUR
TO ai_analytics.students
AS 
SELECT
    p.user_id as id,
    s.registration_number as registration_id,
    s.email,
    s.gender,
    p.badges,
    p.experiences,
    p.recommendations,
    p.awards_andrecognition as awards_and_recognition,
    p.extracurricular_activities,
    p.industrial_attachment,
    p.status as status,
    s.college as college_id,
    'false' as is_recommended,
    now() as sync_time
FROM postgresql(
    '164.92.247.171:5434', 
    'ijabo_database',
    'portfolio',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) p
JOIN postgresql(
    '164.92.247.171:5434', 
    'ijabo_database',
    'user',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) s ON p.user_id = s.id
WHERE s.role = 'STUDENT';


CREATE TABLE college_weekly_top_performers (
    id UUID DEFAULT generateUUIDv4(),
    student_id UUID,
    college_id String,
    rank UInt32,
    total_score Float64,
    week_number UInt8,
    year UInt16,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (college_id, year, week_number, rank);

-- Create student marks table
CREATE TABLE IF NOT EXISTS ai_analytics.student_marks
(
    id String,
    registration_number String,
    module_id String,
    student_marks String,
    academic_year String,
    assignment String,
    exam String,
    semester String,
    created_at DateTime,
    updated_at DateTime,
    _sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);

-- Create top performers portfolio summaries table
CREATE TABLE IF NOT EXISTS ai_analytics.top_performer_summaries
(
    id UUID DEFAULT generateUUIDv4(),
    student_id UUID,
    college_id String,
    rank UInt32,
    total_score Float64,
    portfolio_summary String,
    badges_summary String,
    experiences_summary String,
    awards_summary String,
    industrial_attachment_summary String,
    week_number UInt8,
    year UInt16,
    created_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (college_id, year, week_number, rank);

-- Create materialized view for student marks
CREATE MATERIALIZED VIEW ai_analytics.student_marks_mv
REFRESH EVERY 1 DAY OFFSET 1 HOUR
TO ai_analytics.student_marks
AS SELECT
    toString(id) as id,
    registration_number,
    module_id,
    student_marks,
    academic_year,
    assignment,
    exam,
    semester,
    created_at,
    updated_at,
    now() as _sync_time
FROM postgresql(
    '164.92.247.171:5434',
    'ijabo_database',
    'student_marks',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
);

-- Create departments table with programs
CREATE TABLE IF NOT EXISTS ai_analytics.departments
(
    id String,
    department_name String,
    department_code String,
    type String,
    programs String, -- JSON stored as string
    _sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);

-- Create materialized view for departments
CREATE MATERIALIZED VIEW ai_analytics.departments_mv
REFRESH EVERY 1 DAY OFFSET 1 HOUR
TO ai_analytics.departments
AS SELECT
    toString(id) as id,
    department_name as department_name,
    department_code as department_code,
    type,
    toString(programs) as programs,
    now() as _sync_time
FROM postgresql(
    '164.92.247.171:5434',
    'ijabo_database',
    'department-programs',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
);


-- Create projects table
CREATE TABLE IF NOT EXISTS ai_analytics.projects
(
    id String,
    title String,
    thesis String,
    type String,
    publication_url String,
    publication_medium String,
    owner_id String,
    owner_first_name String,
    owner_last_name String,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    _sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);

CREATE TABLE IF NOT EXISTS ai_analytics.academic_projects
(
    id String,
    title String,
    thesis String,
    type String,
    publication_url String,
    publication_medium String,
    owner_id String,
    owner_first_name String,
    owner_last_name String,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    _sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);

-- Create materialized view for regular projects
CREATE MATERIALIZED VIEW ai_analytics.projects_mv
REFRESH EVERY 1 DAY OFFSET 1 HOUR
TO ai_analytics.projects
AS SELECT 
    toString(id) as id,
    p.title,
    p.thesis,
    p.type,
    p.publication_url,
    p.publication_medium,
    p.owner as owner_id,
    u.first_name as owner_first_name,
    u.last_name as owner_last_name,
    p.created_at,
    p.updated_at,
    now() as _sync_time
FROM postgresql(
    '164.92.247.171:5434', 
    'ijabo_database',
    'project',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) p
JOIN postgresql(
    '164.92.247.171:5434', 
    'ijabo_database',
    'user',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) u ON p.owner = u.id
WHERE p.type IS NOT NULL;

-- Create materialized view for academic projects
CREATE MATERIALIZED VIEW ai_analytics.academic_projects_mv
REFRESH EVERY 1 DAY OFFSET 1 HOUR
TO ai_analytics.academic_projects
AS SELECT 
    toString(ap.id) as id,
    ap.title,
    ap.thesis,
    'ACADEMIC_PROJECT' as type,
    'ijabo' as publication_url,
    'PLATFORM_EDITOR' as publication_medium,
    ap.owner as owner_id,
    u.first_name as owner_first_name,
    u.last_name as owner_last_name,
    ap.created_at,
    ap.updated_at,
    now() as _sync_time
FROM postgresql(
    '164.92.247.171:5434', 
    'ijabo_database',
    'academic_project',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) ap
JOIN postgresql(
    '164.92.247.171:5434', 
    'ijabo_database',
    'user',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) u ON ap.owner = u.id;


CREATE TABLE IF NOT EXISTS ai_analytics.jobs
(
    id String,
    required_skills String,
    status String,
    _sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);



CREATE MATERIALIZED VIEW ai_analytics.jobs_mv
REFRESH EVERY 1 DAY OFFSET 1 HOUR
TO ai_analytics.jobs
AS SELECT
    toString(id) as id,
    toString(required_skills) as required_skills,
    toString(status) as status,
    now() as _sync_time
FROM postgresql(
    '164.92.247.171:5434',
    'ijabo_database',
    'job',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
);

-- Create job recommendations table
CREATE TABLE IF NOT EXISTS ai_analytics.job_recommendations
(
    id UUID DEFAULT generateUUIDv4(),
    student_id UUID,
    job_id String,
    job_title String,
    company_name String,
    match_score Float64,
    skills_matched Array(String),
    week_number UInt8,
    year UInt16,
    created_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (student_id, year, week_number); 


CREATE TABLE IF NOT EXISTS lecturers
(
    id String,
    email String,
    gender String,
    badges String,
    experiences String,
    recommendations String,
    awards_and_recognition String,
    extracurricular_activities String,
    teaching_history_summary String,
    status String,
    is_recommended String,
    college_id String, 
    sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);

CREATE TABLE IF NOT EXISTS lecturer_colleges (
    lecturer_id String,
    college_id String,
    created_at DateTime,
    PRIMARY KEY (lecturer_id, college_id)
) ENGINE = MergeTree()
ORDER BY (lecturer_id, college_id);

CREATE TABLE IF NOT EXISTS lecturer_portfolio_analysis (
    lecturer_id String,
    analysis_data String,
    created_at DateTime,
    PRIMARY KEY (lecturer_id, created_at)
) ENGINE = MergeTree()
ORDER BY (lecturer_id, created_at);

CREATE TABLE IF NOT EXISTS lecturer_top_performers (
    lecturer_id String,
    college_id String,
    rank UInt8,
    total_score Float64,
    portfolio_summary String,
    badges_summary String,
    experiences_summary String,
    awards_summary String,
    extracurricular_activities_summary String,
    teaching_history_summary String,
    created_at DateTime,
    PRIMARY KEY (lecturer_id, college_id, created_at)
) ENGINE = MergeTree()
ORDER BY (lecturer_id, college_id, created_at);

CREATE TABLE IF NOT EXISTS lecturer_suggestions (
    lecturer_id String,
    suggestion_type String,
    suggestion_text String,
    created_at DateTime,
    PRIMARY KEY (lecturer_id, suggestion_type, created_at)
) ENGINE = MergeTree()
ORDER BY (lecturer_id, suggestion_type, created_at);

-- Create portfolio table
CREATE TABLE IF NOT EXISTS ai_analytics.portfolios
(
    id String,
    user_id String,
    bio String,
    category String,
    status String,
    submission_date DateTime,
    date_approved DateTime,
    strength_score Float64,
    badges String, -- JSON array
    views String, -- JSON array
    recommendation_job_matches String, -- JSON array
    experiences String, -- JSON array
    awards_and_recognition String, -- JSON array
    extracurricular_activities String, -- JSON array
    teaching_history String, -- JSON array
    industrial_attachments String, -- JSON array
    ai_recommendation String, -- JSON object
    positions String, -- JSON array
    recommendations String, -- JSON array
    incomplete_section_indications String, -- JSON array
    changed_records String, -- JSON array
    skills String, -- JSON array
    modules String, -- JSON array
    attachments String, -- JSON array
    awards String, -- JSON array
    activities String, -- JSON array
    _sync_time DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree()
ORDER BY (id);

-- Create materialized view for portfolios
CREATE MATERIALIZED VIEW ai_analytics.portfolios_mv
REFRESH EVERY 1 DAY OFFSET 1 HOUR
TO ai_analytics.portfolios
AS SELECT
    toString(p.id) as id,
    toString(p.user_id) as user_id,
    p.bio,
    p.category,
    p.status,
    p.submission_date,
    p.date_approved,
    p.strength_score,
    toString(p.badges) as badges,
    toString(p.views) as views,
    toString(p.job_recommendations) as recommendation_job_matches,
    toString(p.experiences) as experiences,
    toString(p.awards_andrecognition) as awards_and_recognition,
    toString(p.extracurricular_activities) as extracurricular_activities,
    toString(p.teaching_history) as teaching_history,
    toString(p.industrial_attachments) as industrial_attachments,
    toString(p.ai_recommendation) as ai_recommendation,
    toString(p.positions) as positions,
    toString(p.recommendations) as recommendations,
    toString(p.incomplete_section_indications) as incomplete_section_indications,
    toString(p.changed_records) as changed_records,
    toString(p.skills) as skills,
    toString(p.modules) as modules,
    toString(p.attachments) as attachments,
    toString(p.awards) as awards,
    toString(p.activities) as activities,
    now() as _sync_time
FROM postgresql(
    '164.92.247.171:5434',
    'ijabo_database',
    'portfolio',
    'ijabo',
    'dNxfZzttZnxYoWabHwZeaasdtThAdy'
) p;