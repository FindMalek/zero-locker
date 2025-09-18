![hero](github.png)

# Zero Locker

Zero Locker is a secure password management tool designed to store, retrieve, and manage account credentials and sensitive information efficiently. It provides a user-friendly platform with advanced features like password generation, secure storage, and easy migration from existing TXT files.

## Features

- **Secure Storage:** Encrypted storage for account credentials and sensitive information using Neon Database Provider with PostgreSQL.
- **Password Generation:** Built-in tool for generating secure passwords.
- **Account Details Management:** Store account details including usernames, passwords, descriptions, login page links, recovery emails, and creation dates.
- **Password History:** Track changes made to passwords with timestamps.
- **Authentication:** Secure authentication using BetterAuth with recommended authentication methods.
- **User Interface:** Intuitive and mobile-friendly interface built with React, Next.js, Tailwind CSS, and shadcn.
- **Migration:** Seamless migration from existing TXT files to the new system.
- **Hosting:** Hosting on Vercel for free.

## Getting Started

### Prerequisites

- Node.js and pnpm installed
- **Docker Desktop** (includes Docker and Docker Compose) - [Download here](https://www.docker.com/products/docker-desktop/)
- OR PostgreSQL database (if not using Docker)
- API keys for BetterAuth

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/findmalek/zero-locker.git
   cd zero-locker
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

### Docker Setup (Recommended for Development)

3. Start the PostgreSQL database using Docker:

   ```bash
   docker-compose up -d postgres
   ```

   This will start a PostgreSQL database with the following configuration:

   - Database: `zero-locker`
   - Username: `postgres`
   - Password: `password`
   - Port: `5432`

   **Optional**: To also start pgAdmin for database management:

   ```bash
   docker-compose --profile tools up -d
   ```

   Access pgAdmin at `http://localhost:5050` (admin@localhost.com / admin)

4. Set up environment variables:
   Create a `.env` file in the root directory and add your database URL and API keys:

   ```env
   # Database (use this URL if you're using Docker setup above)
   DATABASE_URL=postgresql://postgres:password@localhost:5432/zero-locker

   # Application
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Authentication (generate a secure secret)
   BETTER_AUTH_SECRET=your-secret-key-minimum-10-characters

   # Logo Dev (optional - for logos and icons)
   LOGO_DEV_TOKEN=your-logo-dev-token
   NEXT_PUBLIC_LOGO_DEV_TOKEN=your-public-logo-dev-token
   ```

5. Run Prisma migrations:

   ```bash
   pnpm db:migrate
   ```

6. Start the development server:
   ```bash
   pnpm run dev
   ```

### Alternative Setup (Without Docker)

If you prefer not to use Docker, you can set up PostgreSQL manually:

1. Install PostgreSQL locally
2. Create a database named `zerolocker`
3. Update the `DATABASE_URL` in your `.env` file to match your PostgreSQL configuration
4. Follow steps 5-6 above

### Docker Management Commands

You can use either Docker Compose commands directly or the convenient npm scripts:

```bash
# Using npm scripts (recommended)
pnpm docker:up          # Start the database
pnpm docker:down        # Stop the database
pnpm docker:logs        # View database logs
pnpm docker:psql        # Access PostgreSQL CLI
pnpm docker:reset       # Reset database (⚠️ deletes all data)

# Or using Docker Compose directly
docker-compose up -d postgres
docker-compose down
docker-compose logs postgres
docker-compose exec postgres psql -U postgres -d zerolocker

# Start with pgAdmin for database management
docker-compose --profile tools up -d

# Remove all containers and volumes (⚠️ This will delete all data)
docker-compose down -v
```

### Troubleshooting

**`docker: command not found` Error:**
If you see `zsh: command not found: docker`, even with Docker Desktop installed:

1. **Make sure Docker Desktop is running:**

   - Look for the whale icon 🐳 in your menu bar (top-right)
   - If not there, open Docker Desktop from Applications
   - Wait until it shows "Docker Desktop is running"

2. **Restart your terminal:**

   ```bash
   # Close your current terminal and open a new one
   # Or restart your shell session:
   exec zsh
   ```

3. **Check if Docker CLI is in your PATH:**

   ```bash
   # Check if Docker Desktop created the symlinks
   ls -la /usr/local/bin/docker*

   # Or check where Docker might be installed
   which docker
   find /Applications -name "docker" -type f 2>/dev/null
   ```

4. **If Docker Desktop is installed but CLI not found:**

   ```bash
   # Add Docker to PATH manually (add to ~/.zshrc)
   echo 'export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

5. **Verify installation:**

   ```bash
   docker --version
   docker-compose --version
   ```

6. **Then try starting the database:**
   ```bash
   pnpm docker:up
   ```

**Docker Credentials Error:**
If you encounter `docker-credential-desktop: executable file not found in $PATH` after installing Docker Desktop:

1. **Restart your terminal** and try again
2. **If still not working:**
   ```bash
   # Restart Docker Desktop completely
   # Then try the command again
   pnpm docker:up
   ```

**Permission Issues (Linux):**
If you get permission denied errors on Linux, add your user to the docker group:

```bash
sudo usermod -aG docker $USER
# Then log out and back in
```

## Usage

1. **Login/Register:** Navigate to the login or register page to create an account or log in.
2. **Add Accounts:** Use the dashboard to add new accounts with details like website name, website link, email address, and password.
3. **Search Accounts:** Utilize the search combobox to find accounts by labels, descriptions, or other details.
4. **Manage Accounts:** View, edit, and delete accounts from the account list.
5. **Generate Passwords:** Use the built-in password generator to create secure passwords.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, please contact [hi@findmalek.com](mailto:hi@findmalek.com).
