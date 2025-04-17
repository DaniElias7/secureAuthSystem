# Secure Authentication API

This is a simple and secure authentication API built using Express.js and PostgreSQL. It demonstrates user registration, login, and basic CRUD operations on user accounts, secured with password hashing and JWT.

## Technologies Used

* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web application framework for Node.js.
* **PostgreSQL:** Relational database.
* **bcrypt:** Library for hashing passwords.
* **jsonwebtoken:** Library for generating and verifying JWTs.
* **dotenv:** Library for loading environment variables from a `.env` file.

## Setup

1.  **Clone the repository** (if you have the code in one).
2.  **Navigate to the project directory:**
    ```bash
    cd api
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Set up your PostgreSQL database:**
    * Create a database named `auth_db` (or your preferred name).
    * Create a table named `secure_auth_api_users` with the following schema:
        ```sql
        CREATE TABLE secure_auth_api_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        ```
5.  **Configure environment variables:**
    * Create a `.env` file in the root of the project.
    * Add your database connection details and a secret key for JWT:
        ```
        DB_USER=your_db_user
        DB_HOST=localhost
        DB_NAME=auth_db
        DB_PASSWORD=your_db_password
        DB_PORT=5432
        JWT_SECRET=your-very-strong-secret-key-here
        ```
        **Replace the placeholder values with your actual credentials and a strong secret key.**
6.  **Start the server:**
    ```bash
    npm start
    ```
    (or `node server.js` if you haven't configured the `start` script in `package.json`)
    The server will be running at `http://localhost:3000` or in the port you set in the `.env` file.

## API Endpoints

All API endpoints expect and/or return data in JSON format.

### User Registration (`/register` - POST)

* **Description:** Registers a new user. Simulates sending a verification code to the email (logs to console).
* **Request Body:**
    ```json
    {
        "username": "your_desired_username",
        "password": "your_desired_password"
    }
    ```
* **Response (Success - Status 200):**
    ```json
    {
        "message": "Registration initiated. Please check your email for the verification code."
    }
    ```
    * Check your server console for the simulated verification code.

### User Verification (`/verify` - POST)

* **Description:** Verifies a user account using the code sent during registration.
* **Request Body:**
    ```json
    {
        "username": "your_registered_username",
        "code": "THE_CODE_FROM_CONSOLE"
    }
    ```
* **Response (Success - Status 200):**
    ```json
    {
        "message": "Account verified successfully. You can now log in."
    }
    ```

### User Login (`/login` - POST)

* **Description:** Logs in an existing user and returns a JWT for authentication.
* **Request Body:**
    ```json
    {
        "username": "your_registered_username",
        "password": "your_registered_password"
    }
    ```
* **Response (Success - Status 200):**
    ```json
    {
        "message": "Login successful.",
        "token": "YOUR_GENERATED_JWT_TOKEN"
    }
    ```
    * Save the `token` value for accessing protected routes.

### Protected Route (`/protected` - GET)

* **Description:** An example protected route that requires a valid JWT for access.
* **Headers:**
    * `Authorization`: `Bearer YOUR_JWT_TOKEN` (Replace `YOUR_JWT_TOKEN` with the token from login)
* **Response (Success - Status 200):**
    ```json
    {
        "message": "This is a protected route.",
        "userId": 1 // The user ID from the token
    }
    ```

### Get User Profile (`/users/me` - GET)

* **Description:** Retrieves the profile information of the authenticated user.
* **Headers:**
    * `Authorization`: `Bearer YOUR_JWT_TOKEN`
* **Response (Success - Status 200):**
    ```json
    {
        "user": {
            "id": 1,
            "username": "your_registered_username"
        }
    }
    ```

### Update User Password (`/users/me/password` - PUT)

* **Description:** Allows the authenticated user to update their password.
* **Headers:**
    * `Authorization`: `Bearer YOUR_JWT_TOKEN`
* **Request Body:**
    ```json
    {
        "oldPassword": "your_current_password",
        "newPassword": "your_new_password"
    }
    ```
* **Response (Success - Status 200):**
    ```json
    {
        "message": "Password updated successfully."
    }
    ```

### Delete User Account (`/users/me` - DELETE)

* **Description:** Allows the authenticated user to delete their own account. Requires password confirmation.
* **Headers:**
    * `Authorization`: `Bearer YOUR_JWT_TOKEN`
* **Request Body:**
    ```json
    {
        "password": "your_current_password"
    }
    ```
* **Response (Success - Status 200):**
    ```json
    {
        "message": "Account deleted successfully."
    }
    ```

## Important Notes

* **Password Hashing:** User passwords are securely stored in the database using the `bcrypt` library, which applies a hashing algorithm to make them unreadable.
* **JWT for Session Management:** After successful login, a JSON Web Token (JWT) is generated and used for subsequent authentication. This token should be included in the `Authorization` header as a Bearer token.
* **Simulated Email Verification:** The email verification process is simplified for this demonstration. The verification code is logged to the server's console instead of being sent via email. In a real application, you would integrate with an email sending service.
* **Temporary Verification Code Storage:** The verification codes are temporarily stored in an in-memory object. **This is not suitable for production environments.** For production, you should use a more persistent and scalable storage mechanism with expiration times.