# Product Search C# Console Application

This is a console-based product search tool that uses natural language to find products from a predefined list. It leverages the OpenAI API's function-calling feature to interpret user queries and filter the products.

## Features

- **Natural Language Queries**: Search for products using everyday language (e.g., "in-stock electronics under $200").
- **OpenAI-Powered Filtering**: Uses OpenAI's function calling to parse queries and determine which products match. No local filtering logic is used.
- **Structured Output**: Displays the filtered products in a clear, formatted list.
- **Secure API Key Handling**: Reads the OpenAI API key from an environment variable to keep it secure.

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later.
- An OpenAI API key. You can get one from the [OpenAI Platform](https://platform.openai.com/).

## Setup and Configuration

1. **Clone the Repository**:

    ```bash
    git clone <your-repo-url>
    cd <path-to-solution>/ProductSearch
    ```

2. **Set the OpenAI API Key**:
    You must set your OpenAI API key as an environment variable named `OPENAI_API_KEY`.

    **Windows (PowerShell)**:

    ```powershell
    $env:OPENAI_API_KEY = "your_api_key_here"
     ```
    
    ```text
    *Note: This sets the variable for the current session only. For a permanent solution, you can set it through the System Properties window.*

    **macOS/Linux**:

    ```bash
    export OPENAI_API_KEY="your_api_key_here"
    ```

    *To make it permanent, add this line to your shell profile file (e.g., `.zshrc`, `.bashrc`).*

3. **Place `products.json`**:
    Ensure the `products.json` file is located in the root directory of the repository, one level above the `ProductSearch` project directory.

## How to Run

1. **Navigate to the Project Directory**:
    Open a terminal and navigate to the `ProductSearch` directory.

2. **Run the Application**:
    Execute the following command:

    ```bash
    dotnet run
    ```

3. **Start Searching**:
    The application will greet you and prompt you for input. Type your search query and press Enter.

    **Example Queries**:
    - `I'm looking for headphones under $100 that are in stock.`
    - `Show me books with a rating above 4.5.`
    - `Find me a kitchen appliance that costs more than $500.`
    - `Are there any treadmills available?`

4. **Exit the Application**:
    Type `exit` and press Enter to close the application.
