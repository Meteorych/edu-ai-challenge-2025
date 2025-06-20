using Betalgo.Ranul.OpenAI;
using Betalgo.Ranul.OpenAI.Managers;
using Betalgo.Ranul.OpenAI.ObjectModels;
using Betalgo.Ranul.OpenAI.ObjectModels.RequestModels;
using System.Text.Json;
using System.Text.RegularExpressions;

// Top-level program entry point
var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

if (string.IsNullOrEmpty(apiKey))
{
    Console.WriteLine("Error: OPENAI_API_KEY environment variable not set.");
    Console.WriteLine("Please set the environment variable and restart the application.");

    return;
}

var openAiService = new OpenAIService(new OpenAIOptions { ApiKey = apiKey });

Console.WriteLine("=== Audio Transcriber & Analyzer ===");
Console.WriteLine("This application transcribes audio files and provides analysis.");
Console.WriteLine();

// Get the audio file path from user
string audioFilePath;

if (args.Length > 0)
{
    audioFilePath = args[0];
}
else
{
    Console.Write("Enter the path to your audio file: ");
    audioFilePath = Console.ReadLine()?.Trim('"') ?? "";
}

if (string.IsNullOrEmpty(audioFilePath) || !File.Exists(audioFilePath))
{
    Console.WriteLine("Error: Audio file not found or path is invalid.");

    return;
}

try
{
    Console.WriteLine($"Processing audio file: {Path.GetFileName(audioFilePath)}");
    Console.WriteLine("Step 1: Transcribing audio...");

    // Step 1: Transcribe audio
    var transcription = await TranscribeAudio(openAiService, audioFilePath);

    if (string.IsNullOrEmpty(transcription))
    {
        Console.WriteLine("Error: Failed to transcribe audio.");

        return;
    }

    Console.WriteLine("✓ Transcription completed");

    // Step 2: Generate summary
    Console.WriteLine("Step 2: Generating summary...");
    var summary = await GenerateSummary(openAiService, transcription);
    Console.WriteLine("✓ Summary generated");

    // Step 3: Analyze transcript
    Console.WriteLine("Step 3: Analyzing transcript...");
    var analysis = await AnalyzeTranscript(openAiService, transcription);
    Console.WriteLine("✓ Analysis completed");

    // Step 4: Save files
    Console.WriteLine("Step 4: Saving results...");

    await SaveTranscription(transcription, $"transcription.md");
    await SaveSummary(summary, $"summary.md");
    await SaveAnalysis(analysis, $"analysis.json");

    Console.WriteLine("✓ Files saved successfully");
    Console.WriteLine();

    // Display results
    DisplayResults(summary, analysis);
}
catch (Exception ex)
{
    Console.WriteLine($"An error occurred: {ex.Message}");
}

// Helper methods
static async Task<string> TranscribeAudio(OpenAIService openAiService, string audioFilePath)
{
    try
    {
        var audioBytes = await File.ReadAllBytesAsync(audioFilePath);
        var fileName = Path.GetFileName(audioFilePath);

        var request = new AudioCreateTranscriptionRequest
        {
            File = audioBytes,
            FileName = fileName,
            Model = Models.WhisperV1,
            Language = "en",
            ResponseFormat = StaticValues.AudioStatics.ResponseFormat.Text
        };

        var response = await openAiService.Audio.CreateTranscription(request);

        if (response.Successful)
        {
            return response.Text;
        }

        Console.WriteLine($"Transcription error: {response.Error?.Message}");

        return "";
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error transcribing audio: {ex.Message}");

        return "";
    }
}

static async Task<string> GenerateSummary(OpenAIService openAiService, string transcription)
{
    try
    {
        var request = new ChatCompletionCreateRequest
        {
            Messages =
            [
                ChatMessage.FromSystem(
                    "You are a helpful assistant that creates concise, well-structured summaries of transcriptions. Focus on key points, main topics, and important details."),
                ChatMessage.FromUser($"Please provide a comprehensive summary of the following transcription:\n\n{transcription}")
            ],
            Model = Models.Gpt_4_1_mini,
            MaxTokens = 1000
        };

        var response = await openAiService.ChatCompletion.CreateCompletion(request);

        if (response is { Successful: true, Choices.Count: > 0 })
        {
            return response.Choices[0].Message.Content ?? "";
        }

        Console.WriteLine($"Summary generation error: {response.Error?.Message}");

        return "Summary generation failed.";
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error generating summary: {ex.Message}");

        return "Summary generation failed.";
    }
}

static async Task<TranscriptAnalysis> AnalyzeTranscript(OpenAIService openAiService, string transcription)
{
    // Basic word count and speaking speed calculation
    var cleanText = MyRegex().Replace(transcription, " ");
    var words = cleanText.Split([' ', '\n', '\r', '\t'], StringSplitOptions.RemoveEmptyEntries);
    var wordCount = words.Length;

    // Calculate speaking speed (assuming average transcript is from a 10-minute recording)
    // This is a rough estimate - in a real application, you'd get the actual audio duration
    var estimatedDurationMinutes = Math.Max(1, wordCount / 150.0); // The Average speaking speed is ~150 WPM
    var speakingSpeedWpm = (int)Math.Round(wordCount / estimatedDurationMinutes);

    // Use GPT to extract topics intelligently
    var topics = await ExtractTopicsWithGPT(openAiService, transcription);

    return new TranscriptAnalysis
    {
        WordCount = wordCount,
        SpeakingSpeedWpm = speakingSpeedWpm,
        FrequentlyMentionedTopics = topics
    };
}

