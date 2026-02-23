-- Clean Slate (Drops existing tables to prevent conflicts)
DROP TABLE IF EXISTS employee_socials CASCADE;
DROP TABLE IF EXISTS employee_profiles CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Departments Table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Roles Table (Many-to-One with Departments)
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(department_id, name) -- Prevents duplicate roles in the same department
);

-- Employees Core Table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Profiles Table (1-to-1 with Employees)
CREATE TABLE employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT
);

-- Employee Socials Table (1-to-Many dynamic links)
CREATE TABLE employee_socials (
  id SERIAL PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'GitHub', 'Portfolio', 'LinkedIn'
  url TEXT NOT NULL
);


-- inserts

INSERT INTO departments (name) VALUES 
  ('Engineering'), ('Design'), ('HR'), ('Sales'), ('Marketing');

INSERT INTO roles (department_id, name) VALUES 
  (1, 'Software Developer'), (1, 'Frontend Developer'), (1, 'Backend Developer'), (1, 'Full-Stack Developer'), (1, 'DevOps Engineer'), (1, 'QA Tester'),
  (2, 'UI/UX Designer'), (2, 'Product Designer'), (2, 'Graphic Designer'),
  (3, 'HR Manager'), (3, 'Technical Recruiter'), (3, 'Onboarding Specialist'),
  (4, 'Account Executive'), (4, 'Sales Manager'), (4, 'Sales Development Rep'),
  (5, 'Marketing Manager'), (5, 'Content Strategist'), (5, 'SEO Specialist');