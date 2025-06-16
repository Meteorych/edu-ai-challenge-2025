using Betalgo.Ranul.OpenAI;
using Betalgo.Ranul.OpenAI.Managers;
using Betalgo.Ranul.OpenAI.ObjectModels;
using Betalgo.Ranul.OpenAI.ObjectModels.RequestModels;

namespace ServiceAnalyzer;

internal static class Program
{
    static async Task Main()
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine("Error: OPENAI_API_KEY environment variable not set.");
            Console.WriteLine("Please set the environment variable and try again.");

            return;
        }

        var openAiService = new OpenAIService(new OpenAIOptions
        {
            ApiKey = apiKey
        });

        Console.WriteLine("Please enter a service name (e.g., 'Spotify', 'Notion') or a raw service description:");
        var userInput = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userInput))
        {
            Console.WriteLine("No input provided. Exiting.");

            return;
        }

        Console.WriteLine("\nGenerating report...");

        var completionResult = await openAiService.ChatCompletion.CreateCompletion(new ChatCompletionCreateRequest
        {
            Messages =
            [
                new ChatMessage(StaticValues.ChatMessageRoles.System, BuildPrompt(userInput))
            ],
            Model = Models.Gpt_4_1_mini,
            MaxTokens = 1500
        });

        if (completionResult.Successful)
        {
            var report = completionResult.Choices[0].Message.Content;
            Console.WriteLine("\n--- Generated Report ---");
            Console.WriteLine(report);

            Console.WriteLine("\nDo you want to save this report to a file? (y/n)");
            var saveChoice = Console.ReadLine();

            if (saveChoice?.ToLower() == "y")
            {
                var fileName = $"report_{DateTime.Now:yyyyMMddHHmmss}.md";
                await File.WriteAllTextAsync(fileName, report);
                Console.WriteLine($"Report saved to {fileName}");
            }
        }
        else
        {
            Console.WriteLine("\n--- Error ---");

            Console.WriteLine(completionResult.Error == null
                ? "Unknown error."
                : $"Error: {completionResult.Error.Message}");
        }
    }

    private static string BuildPrompt(string serviceInfo)
    {
        return $"""

                Analyze the following service and generate a comprehensive, markdown-formatted report from multiple viewpoints—including business, technical, and user-focused perspectives.

                Service Information:
                {serviceInfo}

                The report must include the following sections:
                - Brief History: Founding year, milestones, etc.
                - Target Audience: Primary user segments
                - Core Features: Top 2–4 key functionalities
                - Unique Selling Points: Key differentiators
                - Business Model: How the service makes money
                - Tech Stack Insights: Any hints about technologies used
                - Perceived Strengths: Mentioned positives or standout features
                - Perceived Weaknesses: Cited drawbacks or limitations

                Please provide a detailed and well-structured report.

                """;
    }
}