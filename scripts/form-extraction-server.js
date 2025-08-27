import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors({
  origin: ['https://regen.gaiaai.xyz', 'http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Form extraction endpoint with conversation guidance
app.post('/extract-form-data', async (req, res) => {
  try {
    const { userMessage, conversationHistory = [], currentFormData = {} } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    // Build conversation context
    const contextMessages = conversationHistory.map(msg => `${msg.type}: ${msg.message}`).join('\n');
    const fullContext = contextMessages ? `${contextMessages}\nuser: ${userMessage}` : `user: ${userMessage}`;

    // Determine what form fields are still missing
    const requiredFields = [
      'projectTitle', 'projectSummary', 'projectCategory', 'proiGeneration', 
      'projectStage', 'timeline', 'grantImportance', 'confidence', 'email', 'walletAddress'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !currentFormData[field] || currentFormData[field].trim() === ''
    );

    const systemPrompt = `You are an intelligent form extraction assistant for the REGEN IRL Grant Competition. Your job is to extract relevant form field values from natural conversation about environmental projects.

FORM FIELDS TO EXTRACT:
- projectTitle: Project name or title (string)
- projectSummary: Brief 2-3 sentence summary (string)
- projectCategory: One of: carbon-sequestration, biodiversity, regenerative-agriculture, water-conservation, soil-health, renewable-energy, waste-reduction, other
- otherCategory: If category is "other", specify the focus (string)
- proiGeneration: How the project generates Planetary Return on Investment (string)
- projectStage: One of: idea, planning, pilot, ongoing, scaling
- timeline: Project milestones and timeline (string)
- grantImportance: Importance of grant 1-5 scale (string)
- confidence: Confidence in achieving goals 1-10 scale (string)
- email: Email address (string)
- walletAddress: EVM wallet address starting with 0x (string)

CURRENT FORM STATUS:
- Fields already filled: ${Object.keys(currentFormData).join(', ') || 'none'}
- Fields still needed: ${missingFields.join(', ') || 'none - form is complete!'}

EXTRACTION RULES:
1. Only extract information that is explicitly mentioned or clearly implied
2. For projectSummary and proiGeneration, create concise, professional descriptions based on the conversation
3. For numerical scales, only extract if numbers are mentioned
4. Return empty string for fields not found
5. Be conservative - don't guess or hallucinate information

Return ONLY a JSON object with the extracted fields. Do not include any other text or explanation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: fullContext }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    let extractedData;
    try {
      extractedData = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Validate the extracted data structure
    const validFields = [
      'projectTitle', 'projectSummary', 'projectCategory', 'otherCategory',
      'proiGeneration', 'projectStage', 'timeline', 'grantImportance',
      'confidence', 'email', 'walletAddress'
    ];

    const cleanedData = {};
    validFields.forEach(field => {
      if (extractedData[field] && extractedData[field].trim() !== '') {
        cleanedData[field] = extractedData[field].trim();
      }
    });

    // Generate intelligent follow-up response based on what's missing
    const updatedMissingFields = missingFields.filter(field => !cleanedData[field]);
    const followUpResponse = await generateFollowUpResponse(userMessage, conversationHistory, updatedMissingFields, cleanedData);

    res.json({ 
      extractedData: cleanedData, 
      success: true,
      followUpResponse: followUpResponse,
      missingFields: updatedMissingFields,
      completionPercentage: Math.round(((requiredFields.length - updatedMissingFields.length) / requiredFields.length) * 100)
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Failed to process form extraction', 
      details: error.message 
    });
  }
});

// Generate intelligent follow-up responses
async function generateFollowUpResponse(userMessage, conversationHistory, missingFields, extractedData) {
  if (missingFields.length === 0) {
    return "🎉 Perfect! I have all the information needed for your grant application. Please review the form and submit when you're ready!";
  }

  // Build conversation context
  const contextMessages = conversationHistory.map(msg => `${msg.type}: ${msg.message}`).join('\n');
  const fullContext = contextMessages ? `${contextMessages}\nuser: ${userMessage}` : `user: ${userMessage}`;

  const systemPrompt = `You are a helpful AI assistant for a grant application. Based on the conversation and what information is still needed, generate a natural, conversational response that gently guides the user to provide the missing information.

CONVERSATION CONTEXT:
${fullContext}

INFORMATION JUST EXTRACTED:
${Object.keys(extractedData).length > 0 ? Object.entries(extractedData).map(([key, value]) => `${key}: ${value}`).join('\n') : 'No new information extracted'}

STILL NEEDED:
${missingFields.join(', ')}

FIELD EXPLANATIONS:
- projectTitle: Name of the project
- projectSummary: Brief description of what the project does
- projectCategory: Type of environmental focus
- proiGeneration: How the project creates environmental benefits
- projectStage: Current development phase
- timeline: Key milestones and dates
- grantImportance: How critical this grant is (1-5 scale)
- confidence: How confident they are in success (1-10 scale)
- email: Contact email
- walletAddress: Crypto wallet for grant payment

RESPONSE GUIDELINES:
1. Be conversational and friendly, not formal
2. Acknowledge what they just shared if relevant
3. Ask for 1-2 missing pieces of information naturally
4. Don't overwhelm - focus on the most important missing fields first
5. Use encouraging language
6. If they mentioned something interesting, ask follow-up questions about it
7. Keep responses concise (2-3 sentences max)

Generate a natural response that moves the conversation forward:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating follow-up response:', error);
    
    // Fallback responses based on missing fields
    if (missingFields.includes('projectTitle')) {
      return "That sounds interesting! What's the name of your project?";
    } else if (missingFields.includes('projectCategory')) {
      return "Thanks for sharing! What type of environmental impact does your project focus on?";
    } else if (missingFields.includes('projectStage')) {
      return "Great! What stage is your project currently in - is it still an idea, in planning, or already being implemented?";
    } else if (missingFields.includes('email')) {
      return "Perfect! I just need your email address and we'll be almost done.";
    } else {
      return "This sounds like a fantastic project! Could you tell me a bit more about it?";
    }
  }
}

app.listen(port, () => {
  console.log(`Form extraction server running on port ${port}`);
});