require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/api/departments', async (req, res) => {
    //this will return the roles too, and is grouped by department id, it'll be useful for the front-end
    try {
        const query = `
        SELECT d.id AS department_id, d.name AS department_name, 
                json_agg(json_build_object('id', r.id, 'name', r.name)) AS roles
        FROM departments d
        LEFT JOIN roles r ON d.id = r.department_id
        GROUP BY d.id
        ORDER BY d.id;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching departments' });
    }
});


//CREATE
app.post('/api/employees', async (req, res) => {
    const client = await pool.connect(); 
    
    try {
        const { name, email, role_id, status, avatar_url, bio, socials } = req.body;
        
        await client.query('BEGIN');

        //Insert Core Employee
        const empResult = await client.query(
        `INSERT INTO employees (name, email, role_id, status) 
        VALUES ($1, $2, $3, $4) RETURNING id`,
        [name, email, role_id, status || 'Active']
        );
        const newEmployeeId = empResult.rows[0].id;

        //Insert Profile
        await client.query(
        `INSERT INTO employee_profiles (employee_id, avatar_url, bio) 
        VALUES ($1, $2, $3)`,
        [newEmployeeId, avatar_url, bio]
        );

        //Insert Dynamic Socials
        if (socials && Array.isArray(socials) && socials.length > 0) {
            for (const social of socials) {
                if (social.platform && social.url) {
                await client.query(
                    `INSERT INTO employee_socials (employee_id, platform, url) VALUES ($1, $2, $3)`,
                    [newEmployeeId, social.platform, social.url]
                );
                }
            }
        }

        await client.query('COMMIT'); //Commit Transaction
        res.status(201).json({ message: 'Success', id: newEmployeeId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        if (err.code === '23505') return res.status(400).json({ error: 'Email already exists.' });
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

//READ
app.get('/api/employees', async (req, res) => {
    try {
        const query = `
        SELECT 
            e.id, e.name, e.email, e.status, e.created_at,
            r.id AS role_id, r.name AS role_name,
            d.id AS department_id, d.name AS department_name,
            p.avatar_url, p.bio,
            COALESCE(
            (SELECT json_agg(json_build_object('platform', s.platform, 'url', s.url))
            FROM employee_socials s WHERE s.employee_id = e.id),
            '[]'::json
            ) AS socials
        FROM employees e
        JOIN roles r ON e.role_id = r.id
        JOIN departments d ON r.department_id = d.id
        LEFT JOIN employee_profiles p ON e.id = p.employee_id
        ORDER BY e.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

//UPDATE
app.put('/api/employees/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { name, email, role_id, status, avatar_url, bio, socials } = req.body;
        
        await client.query('BEGIN');

        //Update Core
        await client.query(
        `UPDATE employees SET name = $1, email = $2, role_id = $3, status = $4 WHERE id = $5`,
        [name, email, role_id, status, id]
        );

        // Update Profile
        await client.query(
        `UPDATE employee_profiles SET avatar_url = $1, bio = $2 WHERE employee_id = $3`,
        [avatar_url, bio, id]
        );

        // Update Socials (Easiest way: Wipe old ones, insert new ones)
        await client.query(`DELETE FROM employee_socials WHERE employee_id = $1`, [id]);
        
        if (socials && Array.isArray(socials) && socials.length > 0) {
            for (const social of socials) {
                if (social.platform && social.url) {
                await client.query(
                    `INSERT INTO employee_socials (employee_id, platform, url) VALUES ($1, $2, $3)`,
                    [id, social.platform, social.url]
                );
                }
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Update successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: 'Server error updating' });
    } finally {
        client.release();
    }
});

// DELETE
app.delete('/api/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

//PING, I used this to use a cron-job so render's free tier would shut down on inactivity
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.listen(port, () => {
    console.log(`Server is running!`);
});

//usually when I do this, each route has their own dedicated file, since this is just few routes it's better to do it this way