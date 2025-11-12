# Supabase Login App

This project implements a simple login system using Supabase for username and password authentication. It includes functionality for user signup and login, along with a basic navigation structure.

## Project Structure

```
supabase-login-app
├── src
│   ├── index.html         # Main entry point of the application
│   ├── index.css          # Styles for the main page
│   ├── index.js           # JavaScript for the main page
│   ├── pages
│   │   ├── login.html     # HTML for the login page
│   │   ├── login.css      # Styles for the login page
│   │   ├── login.js       # JavaScript for handling login functionality
│   │   ├── signup.html    # HTML for the signup page
│   │   ├── signup.css     # Styles for the signup page
│   │   └── signup.js      # JavaScript for handling signup functionality
│   ├── components
│   │   ├── navbar.js      # Navigation bar component
│   │   └── navbar.css     # Styles for the navigation bar
│   └── utils
│       ├── supabase.js    # Supabase client initialization
│       └── auth.js        # Authentication utility functions
├── .env                    # Environment variables for Supabase
├── package.json            # npm configuration file
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd supabase-login-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add your Supabase URL and API key:
   ```
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-anon-key>
   ```

4. **Run the application:**
   You can use a local server to serve the application. For example, you can use the `live-server` package:
   ```
   npx live-server src
   ```

## Usage

- Navigate to the main page to access the login and signup options.
- Use the signup page to create a new account.
- Use the login page to authenticate with your username and password.

## License

This project is licensed under the MIT License.