# CTI Web Application Experiment

This is an experiment to build a simple CTI web application leveraging DNS data.

## Capabilities

*   **Google Authentication:** Users can sign in with their Google account.
*   **VirusTotal API Key Management:** Users can securely store, update, and delete their VirusTotal API key. The key is encrypted before being stored.
*   **Domain and IP Lookups:** The application proxies requests to the VirusTotal API to perform domain and IP address lookups.
    *   **Domain Lookups:** Retrieves DNS records, WHOIS information, and subdomains for a given domain.
    *   **IP Lookups:** Retrieves DNS resolutions for a given IP address.

## How to Run the App

### Prerequisites

*   Node.js and npm
*   A Google Client ID for Google Authentication
*   A VirusTotal API key

### Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file and add the following environment variables:
    ```
    GOOGLE_CLIENT_ID=<your_google_client_id>
    ENCRYPTION_KEY=<your_encryption_key>
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup

1.  Navigate to the `cti-dns-app` directory:
    ```bash
    cd cti-dns-app
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file and add the following environment variable:
    ```
    REACT_APP_GOOGLE_CLIENT_ID=<your_google_client_id>
    ```
4.  Start the frontend development server:
    ```bash
    npm start
    ```

## Docker Deployment

### Prerequisites

*   Docker and Docker Compose

### Setup

1.  Create a `.env` file in the root directory of the project and add the following environment variables:
    ```
    GOOGLE_CLIENT_ID=<your_google_client_id>
    ENCRYPTION_KEY=<your_encryption_key>
    REACT_APP_GOOGLE_CLIENT_ID=<your_google_client_id>
    ```
2.  Build and run the application using Docker Compose:
    ```bash
    docker-compose up --build
    ```
The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.
