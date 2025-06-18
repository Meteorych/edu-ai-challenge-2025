using OpenAI;
using OpenAI.Managers;
using OpenAI.ObjectModels;
using OpenAI.ObjectModels.RequestModels;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace ProductSearch;

class Program
{
    static async Task Main(string[] args)
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine("Error: OPENAI_API_KEY environment variable not set.");
            Console.WriteLine("Please set the environment variable and restart the application.");
            return;
        }

        var openAiService = new OpenAIService(new OpenAiOptions() { ApiKey = apiKey });

        var productsJson = await File.ReadAllTextAsync("products.json");

        Console.WriteLine("Hi! I'm a product search assistant. How can I help you find a product today?");
        Console.WriteLine("For example: 'I'm looking for headphones under $100 that are in stock.' or 'Show me books with a rating above 4.5.'");
        Console.WriteLine("Type 'exit' to quit.");

        while (true)
        {
            Console.Write("> ");
            var userInput = Console.ReadLine();
            if (string.IsNullOrWhiteSpace(userInput) || userInput.Equals("exit", StringComparison.OrdinalIgnoreCase))
            {
                break;
            }

            try
            {
                var filteredProducts = await GetFilteredProductsFromOpenAI(openAiService, productsJson, userInput);

                if (filteredProducts.Count == 0)
                {
                    Console.WriteLine("I couldn't find any products matching your criteria.");
                }
                else
                {
                    Console.WriteLine("Filtered Products:");
                    for (int i = 0; i < filteredProducts.Count; i++)
                    {
                        var p = filteredProducts[i];
                        Console.WriteLine($"{i + 1}. {p.Name} - ${p.Price:0.00}, Rating: {p.Rating}, {(p.InStock ? "In Stock" : "Out of Stock")}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }
            Console.WriteLine();
        }
    }

    private static async Task<List<Product>> GetFilteredProductsFromOpenAI(IOpenAIService openAiService, string productsJson, string userInput)
    {
        var systemPrompt = $"""
You are a product search assistant. Given a user's query and a list of available products, you will identify which products match the user's request.
You must call the 'get_filtered_products' function with the products that meet the criteria.
Do not make up products. Only use products from the provided list.
If no products match, call the function with an empty list.

Here is the list of available products in JSON format:
{productsJson}
""";

        var tools = new List<ToolDefinition>
        {
            new()
            {
                Type = StaticValues.ToolTypes.Function,
                Function = new FunctionDefinition
                {
                    Name = "get_filtered_products",
                    Description = "Gets a list of products that match the user's criteria.",
                    Parameters = new JsonObject
                    {
                        ["type"] = "object",
                        ["properties"] = new JsonObject
                        {
                            ["products"] = new JsonObject
                            {
                                ["type"] = "array",
                                ["items"] = new JsonObject
                                {
                                    ["type"] = "object",
                                    ["properties"] = new JsonObject
                                    {
                                        ["name"] = new JsonObject { ["type"] = "string" },
                                        ["category"] = new JsonObject { ["type"] = "string" },
                                        ["price"] = new JsonObject { ["type"] = "number" },
                                        ["rating"] = new JsonObject { ["type"] = "number" },
                                        ["in_stock"] = new JsonObject { ["type"] = "boolean" }
                                    },
                                    ["required"] = new JsonArray("name", "category", "price", "rating", "in_stock")
                                }
                            }
                        },
                        ["required"] = new JsonArray("products")
                    }
                }
            }
        };

        var messages = new List<ChatMessage>
        {
            ChatMessage.FromSystem(systemPrompt),
            ChatMessage.FromUser(userInput)
        };

        var request = new ChatCompletionCreateRequest
        {
            Messages = messages,
            Model = Models.Gpt_4o,
            Tools = tools,
            ToolChoice = new ToolChoice { Type = StaticValues.ToolTypes.Function, Function = new FunctionName { Name = "get_filtered_products" } }
        };

        var response = await openAiService.ChatCompletion.CreateCompletion(request);

        if (response.Successful)
        {
            var responseMessage = response.Choices.First().Message;
            if (responseMessage.ToolCalls != null && responseMessage.ToolCalls.Any())
            {
                var toolCall = responseMessage.ToolCalls.First();
                if (toolCall.Function?.Arguments != null)
                {
                    var productListWrapper = JsonSerializer.Deserialize<ProductListWrapper>(toolCall.Function.Arguments);
                    return productListWrapper?.Products ?? new List<Product>();
                }
            }
        }
        else
        {
            if (response.Error == null)
            {
                throw new Exception("Unknown error from OpenAI API.");
            }
            throw new Exception(response.Error.Message);
        }

        return new List<Product>();
    }
}
