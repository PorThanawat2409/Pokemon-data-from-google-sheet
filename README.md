# Pokemon-data-from-google-sheet

## Requirements
- Node.js
- .env file containing:
    ```bash
    GOOGLE_SHEET_URL=<your-google-url>
    ```
    - By your google sheet need set General access <= "Viewer" 
    - And Change last of url = "gviz/tq?tqx=out:json"
    Example 

            Default ===> https://docs.google.com/spreadsheets/d/"Key"/edit?usp=sharing

            Change to => https://docs.google.com/spreadsheets/d/"Key"/gviz/tq?tqx=out:json
            
            

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```bash
    cd  Pokemon-data-from-google-sheet
    ```
3. Set up your environment variables in a `.env` file, Google API URL.

4. Start the server:
   ```bash
   node server.js
   ```

### Server is running at http://localhost:3000