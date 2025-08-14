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

- Node.js and npm installed
- PostgreSQL database
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

3. Set up environment variables:
   Create a `.env` file in the root directory and add your database URL and API keys:

   ```
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/zero-locker
   ```

4. Run Prisma migrations:

   ```bash
   pnpm db:migrate
   ```

5. Seed the database with sample data:

   ```bash
   pnpm db:seed
   ```

   This will create sample users with different plan types and default containers.

6. Start the development server:
   ```bash
   pnpm run dev
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