static async Task<List<TopicMention>> ExtractTopicsWithGPT(OpenAIService openAiService, string transcription)
{
    try
    {
        var request = new ChatCompletionCreateRequest
        {
            Messages =
            [
                ChatMessage.FromSystem("""
                                       You are an expert analyst who identifies and extracts key topics from transcriptions. 

                                       Analyze the provided transcript and identify the main topics discussed. For each topic:
                                       1. Create a clear, descriptive topic name (2-4 words)
                                       2. Count how many times it's mentioned or referenced (estimate based on content)
                                       3. Focus on substantial topics, not minor mentions
                                       4. Return a maximum of 8 topics, ordered by importance/frequency

                                       Respond with ONLY a JSON array in this exact format:
                                       [
                                         {"topic": "Topic Name", "mentions": 5},
                                         {"topic": "Another Topic", "mentions": 3}
                                       ]
                                       """),
                ChatMessage.FromUser($"Analyze this transcript and extract the key topics:\n\n{transcription}")
            ],
            Model = Models.Gpt_4_1_mini,
            MaxTokens = 1000,
            Temperature = 0.3f
        };

        var response = await openAiService.ChatCompletion.CreateCompletion(request);

        if (response is { Successful: true, Choices.Count: > 0 })
        {
            var jsonResponse = response.Choices[0].Message.Content?.Trim();

            if (!string.IsNullOrEmpty(jsonResponse))
            {
                try
                {
                    Console.WriteLine($"GPT Response: {jsonResponse}");

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                    var topics = JsonSerializer.Deserialize<List<TopicMention>>(jsonResponse, options);

                    return topics ?? [];
                }
                catch (JsonException ex)
                {
                    Console.WriteLine($"Warning: Could not parse GPT response for topic extraction: {ex.Message}");
                    Console.WriteLine($"Response was: {jsonResponse}");
                }
            }
            else
            {
                Console.WriteLine("Warning: GPT returned empty response for topic extraction.");
            }
        }
        else
        {
            Console.WriteLine($"Topic extraction error: {response.Error?.Message}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in GPT topic extraction: {ex.Message}");
    }

    // Fallback to basic keyword extraction if GPT fails
    return ExtractTopicsFallback(transcription);
}

static List<TopicMention> ExtractTopicsFallback(string transcription)
{
    // Simple fallback method - extract most frequent meaningful words
    var cleanText = MyRegex().Replace(transcription.ToLower(), " ");
    var words = cleanText.Split([' ', '\n', '\r', '\t'], StringSplitOptions.RemoveEmptyEntries);

    // Common stop words to ignore
    var stopWords = new HashSet<string>
    {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do",
        "does", "did", "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
        "me", "him", "her", "us", "them", "my", "your", "his", "its", "our", "their"
    };

    var wordFrequency = words
        .Where(w => w.Length > 3 && !stopWords.Contains(w))
        .GroupBy(w => w)
        .Select(g => new TopicMention { Topic = ToTitleCase(g.Key), Mentions = g.Count() })
        .OrderByDescending(t => t.Mentions)
        .Take(5)
        .ToList();

    return wordFrequency;
}

static string ToTitleCase(string input)
{
    if (string.IsNullOrEmpty(input))
        return input;

    return char.ToUpper(input[0]) + input.Substring(1).ToLower();
}

static async Task SaveTranscription(string transcription, string fileName)
{
    var markdown = $"# Transcription\n\n**Generated:** {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n\n## Content\n\n{transcription}";
    await File.WriteAllTextAsync(fileName, markdown);
}

static async Task SaveSummary(string summary, string fileName)
{
    var markdown = $"# Summary\n\n**Generated:** {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n\n## Summary\n\n{summary}";
    await File.WriteAllTextAsync(fileName, markdown);
}

static async Task SaveAnalysis(TranscriptAnalysis analysis, string fileName)
{
    var options = new JsonSerializerOptions { WriteIndented = true };
    var json = JsonSerializer.Serialize(analysis, options);
    await File.WriteAllTextAsync(fileName, json);
}

static void DisplayResults(string summary, TranscriptAnalysis analysis)
{
    Console.WriteLine("=== RESULTS ===");
    Console.WriteLine();

    Console.WriteLine("📊 ANALYTICS:");
    Console.WriteLine(JsonSerializer.Serialize(analysis, new JsonSerializerOptions { WriteIndented = true }));
    Console.WriteLine();

    Console.WriteLine("📝 SUMMARY:");
    Console.WriteLine(summary);
    Console.WriteLine();

    Console.WriteLine("💾 FILES CREATED:");
    Console.WriteLine("  • transcription.md");
    Console.WriteLine("  • summary.md");
    Console.WriteLine("  • analysis.json");
    Console.WriteLine();

    Console.WriteLine("✅ Processing completed successfully!");
}

// Data models
public class TranscriptAnalysis
{
    public int WordCount { get; set; }
    public int SpeakingSpeedWpm { get; set; }
    public List<TopicMention> FrequentlyMentionedTopics { get; set; } = [];
}

public class TopicMention
{
    public string Topic { get; set; } = "";
    public int Mentions { get; set; }
}

partial class Program
{
    [GeneratedRegex(@"[^\w\s]")]
    private static partial Regex MyRegex();
}