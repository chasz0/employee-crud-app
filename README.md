# Employee Directory

A full-stack CRUD application built with React, Node.js, Express, and PostgreSQL.

🔗 **Live Demo:** [https://employee-crud-app-liart.vercel.app/]

*Note: I have provided a live demo for simplicity and immediate access. This ensures you can easily review the application's full functionality just in case any environment-specific complications arise during local setup.*

## Setup Instructions

First, clone the repository:
```bash
git clone https://github.com/chasz0/employee-crud-app.git
cd employee-crud-app
```

### Database Setup
By default, the application will connect to my live, pre-populated Supabase database so you can review the app immediately without local configuration.

**Manual Database Setup (Optional):**
If you prefer to connect the application to your own PostgreSQL instance:
1. Create a new PostgreSQL database.
2. Execute the `schema.sql` file located in the `server/` directory of this repository to generate the required tables and insert the seed data.
3. Use your new database connection string in the Server Setup step below.

### Server Setup
Open a terminal and navigate to the server directory:
```bash
cd server
npm install
```

*Note: For the sake of simplicity during the review process, the `.env` file has been pushed to the repository and is already pre-configured to connect to the live database.*

If you opted for the manual database setup, simply overwrite the existing `.env` file inside the `server` folder with your own connection string:
```env
DATABASE_URL=your_local_postgresql_connection_string_here
PORT=5000
```

Start the Express backend:
```bash
npm run dev
# it should show 'Server is running!' if the setup is successful.
```

### Client Setup
Open a new terminal tab and navigate to the client directory:
```bash
cd client
npm install
```

Start the Vite React frontend:
```bash
npm run dev
```

---

## About the Developer
**Robert Conchas**
* Full-Stack Developer
* BS Computer Science, Magna Cum Laude (Pamantasan ng Lungsod ng Maynila)
* [GitHub](https://github.com/chasz0)
* [Portfolio](https://chasportfolio.vercel.app/)

*If you encounter any unexpected issues while running the application locally, please feel free to reach out!*
