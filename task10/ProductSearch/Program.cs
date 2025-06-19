using Betalgo.Ranul.OpenAI;
using Betalgo.Ranul.OpenAI.Managers;
using Betalgo.Ranul.OpenAI.ObjectModels;
using Betalgo.Ranul.OpenAI.ObjectModels.RequestModels;
using Betalgo.Ranul.OpenAI.ObjectModels.SharedModels;
using System.Text.Json;

namespace ProductSearch;

internal static class Program
{
    private static async Task Main()
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine("Error: OPENAI_API_KEY environment variable not set.");
            Console.WriteLine("Please set the environment variable and restart the application.");

            return;
        }

        var openAiService = new OpenAIService(new OpenAIOptions { ApiKey = apiKey });

        var productsJson = await File.ReadAllTextAsync("products.json");

        Console.WriteLine("Hi! I'm a product search assistant. How can I help you find a product today?");
        Console.WriteLine("For example: 'I'm looking for headphones under $100 that are in stock.' or 'Show me books with a rating above 4.5.'");
        Console.WriteLine("Type 'exit' to quit.");

        while (true)
        {
            Console.Write("> ");
            var userInput = Console.ReadLine();

            if (string.IsNullOrWhiteSpace(userInput) || userInput.Equals("exit", StringComparison.OrdinalIgnoreCase))
                break;
            
            var filteredProducts = await GetFilteredProductsFromOpenAI(openAiService, productsJson, userInput);

            if (filteredProducts.Count == 0)
            {
                Console.WriteLine("I couldn't find any products matching your criteria.");
            }
            else
            {
                Console.WriteLine("Filtered Products:");

                for (var i = 0; i < filteredProducts.Count; i++)
                {
                    var p = filteredProducts[i];
                    Console.WriteLine($"{i + 1}. {p.Name} - ${p.Price:0.00}, Rating: {p.Rating}, {(p.InStock ? "In Stock" : "Out of Stock")}");
                }
            }
            
            Console.WriteLine();
        }
    }

    private static async Task<List<Product>> GetFilteredProductsFromOpenAI(OpenAIService openAiService, string productsJson, string userInput)
    {
        var systemPrompt = $"""
                            You are a product search assistant. Given a user's query and a list of available products, you will identify which products match the user's request.
                            You must call the 'get_filtered_products' function with the products that meet the criteria.
                            Do not make up products. Only use products from the provided list.
                            If no products match, call the function with an empty list.

                            Here is the list of available products in JSON format:
                            {productsJson}
                            """;


        var fn = new FunctionDefinition
        {
            Name = "get_filtered_products",
            Description = "Gets a list of products that match the user's criteria.",
            Parameters = PropertyDefinition.DefineObject(
                new Dictionary<string, PropertyDefinition>
                {
                    ["products"] = PropertyDefinition.DefineArray(
                        PropertyDefinition.DefineObject(
                            new Dictionary<string, PropertyDefinition>
                            {
                                ["name"] = PropertyDefinition.DefineString("Product name"),
                                ["category"] = PropertyDefinition.DefineString("Product category"),
                                ["price"] = PropertyDefinition.DefineNumber("Product price"),
                                ["rating"] = PropertyDefinition.DefineNumber("Product rating"),
                                ["in_stock"] = PropertyDefinition.DefineBoolean("Whether the product is in stock")
                            },
                            new List<string> { "name", "category", "price", "rating", "in_stock" },
                            false,
                            "A product object",
                            null
                        )
                    )
                },
                new List<string> { "products" },
                false,
                "List of products matching the criteria",
                null
            )
        };

        var messages = new List<ChatMessage>
        {
            ChatMessage.FromSystem(systemPrompt),
            ChatMessage.FromUser(userInput)
        };

        var request = new ChatCompletionCreateRequest
        {
            Messages = messages,
            Model = Models.Gpt_4_1_mini,
            Tools = new List<ToolDefinition> { ToolDefinition.DefineFunction(fn) },
            ToolChoice = ToolChoice.Required
        };

        var response = await openAiService.ChatCompletion.CreateCompletion(request);

        if (response.Successful)
        {
            var responseMessage = response.Choices.First().Message;

            if (responseMessage.ToolCalls == null || !responseMessage.ToolCalls.Any())
                return [];

            var toolCall = responseMessage.ToolCalls.First();

            if (toolCall.FunctionCall?.Arguments == null)
                return [];

            var productListWrapper = JsonSerializer.Deserialize<ProductListWrapper>(toolCall.FunctionCall.Arguments);

            return productListWrapper?.Products ?? [];
        }

        Console.WriteLine("Something went wrong with API call.");

        return [];
    }
}