# React - Express Data Manager
A fullstack application for database tables management. Features include viewing, creating, editing and deleting table entries.

## Built with
- **React** with [AG Grid](https://www.ag-grid.com/).
- **Express** with MySQL integration.
- **Docker & Docker Compose**.

# 🚀 Quick start (Docker)
The easiest way to run the application. This automatically seeds the database with the default table.
## 1. Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-started/get-docker/).
- Verify the installation:
```bash
docker --version
docker compose version
```
## 2. Create an environment file
In the root directory, create a `.env` file like following template:
```env
MYSQL_HOST=localhost
MYSQL_USER=<your-user-name>
MYSQL_ROOT_PASSWORD=<your-root-password>
MYSQL_DATABASE=<your-database-name>
MYSQL_PASSWORD=<your-user-password>
FRONTEND_URL=http://localhost:5173 # default port served by vite; change accordingly if needed
MYSQL_DEFAULT_TABLE=<default-table-name> # default table name for the generating script
```
## 3. Run the App
Make sure Docker is up and running in the background, then run this command.
```bash
docker-compose up --build
```
- ReactJS frontend: http://localhost:5173/
- ExpressJS backend: http://localhost:8080/
  
*Note:* By default, this command drops and re-create the default table with sample data on every restart. To prevent this:

1. Open `backend/Dockerfile`.
2. Comment out the setup script and uncomment `npm start`.
```Dockerfile
# CMD ["sh", "-c", "./setup_script.sh"]
CMD ["npm", "start"]
```

# ⚒️ Manual installations

## 1. Backend setup
- Navigate to the backend project.
```bash
cd backend
npm install
```
- Create a `.env` file matching your MySQL configuration ([see above](#2-create-an-environment-file)).
- *Optional -* Seed data.
```bash
`npm run generate`
```
- Start the server.
```bash
npm start
```
You can also seed the data & start the server in one command using `./setup_script.sh`.

## 2. Backend setup
- Navigate to the frontend project.
```bash
cd frontend
npm install
```
- Start the server.
```bash
npm run dev
```
- The application serves at `http://localhost:5173`.

# 📖 Overview
- **Home page** Search for table name.
- **Table page** View table information at `/<table-name>`. Update table by directly editing the cells.
- **Detail page** Detail view for one entry.
