# Audio Transcriber & Analyzer

A C# console application that transcribes audio files using OpenAI's Whisper API, generates summaries using GPT models, and provides comprehensive transcript analytics.

## Features

- 🎵 **Audio Transcription**: Uses OpenAI's Whisper API to convert speech to text
- 📝 **Intelligent Summarization**: Generates concise summaries using GPT-4o-mini
- 📊 **Analytics**: Provides detailed statistics including:
  - Total word count
  - Speaking speed (words per minute)
  - Frequently mentioned topics with frequency counts
- 💾 **File Management**: Automatically saves results in separate timestamped files
- 🖥️ **Console Output**: Displays results directly in the terminal

## Prerequisites

1. **.NET 9.0 SDK** - Download from [Microsoft .NET](https://dotnet.microsoft.com/download/dotnet/9.0)
2. **OpenAI API Key** - Get yours from [OpenAI Platform](https://platform.openai.com/api-keys)

## Supported Audio Formats

The application supports various audio formats including:
- MP3
- WAV
- M4A
- FLAC
- WEBM
- And other formats supported by OpenAI Whisper API

## Installation & Setup

### 1. Clone or Download the Project
```bash
# If using git
git clone <repository-url>
cd task11

# Or simply navigate to the task11 directory
cd task11
```

### 2. Set Up OpenAI API Key

#### Option A: Environment Variable (Recommended)
**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "your-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=your-api-key-here
```

**Linux/macOS:**
```bash
export OPENAI_API_KEY="your-api-key-here"
```

#### Option B: System Environment Variable (Persistent)
1. Open System Properties → Advanced → Environment Variables
2. Add a new system variable:
   - Variable name: `OPENAI_API_KEY`
   - Variable value: `your-api-key-here`
3. Restart your terminal/command prompt

### 3. Restore Dependencies
```bash
dotnet restore
```

### 4. Build the Application
```bash
dotnet build
```

## Usage

### Method 1: Run with Audio File Path as Argument
```bash
dotnet run "path/to/your/audio/file.mp3"
```

### Method 2: Run and Enter Path Interactively
```bash
dotnet run
# Then enter the audio file path when prompted
```

### Example Usage
```bash
# Example with a sample audio file
dotnet run "C:\Users\YourName\Documents\meeting-recording.mp3"

# Or with quotes to handle spaces in path
dotnet run "C:\Users\Your Name\Documents\team meeting 2024.wav"
```

## Output Files

The application creates three timestamped files for each transcription:

1. **`transcription.md`** - Full transcription in Markdown format
2. **`summary.md`** - AI-generated summary in Markdown format  
3. **`analysis.json`** - Analytics data in JSON format

### Example Output Files
```
transcription.md
summary.md
analysis.json
```

## Sample Analytics Output

```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 },
    { "topic": "Marketing", "mentions": 2 },
    { "topic": "Development", "mentions": 1 }
  ]
}
```

## Troubleshooting

### Common Issues

**1. "OPENAI_API_KEY environment variable not set"**
- Ensure you've set the environment variable correctly
- Restart your terminal after setting system environment variables
- Verify the key is set: `echo $env:OPENAI_API_KEY` (PowerShell) or `echo $OPENAI_API_KEY` (bash)

**2. "Audio file not found or path is invalid"**
- Check the file path is correct
- Use quotes around paths with spaces
- Ensure the audio file exists and is accessible

**3. "Failed to transcribe audio"**
- Check your OpenAI API key is valid and has sufficient credits
- Ensure the audio file format is supported
- Verify your internet connection

**4. Build errors**
- Ensure .NET 9.0 SDK is installed: `dotnet --version`
- Run `dotnet restore` to restore packages
- Check for any missing dependencies

### Performance Notes

- Processing time depends on audio file size and length
- Typical processing: 1-2 minutes for a 10-minute audio file
- Large files (>100MB) may take longer to upload and process

## Technical Details

### Dependencies
- `Betalgo.Ranul.OpenAI` (v9.0.4) - OpenAI API client
- .NET 9.0 runtime

### Architecture
The application follows a clean, async/await pattern with error handling:
1. Audio file validation
2. Whisper API transcription
3. GPT-4o-mini summarization
4. Local analytics processing
5. File output generation

### Topic Detection
The analytics engine uses keyword matching to identify common business topics:
- Customer Onboarding
- Q4 Roadmap  
- AI Integration
- Marketing
- Sales
- Development
- Strategy
- Analytics

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your OpenAI API key and credits
3. Ensure all prerequisites are installed correctly 