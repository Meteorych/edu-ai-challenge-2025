# Service Analyzer

This is a lightweight console application that accepts a service or product name/description and returns a comprehensive, markdown-formatted report from multiple viewpoints—including business, technical, and user-focused perspectives.

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2.  **Set your OpenAI API Key:**
    This application requires an OpenAI API key to function. You need to set it as an environment variable named `OPENAI_API_KEY`.

    **Windows (PowerShell):**
    ```powershell
    $env:OPENAI_API_KEY="your-api-key"
    ```

    **Windows (Command Prompt):**
    ```cmd
    set OPENAI_API_KEY=your-api-key
    ```

    **macOS/Linux:**
    ```bash
    export OPENAI_API_KEY="your-api-key"
    ```
    > **Note:** Replace `"your-api-key"` with your actual OpenAI API key.

3.  **Run the application:**
    ```bash
    dotnet run
    ```

4.  **Enter a service name or description:**
    When prompted, enter a service name like "Spotify" or a detailed description of a service. The application will then generate and display the report.

5.  **Save the report (optional):**
    After the report is generated, you will be asked if you want to save it to a file. Enter `y` to save the report as a markdown file in the application's root directory.

## Sample Outputs

You can find sample outputs in the `sample_outputs.md` file. 