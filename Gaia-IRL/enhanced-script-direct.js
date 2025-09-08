// Enhanced Grant Application Form with Direct LLM API Calls
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3007' : '/api';

// Form field definitions in order
const FORM_FIELDS = [
    { id: 'projectTitle', label: 'Project Title', type: 'text' },
    { id: 'projectSummary', label: 'Project Summary', type: 'textarea' },
    { id: 'projectCategory', label: 'Project Category', type: 'select' },
    { id: 'otherCategory', label: 'Other Category', type: 'text', conditional: true },
    { id: 'proiGeneration', label: 'PROI Generation', type: 'textarea' },
    { id: 'projectStage', label: 'Project Stage', type: 'select' },
    { id: 'timeline', label: 'Timeline', type: 'textarea' },
    { id: 'grantImportance', label: 'Grant Importance (1-5)', type: 'radio' },
    { id: 'confidence', label: 'Confidence Level (1-10)', type: 'radio' },
    { id: 'projectUrl', label: 'Project URL', type: 'url' },
    { id: 'email', label: 'Email Address', type: 'email' },
    { id: 'walletAddress', label: 'Wallet Address', type: 'text' }
];

let currentFieldIndex = 0;
let sessionId = null;
let conversationHistory = [];
let pendingSuggestions = {};

// Rate limiting
const rateLimits = {
    messages: [],
    submissions: [],
    lastWarning: 0
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    attachFormListeners();
    attachChatHandlers();
    startGuidedFlow();
});

function initializeChat() {
    // Generate unique session ID
    sessionId = 'grant_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    
    console.log('Session initialized with ID:', sessionId);
    console.log('Starting field index:', currentFieldIndex);
    
    // Add initial welcome message
    addChatMessage('agent', "Hi! I'm your AI assistant for the $888 REGEN IRL Grant application. We support all kinds of regenerative projects - from carbon sequestration and biodiversity to renewable energy and waste reduction. Tell me about your environmental project and I'll help you fill out the application step by step.");
    
    // Add helpful tip about optional fields
    setTimeout(() => {
        addChatMessage('system', '💡 Tip: Only your email is required to submit. You can type "skip" anytime to move to the next field, or "submit" to jump to the submission.');
    }, 2000);
}

function attachFormListeners() {
    // Track manual form changes
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], textarea, select').forEach(element => {
        element.addEventListener('change', function() {
            updateFormProgress();
            
            // Check if this is the field we're currently asking about
            const fieldId = element.id || element.name;
            const currentField = FORM_FIELDS[currentFieldIndex];
            
            // If user manually filled the current field we're asking about, move to next
            if (currentField && currentField.id === fieldId && getFieldValue(fieldId)) {
                // Add a brief acknowledgment
                const value = getFieldValue(fieldId);
                if (fieldId === 'projectCategory') {
                    const categoryText = element.options[element.selectedIndex].text;
                    addChatMessage('system', `✓ Selected: ${categoryText}`);
                }
                
                setTimeout(() => {
                    moveToNextField();
                }, 300);
            }
        });
        
        element.addEventListener('focus', function() {
            highlightCurrentField(element.id || element.name);
        });
    });
    
    // Special handling for radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateFormProgress();
            
            // Check if this is the field we're currently asking about
            const fieldName = this.name;
            const currentField = FORM_FIELDS[currentFieldIndex];
            
            // If user manually filled the current field we're asking about, move to next
            if (currentField && currentField.id === fieldName) {
                // Add acknowledgment for radio selections
                const value = this.value;
                if (fieldName === 'grantImportance') {
                    addChatMessage('system', `✓ Selected grant importance: ${value}/5`);
                } else if (fieldName === 'confidence') {
                    addChatMessage('system', `✓ Selected confidence level: ${value}/10`);
                }
                
                setTimeout(() => {
                    moveToNextField();
                }, 300);
            }
        });
    });
    
    // Handle category change
    document.getElementById('projectCategory').addEventListener('change', function() {
        const otherGroup = document.getElementById('otherCategoryGroup');
        otherGroup.style.display = this.value === 'other' ? 'block' : 'none';
    });
    
    // Handle form submission
    document.getElementById('grantApplication').addEventListener('submit', handleFormSubmit);
}

function attachChatHandlers() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}

function startGuidedFlow() {
    if (currentFieldIndex >= 0 && currentFieldIndex < FORM_FIELDS.length) {
        highlightCurrentField(FORM_FIELDS[currentFieldIndex].id);
    }
}

function highlightCurrentField(fieldId) {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('highlighted', 'has-suggestion');
    });
    
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('highlighted');
            
            if (pendingSuggestions[fieldId]) {
                showFieldSuggestion(fieldId, pendingSuggestions[fieldId]);
            }
        }
    }
}

function showFieldSuggestion(fieldId, suggestion) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('has-suggestion');
    
    const existingSuggestion = formGroup.querySelector('.suggestion-box');
    if (existingSuggestion) {
        existingSuggestion.remove();
    }
    
    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'suggestion-box';
    suggestionBox.innerHTML = `
        <div class="suggestion-header">
            <span class="suggestion-icon">✨</span>
            <span>AI Suggestion</span>
        </div>
        <div class="suggestion-content">${escapeHtml(suggestion)}</div>
        <div class="suggestion-actions">
            <button class="accept-btn" onclick="acceptSuggestion('${fieldId}')">
                <span>✓</span> Accept
            </button>
            <button class="edit-btn" onclick="editSuggestion('${fieldId}')">
                <span>✎</span> Edit
            </button>
            <button class="reject-btn" onclick="rejectSuggestion('${fieldId}')">
                <span>✗</span> Reject
            </button>
        </div>
    `;
    
    formGroup.appendChild(suggestionBox);
}

function acceptSuggestion(fieldId) {
    const suggestion = pendingSuggestions[fieldId];
    if (!suggestion) return;
    
    // Handle radio buttons by field name
    if (fieldId === 'grantImportance' || fieldId === 'confidence') {
        const radio = document.querySelector(`input[name="${fieldId}"][value="${suggestion}"]`);
        if (radio) {
            radio.checked = true;
            // Don't trigger change event - we'll handle progression manually
        }
    } else {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.tagName === 'SELECT') {
                field.value = suggestion;
                if (fieldId === 'projectCategory' && suggestion === 'other') {
                    document.getElementById('otherCategoryGroup').style.display = 'block';
                }
            } else {
                field.value = suggestion;
            }
            // Don't trigger change event - we'll handle progression manually
        }
    }
    
    delete pendingSuggestions[fieldId];
    removeSuggestionBox(fieldId);
    
    addChatMessage('system', `✓ Accepted suggestion for ${getFieldLabel(fieldId)}`);
    
    // Move to next field and ask about it
    setTimeout(() => {
        moveToNextField();
    }, 200); // Small delay to ensure field value is set
}

function editSuggestion(fieldId) {
    const suggestion = pendingSuggestions[fieldId];
    const field = document.getElementById(fieldId);
    
    // Only allow editing for text and textarea fields
    if (field && field.type !== 'radio' && field.tagName !== 'SELECT') {
        field.value = suggestion;
        field.focus();
        delete pendingSuggestions[fieldId];
        removeSuggestionBox(fieldId);
        addChatMessage('system', `✎ Editing ${getFieldLabel(fieldId)}`);
    } else {
        // For non-editable fields, just reject and ask for new input
        rejectSuggestion(fieldId);
    }
}

function rejectSuggestion(fieldId) {
    delete pendingSuggestions[fieldId];
    removeSuggestionBox(fieldId);
    
    const field = document.getElementById(fieldId);
    field.focus();
    
    addChatMessage('system', `✗ Rejected suggestion for ${getFieldLabel(fieldId)}`);
    
    // Ask for refinement
    const currentField = FORM_FIELDS.find(f => f.id === fieldId);
    if (currentField) {
        let refinementPrompt = `No problem! How would you like to answer the ${getFieldLabel(fieldId)} question? I'm here to help you express it in your own way.`;
        addChatMessage('agent', refinementPrompt);
    }
}

function removeSuggestionBox(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        const suggestionBox = formGroup.querySelector('.suggestion-box');
        if (suggestionBox) {
            suggestionBox.remove();
            formGroup.classList.remove('has-suggestion');
        }
    }
}

function moveToNextField() {
    // Start from the next field after current
    for (let i = currentFieldIndex + 1; i < FORM_FIELDS.length; i++) {
        const field = FORM_FIELDS[i];
        
        if (field.conditional && field.id === 'otherCategory') {
            const category = document.getElementById('projectCategory').value;
            if (category !== 'other') continue;
        }
        
        // Check if field already has a value
        const fieldValue = getFieldValue(field.id);
        if (!fieldValue) {
            // Found an empty field
            currentFieldIndex = i;
            highlightCurrentField(field.id);
            
            // Ask about the field after a short delay
            setTimeout(() => {
                askAboutField(field);
            }, 200);
            return;
        }
    }
    
    // No more empty fields
    currentFieldIndex = FORM_FIELDS.length;
    checkFormCompletion();
}

async function classifyUserIntent(message) {
    try {
        const response = await fetch('http://localhost:3005/api/llm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a classifier. Determine if the user message is asking a QUESTION (seeking information) or providing PROJECT INPUT (describing their project). Respond with ONLY one word: "question" or "input".'
                    },
                    {
                        role: 'user',
                        content: `Classify this message: "${message}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 10
            })
        });
        
        const data = await response.json();
        const classification = data.content.toLowerCase().trim();
        
        // Default to input if unclear
        return classification.includes('question') ? 'question' : 'input';
    } catch (error) {
        console.error('Classification error:', error);
        // Default to input on error
        return 'input';
    }
}

async function handleUserQuestion(message) {
    try {
        // Get current field context
        const currentField = FORM_FIELDS[currentFieldIndex];
        const fieldName = currentField ? currentField.label : 'the application';
        
        const response = await fetch('http://localhost:3005/api/llm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: `You are helping with the $888 REGEN IRL Grant application for regenerative projects.

ELIGIBLE PROJECTS:
- Carbon Sequestration: Reforestation, afforestation, soil carbon projects, biochar initiatives
- Biodiversity: Habitat restoration, wildlife corridors, pollinator gardens, native species protection
- Regenerative Agriculture: Permaculture, agroforestry, rotational grazing, cover cropping, no-till farming
- Water Conservation: Watershed restoration, rainwater harvesting, greywater systems, wetland creation
- Soil Health: Composting initiatives, erosion control, mycorrhizal network restoration
- Renewable Energy: Community solar, microgrids, biomass from waste, small-scale wind
- Waste Reduction: Circular economy projects, upcycling, community composting, plastic alternatives
- Other Environmental Projects: Ocean cleanup, urban greening, environmental education, eco-restoration

GRANT DETAILS:
- Award Amount: $888 USDC
- Bonus: All qualifying applicants receive $10 in $REGEN tokens
- Focus: Projects with measurable Planetary Return on Investment (PROI)
- Stage: Any stage from idea to scaling (idea, planning, pilot, ongoing, scaling up)

Currently helping with: "${fieldName}" field. Answer questions concisely (under 3 sentences) and be encouraging about their project ideas.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        });
        
        const data = await response.json();
        addChatMessage('agent', data.content);
        
        // After answering the question, remind them about the current field
        setTimeout(() => {
            if (currentField && !getFieldValue(currentField.id)) {
                addChatMessage('agent', `When you're ready, feel free to tell me about your ${currentField.label.toLowerCase()}, or type "skip" to move to the next field.`);
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error handling question:', error);
        addChatMessage('agent', 'I can help you with that! The REGEN IRL Grant provides $888 to support regenerative projects. Feel free to ask any questions or continue filling out your application.');
    }
}

function askAboutField(field) {
    let question = '';
    
    switch(field.id) {
        case 'projectTitle':
            question = "Great! Now that I understand your vision, what would you like to call your project? A clear, memorable name works best.";
            break;
        case 'projectSummary':
            question = "Perfect name! Can you give me a 2-3 sentence elevator pitch for your project? Imagine you're explaining it to someone who's never heard of it before.";
            break;
        case 'projectCategory':
            question = "Thanks! Your project sounds impactful. Which environmental focus area best captures its primary benefit: Carbon Sequestration, Biodiversity, Regenerative Agriculture, Water Conservation, Soil Health, Renewable Energy, Waste Reduction, or Other?";
            break;
        case 'proiGeneration':
            question = "Excellent! Now let's talk impact. How will your project create measurable environmental returns? Think about specific metrics like tons of CO2 captured, species protected, liters of water saved, or hectares restored.";
            break;
        case 'projectStage':
            question = "Those are great metrics! Where are you in your journey? Is this still an idea you're developing, actively planning, running a pilot, already implementing, or ready to scale up?";
            break;
        case 'timeline':
            question = "Good to know where you're at! What are your next 3-4 major milestones over the coming year? Include rough timeframes if you can.";
            break;
        case 'grantImportance':
            question = "Thanks for sharing your roadmap! How critical is this $888 grant for your project? Rate 1-5, where 1 means 'nice to have' and 5 means 'essential for moving forward'.";
            break;
        case 'confidence':
            question = "I appreciate your honesty! Based on your experience and planning, how confident are you (1-10) that you'll achieve the environmental impact you described? 10 being certain, 1 being hopeful.";
            break;
        case 'projectUrl':
            question = "Do you have a website, social media page, or documentation where we can learn more about your project? Feel free to share a link, or type 'skip' if you don't have one yet.";
            break;
        case 'email':
            question = "Almost done! What's the best email to reach you at for updates about your application?";
            break;
        case 'walletAddress':
            question = "Last step! If you win, we'll send the $888 USDC grant to your crypto wallet. Please provide your EVM-compatible wallet address (starts with 0x).";
            break;
    }
    
    if (question) {
        addChatMessage('agent', question);
    }
}

async function handleSendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Rate limiting check
    if (!checkRateLimit('message')) {
        return;
    }
    
    addChatMessage('user', message);
    input.value = '';
    
    // Check for chat commands
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage === 'accept' || lowerMessage === 'yes' || lowerMessage === 'ok') {
        const currentField = FORM_FIELDS[currentFieldIndex];
        if (currentField && pendingSuggestions[currentField.id]) {
            acceptSuggestion(currentField.id);
            return;
        }
    } else if (lowerMessage === 'reject' || lowerMessage === 'no' || lowerMessage === 'nope') {
        const currentField = FORM_FIELDS[currentFieldIndex];
        if (currentField && pendingSuggestions[currentField.id]) {
            rejectSuggestion(currentField.id);
            return;
        }
    } else if (lowerMessage === 'skip' || lowerMessage === 'next') {
        moveToNextField();
        if (currentFieldIndex < FORM_FIELDS.length) {
            const nextField = FORM_FIELDS[currentFieldIndex];
            if (nextField) {
                askAboutField(nextField);
            }
        }
        return;
    } else if (lowerMessage === 'submit' || lowerMessage === 'finish') {
        // Jump to email field if not filled
        const email = getFieldValue('email');
        if (!email) {
            currentFieldIndex = FORM_FIELDS.findIndex(f => f.id === 'email');
            highlightCurrentField('email');
            askAboutField(FORM_FIELDS[currentFieldIndex]);
        } else {
            addChatMessage('agent', "✅ Great! You already have an email provided. You can click 'Submit Application' to submit your grant application now!");
            document.getElementById('grantApplication').scrollIntoView({ behavior: 'smooth' });
        }
        return;
    }
    
    // Use AI to determine if this is a question or project information
    const userIntent = await classifyUserIntent(message);
    
    if (userIntent === 'question') {
        // Handle as a question - provide information without generating field suggestions
        await handleUserQuestion(message);
    } else {
        // Process as project input for the current field
        await processUserMessage(message);
    }
}

async function processUserMessage(message) {
    // Special handling for numeric inputs that might be for rating fields
    const isNumericInput = /^\d+$/.test(message.trim());
    
    // Find the first empty field to work on, skipping conditional fields that shouldn't show
    let targetField = null;
    for (let i = 0; i < FORM_FIELDS.length; i++) {
        const field = FORM_FIELDS[i];
        
        // Skip otherCategory field if not "other" selected
        if (field.id === 'otherCategory') {
            const category = document.getElementById('projectCategory').value;
            if (category !== 'other') continue;
        }
        
        // Skip already filled fields
        const fieldValue = getFieldValue(field.id);
        if (fieldValue) {
            console.log(`Skipping filled field: ${field.id} = ${fieldValue}`);
            continue;
        }
        
        // If this is a numeric input and we found an empty radio field that expects numbers, prioritize it
        if (isNumericInput && (field.id === 'grantImportance' || field.id === 'confidence')) {
            console.log(`Found numeric field for input "${message}": ${field.id}`);
            targetField = field;
            currentFieldIndex = i;
            break;
        }
        
        // Otherwise, take the first empty field
        if (!targetField) {
            targetField = field;
            currentFieldIndex = i;
        }
    }
    
    if (!targetField) {
        // All fields are filled
        checkFormCompletion();
        return;
    }
    
    const currentField = targetField;
    const formState = getFormState();
    
    try {
        // Get suggestion from direct LLM API
        const suggestion = await getFieldSuggestion(message, currentField, formState);
        
        if (suggestion) {
            pendingSuggestions[currentField.id] = suggestion;
            showFieldSuggestion(currentField.id, suggestion);
            
            // Add response with suggestion and action buttons
            const response = generateAgentResponse(currentField, suggestion);
            addChatMessage('agent', response, true, currentField.id);
        } else {
            addChatMessage('agent', "I couldn't generate a suggestion for that. Could you provide more details?");
        }
        
    } catch (error) {
        console.error('Error processing message:', error);
        addChatMessage('agent', "I'm having trouble processing that. Could you try rephrasing your response?");
    }
}

async function getFieldSuggestion(userInput, field, formState) {
    // Build a focused prompt for the specific field
    let systemPrompt = "You are helping fill out a grant application form. Generate ONLY the requested field value based on the user's input. Be concise and specific.";
    let userPrompt = "";
    
    switch(field.id) {
        case 'projectTitle':
            systemPrompt = "Generate a project title (max 50 characters) based on the user's description.";
            userPrompt = `User describes their project as: "${userInput}". Generate ONLY a short, memorable project title. No explanations.`;
            break;
            
        case 'projectSummary':
            const title = getFieldValue('projectTitle') || 'the project';
            systemPrompt = "Generate a plain text 2-3 sentence project summary. NO markdown, NO formatting, just simple text.";
            userPrompt = `Project Title: "${title}"\nUser describes: "${userInput}"\nGenerate ONLY a 2-3 sentence summary in PLAIN TEXT. No markdown, no bold, no asterisks, no formatting. Just simple sentences describing what the project does, its goals, and impact.`;
            break;
            
        case 'projectCategory':
            systemPrompt = "Select ONE category from the given list based on the user's input.";
            userPrompt = `User says: "${userInput}"\nSelect ONLY ONE from: carbon-sequestration, biodiversity, regenerative-agriculture, water-conservation, soil-health, renewable-energy, waste-reduction, other\nReturn ONLY the category name, nothing else.`;
            break;
            
        case 'proiGeneration':
            systemPrompt = "Convert the user's input into a brief PLAIN TEXT PROI description. NO markdown formatting.";
            userPrompt = `User says: "${userInput}"\n\nCreate a brief description in PLAIN TEXT using ONLY what they stated. Rules:\n1. NO markdown, bold, italics, or any formatting\n2. If they give specific numbers, use those EXACT numbers\n3. If no numbers given, keep it general\n4. NEVER invent numbers they didn't provide\n5. Keep under 3 sentences of plain text\n\nExample: If user says "save 100 trees and reduce carbon by 50 tons", write plain text like "The project will protect 100 trees and reduce carbon emissions by 50 tons."`;
            break;
            
        case 'projectStage':
            systemPrompt = "Select ONE project stage from the given list based on the user's input.";
            userPrompt = `User says: "${userInput}"\nSelect ONLY ONE from: idea, planning, pilot, ongoing, scaling\nReturn ONLY the stage name, nothing else.`;
            break;
            
        case 'timeline':
            systemPrompt = "Generate a plain text project timeline with NO markdown, NO bold text, NO asterisks, NO formatting. Just simple bullet points.";
            userPrompt = `User describes their project goals as: "${userInput}"\n\nCreate 3-4 milestones using their exact numbers. Rules:\n- NO markdown formatting\n- NO bold text or asterisks\n- Simple format: "Month X: [action with specific target]"\n- Use bullet points (•) or dashes (-)\n- Include their exact numbers distributed across milestones\n\nExample output:\n- Month 3: Protect first 2,500 trees\n- Month 6: Reach 5,000 trees protected\n- Month 9: Achieve 7,500 trees protected\n- Month 12: Complete 10,000 trees protected`;
            break;
            
        case 'grantImportance':
            systemPrompt = "Select a number from 1-5 based on how important the grant is to the user.";
            userPrompt = `User says: "${userInput}"\n1=nice to have, 5=essential\nReturn ONLY a number from 1 to 5.`;
            break;
            
        case 'confidence':
            systemPrompt = "Select a confidence level from 1-10 based on the user's input.";
            userPrompt = `User says: "${userInput}"\n1=hopeful, 10=certain\nReturn ONLY a number from 1 to 10.`;
            break;
            
        case 'projectUrl':
            systemPrompt = "Extract or format a valid URL from the user's input.";
            userPrompt = `User says: "${userInput}"\nIf they provide a URL or website name, format it as a valid URL. If they say 'skip', 'none', 'no', or similar, return empty string. Return ONLY the URL or empty string, no explanations.`;
            break;
            
        case 'email':
            systemPrompt = "Extract or generate a valid email address.";
            userPrompt = `User says: "${userInput}"\nExtract or format as a valid email address. Return ONLY the email.`;
            break;
            
        case 'walletAddress':
            systemPrompt = "Extract or validate an Ethereum wallet address.";
            userPrompt = `User says: "${userInput}"\nExtract the Ethereum wallet address (starts with 0x). Return ONLY the address.`;
            break;
            
        default:
            userPrompt = `User says: "${userInput}"\nGenerate appropriate content for the ${field.label} field.`;
    }
    
    // Call the direct API endpoint
    console.log('Calling direct LLM API for field:', field.id);
    console.log('API endpoint:', `${API_BASE}/direct-llm`);
    
    try {
        const response = await fetch(`${API_BASE}/direct-llm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemPrompt: systemPrompt,
                userPrompt: userPrompt,
                maxTokens: 200,
                temperature: 0.3 // Low temperature for more deterministic responses
            })
        });

        console.log('API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Clean and validate the response
        let suggestion = data.text || data.response || '';
        suggestion = suggestion.trim();
        
        // Remove surrounding quotes if present (LLM often adds them)
        if (suggestion.startsWith('"') && suggestion.endsWith('"')) {
            suggestion = suggestion.slice(1, -1);
        }
        
        // Clean up markdown formatting for all text fields
        if (field.type === 'textarea' || field.type === 'text' || field.id === 'timeline' || field.id === 'proiGeneration' || field.id === 'projectSummary') {
            // Remove markdown bold syntax
            suggestion = suggestion.replace(/\*\*/g, '');
            suggestion = suggestion.replace(/\*/g, '');
            suggestion = suggestion.replace(/#{1,6}\s/g, ''); // Remove headers
            suggestion = suggestion.replace(/^\s*[-*+]\s/gm, '• '); // Standardize bullets (for lists)
            suggestion = suggestion.replace(/\n\n+/g, '\n'); // Remove extra line breaks
            suggestion = suggestion.replace(/^\s*>\s/gm, ''); // Remove blockquotes
            suggestion = suggestion.replace(/`([^`]+)`/g, '$1'); // Remove inline code formatting
            suggestion = suggestion.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
        }
        
        // Validate based on field type
        if (field.type === 'select') {
            const select = document.getElementById(field.id);
            const options = Array.from(select.options).map(o => o.value).filter(v => v);
            
            // Find matching option
            const match = options.find(o => 
                o === suggestion || 
                o === suggestion.toLowerCase() ||
                o === suggestion.replace(/\s+/g, '-') ||
                o.replace(/-/g, ' ') === suggestion.toLowerCase()
            );
            
            return match || null;
        }
        
        return suggestion;
        
    } catch (error) {
        console.error('Direct LLM API error:', error);
        // Fallback to a simple rule-based suggestion
        return generateFallbackSuggestion(userInput, field);
    }
}

function generateFallbackSuggestion(userInput, field) {
    // Simple fallback suggestions when API fails
    switch(field.id) {
        case 'projectTitle':
            return userInput.split(' ').slice(0, 4).map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ') + ' Initiative';
            
        case 'projectCategory':
            const categories = ['carbon-sequestration', 'biodiversity', 'regenerative-agriculture', 
                              'water-conservation', 'soil-health', 'renewable-energy', 'waste-reduction'];
            const lower = userInput.toLowerCase();
            for (const cat of categories) {
                if (lower.includes(cat.split('-')[0])) {
                    return cat;
                }
            }
            return 'other';
            
        case 'projectStage':
            if (userInput.includes('idea')) return 'idea';
            if (userInput.includes('plan')) return 'planning';
            if (userInput.includes('pilot') || userInput.includes('test')) return 'pilot';
            if (userInput.includes('running') || userInput.includes('ongoing')) return 'ongoing';
            if (userInput.includes('scale') || userInput.includes('expand')) return 'scaling';
            return 'planning';
            
        default:
            return null;
    }
}

function generateAgentResponse(field, suggestion) {
    // Generate a contextual response about the suggestion
    let baseMessage = '';
    
    switch(field.id) {
        case 'projectTitle':
            baseMessage = `Based on what you told me, "${suggestion.replace(/"/g, '')}" would be a great project title!`;
            break;
            
        case 'projectSummary':
            baseMessage = `I've crafted this summary based on your description:`;
            break;
            
        case 'projectCategory':
            baseMessage = `Based on your project focus, I'd suggest the "${suggestion.replace(/-/g, ' ')}" category.`;
            break;
            
        case 'proiGeneration':
            baseMessage = `I've outlined your environmental impact based on what you told me:`;
            break;
            
        case 'grantImportance':
            baseMessage = `Based on your input, I'd suggest rating the grant importance as ${suggestion} out of 5.`;
            break;
            
        case 'confidence':
            baseMessage = `Based on your response, I'd suggest a confidence level of ${suggestion} out of 10.`;
            break;
            
        case 'projectStage':
            const stages = {
                'idea': 'Idea/Concept',
                'planning': 'Planning/Development', 
                'pilot': 'Pilot Project',
                'ongoing': 'Ongoing Implementation',
                'scaling': 'Scaling Up'
            };
            baseMessage = `Based on what you said, I'd suggest the "${stages[suggestion] || suggestion}" stage.`;
            break;
            
        case 'email':
            baseMessage = `I've formatted your email address: ${suggestion}`;
            break;
            
        case 'walletAddress':
            baseMessage = `Here's your wallet address: ${suggestion}`;
            break;
            
        case 'timeline':
            baseMessage = `I've created a timeline based on your goals:`;
            break;
            
        default:
            baseMessage = `Here's my suggestion: "${suggestion}"`;
    }
    
    // For fields that show the suggestion inline (text/textarea), show it
    if ((field.type === 'textarea' || field.id === 'timeline') && field.id !== 'email' && field.id !== 'walletAddress') {
        return `✨ ${baseMessage}\n\n"${suggestion}"`;
    } else {
        return `✨ ${baseMessage}`;
    }
}

function addChatMessage(sender, message, hasSuggestion = false, fieldId = null) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    if (hasSuggestion) {
        messageDiv.classList.add('has-suggestion-indicator');
    }
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Escape HTML but preserve newlines for display
    const formattedMessage = escapeHtml(message).replace(/\n/g, '<br>');
    
    let messageContent = `
        <div class="message-content">
            ${sender === 'agent' && hasSuggestion ? '<span class="suggestion-indicator">✨</span>' : ''}
            ${formattedMessage}
        </div>
    `;
    
    // Add action buttons for suggestions
    if (hasSuggestion && fieldId && pendingSuggestions[fieldId]) {
        // Create unique ID for this message's buttons
        const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        messageContent += `
            <div class="chat-suggestion-actions" id="${messageId}">
                <button class="chat-btn chat-accept-btn" data-field="${fieldId}">
                    <span>✓</span> Accept
                </button>
                <button class="chat-btn chat-reject-btn" data-field="${fieldId}">
                    <span>✗</span> Try Again
                </button>
            </div>
        `;
        
        // Attach handlers after adding to DOM
        setTimeout(() => {
            const container = document.getElementById(messageId);
            if (container) {
                const acceptBtn = container.querySelector('.chat-accept-btn');
                const rejectBtn = container.querySelector('.chat-reject-btn');
                
                if (acceptBtn) {
                    acceptBtn.addEventListener('click', () => {
                        try {
                            acceptSuggestion(fieldId);
                        } catch (error) {
                            console.error('Error accepting suggestion:', error);
                            addChatMessage('system', '⚠️ There was an issue accepting the suggestion. Please try again or type your own answer.');
                        }
                    });
                }
                
                if (rejectBtn) {
                    rejectBtn.addEventListener('click', () => {
                        try {
                            rejectSuggestion(fieldId);
                        } catch (error) {
                            console.error('Error rejecting suggestion:', error);
                            addChatMessage('system', '⚠️ There was an issue. Please type your own answer.');
                        }
                    });
                }
            }
        }, 10);
    }
    
    messageContent += `<div class="message-timestamp">${timestamp}</div>`;
    
    messageDiv.innerHTML = messageContent;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    conversationHistory.push({ sender, message, timestamp });
}

function getFormState() {
    const fields = FORM_FIELDS.filter(f => !f.conditional || shouldShowField(f));
    const completedFields = [];
    const emptyFields = [];
    
    fields.forEach(field => {
        const value = getFieldValue(field.id);
        if (value) {
            completedFields.push(field.id);
        } else {
            emptyFields.push(field.id);
        }
    });
    
    return {
        totalFields: fields.length,
        completedFields: completedFields,
        emptyFields: emptyFields,
        completionPercentage: Math.round((completedFields.length / fields.length) * 100)
    };
}

function shouldShowField(field) {
    if (field.id === 'otherCategory') {
        return document.getElementById('projectCategory').value === 'other';
    }
    return true;
}

function getFieldValue(fieldId) {
    // Special handling for otherCategory - only consider it if category is "other"
    if (fieldId === 'otherCategory') {
        const category = document.getElementById('projectCategory').value;
        if (category !== 'other') {
            return 'N/A'; // Return a non-null value to skip this field
        }
    }
    
    // For radio button groups, check by name attribute
    if (fieldId === 'grantImportance' || fieldId === 'confidence') {
        const checked = document.querySelector(`input[name="${fieldId}"]:checked`);
        return checked ? checked.value : null;
    }
    
    const element = document.getElementById(fieldId);
    if (!element) return null;
    
    return element.value || null;
}

function getFieldLabel(fieldId) {
    const field = FORM_FIELDS.find(f => f.id === fieldId);
    return field ? field.label : fieldId;
}

function updateFormProgress() {
    const state = getFormState();
    console.log(`Application ${state.completionPercentage}% complete`);
}

function checkFieldCompletion(fieldId) {
    const value = getFieldValue(fieldId);
    
    if (value) {
        // Find which field was just completed
        const fieldIndex = FORM_FIELDS.findIndex(f => f.id === fieldId);
        
        // If this is the current field we're asking about, move to next
        if (fieldIndex === currentFieldIndex) {
            // Just move to next field, don't ask again
            setTimeout(() => {
                moveToNextField();
            }, 500);
        } else if (fieldIndex > currentFieldIndex) {
            // User filled a field ahead of where we are - update position
            currentFieldIndex = fieldIndex;
            setTimeout(() => {
                moveToNextField();
            }, 500);
        }
    }
}

function checkFormCompletion() {
    const state = getFormState();
    const email = getFieldValue('email');
    
    // Only email is required
    if (email) {
        if (state.emptyFields.length === 0) {
            addChatMessage('agent', "🎉 Fantastic work! Your application is complete and your project sounds amazing. When you're ready, click 'Submit Application' to send it in. Wishing you the best of luck with your regenerative work! 🌱");
        } else {
            // Email is filled, can submit anytime
            addChatMessage('agent', "✅ You have enough information to submit! Feel free to click 'Submit Application' now, or continue adding more details if you'd like. The more you share, the better we can understand your project!");
        }
    } else if (state.emptyFields.includes('email')) {
        // Still need email
        const otherEmpty = state.emptyFields.filter(f => f !== 'email').length;
        if (otherEmpty > 0) {
            addChatMessage('agent', `Great progress! You can skip any fields you want, but we'll need your email address to contact you about your application.`);
        } else {
            addChatMessage('agent', `Almost ready to submit! Just need your email address so we can contact you about your grant.`);
        }
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Rate limiting check for submissions
    if (!checkRateLimit('submission')) {
        return;
    }
    
    const formData = new FormData(e.target);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    data.chatHistory = conversationHistory;
    
    try {
        const response = await fetch(`${API_BASE}/grants/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            
            // Show success celebration with confetti and voice
            showSuccessCelebration(result.applicationId);
            
            // Announce success with voice
            const successMessage = '🎊 Congratulations! Your grant application has been successfully submitted! We\'re thrilled to support your regenerative project. You should receive a confirmation email shortly. Good luck, and thank you for making the world a better place!';
            
            // Add to chat
            addChatMessage('agent', successMessage);
            
            // Speak the message
            speakMessage(successMessage);
            
            // Disable form temporarily
            document.getElementById('grantApplication').style.opacity = '0.5';
            document.getElementById('grantApplication').style.pointerEvents = 'none';
        } else {
            const error = await response.json();
            addChatMessage('agent', `There was an issue submitting your application: ${error.error || 'Please try again.'}`);
        }
    } catch (error) {
        console.error('Submission error:', error);
        addChatMessage('agent', 'Network error. Please check your connection and try again.');
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Text-to-speech function
function speakMessage(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 0.9;
        
        // Get available voices
        let voices = window.speechSynthesis.getVoices();
        
        // If voices aren't loaded yet, wait for them
        if (voices.length === 0) {
            window.speechSynthesis.addEventListener('voiceschanged', function() {
                voices = window.speechSynthesis.getVoices();
                selectBestVoice(utterance, voices);
                window.speechSynthesis.speak(utterance);
            });
        } else {
            selectBestVoice(utterance, voices);
            window.speechSynthesis.speak(utterance);
        }
    }
}

function selectBestVoice(utterance, voices) {
    // Priority list of natural-sounding English voices
    const preferredVoices = [
        'Google UK English Female',
        'Google UK English Male', 
        'Google US English',
        'Microsoft Zira',
        'Microsoft David',
        'Samantha', // macOS
        'Alex', // macOS
        'Karen', // macOS
        'Daniel' // macOS
    ];
    
    // First, try to find a preferred voice
    for (const preferred of preferredVoices) {
        const voice = voices.find(v => v.name.includes(preferred));
        if (voice) {
            utterance.voice = voice;
            return;
        }
    }
    
    // Fallback: Find any English voice (avoid German/other languages)
    const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en-') || voice.lang === 'en'
    );
    
    if (englishVoice) {
        utterance.voice = englishVoice;
    }
}

// Success celebration with confetti
function showSuccessCelebration(applicationId) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-modal">
            <div class="confetti-container" id="confetti-container"></div>
            <div class="success-content">
                <div class="success-icon">🎊</div>
                <h2>Congratulations!</h2>
                <p>Your grant application has been submitted successfully!</p>
                <p class="application-id">Application ID: #${applicationId}</p>
                <p class="success-message">You're one step closer to making a real impact! We'll review your application and get back to you soon.</p>
                <div class="success-actions">
                    <button class="btn-primary" onclick="closeSuccessCelebration()">Continue</button>
                    <button class="btn-secondary" onclick="startNewApplication()">Submit Another</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
        overlay.classList.add('show');
        createConfetti();
    }, 100);
}

// Create confetti animation
function createConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    const colors = ['#1a7a4c', '#2e9d78', '#42d4aa', '#5fe4c0', '#7ff0d0', '#26a69a'];
    const confettiCount = 150;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        container.appendChild(confetti);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Close success celebration
function closeSuccessCelebration() {
    const overlay = document.querySelector('.success-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
            // Re-enable form
            document.getElementById('grantApplication').style.opacity = '1';
            document.getElementById('grantApplication').style.pointerEvents = 'auto';
        }, 300);
    }
}

// Start new application
function startNewApplication() {
    closeSuccessCelebration();
    
    // Reset form and state
    document.getElementById('grantApplication').reset();
    pendingSuggestions = {};
    currentFieldIndex = 0;
    conversationHistory = [];
    
    // Clear chat and restart
    document.getElementById('chatContainer').innerHTML = '';
    initializeChat();
    startGuidedFlow();
}

// Rate limiting function
function checkRateLimit(type) {
    const now = Date.now();
    const limits = {
        message: {
            max: 30,        // 30 messages
            window: 60000,  // per minute
            cooldown: 5000  // 5 second cooldown after limit
        },
        submission: {
            max: 3,         // 3 submissions
            window: 600000, // per 10 minutes
            cooldown: 300000 // 5 minute cooldown
        }
    };
    
    const limit = limits[type];
    if (!limit) return true;
    
    // Clean old entries
    const cutoff = now - limit.window;
    if (type === 'message') {
        rateLimits.messages = rateLimits.messages.filter(t => t > cutoff);
    } else {
        rateLimits.submissions = rateLimits.submissions.filter(t => t > cutoff);
    }
    
    // Check if over limit
    const list = type === 'message' ? rateLimits.messages : rateLimits.submissions;
    
    if (list.length >= limit.max) {
        // Show warning only once per cooldown period
        if (now - rateLimits.lastWarning > limit.cooldown) {
            if (type === 'message') {
                addChatMessage('system', '⚠️ You\'re sending messages too quickly. Please wait a moment before continuing.');
                // Disable input temporarily
                const input = document.getElementById('chatInput');
                const sendBtn = document.getElementById('sendBtn');
                input.disabled = true;
                sendBtn.disabled = true;
                
                setTimeout(() => {
                    input.disabled = false;
                    sendBtn.disabled = false;
                    input.focus();
                    addChatMessage('system', '✅ You can continue now.');
                }, limit.cooldown);
            } else {
                addChatMessage('agent', '⚠️ You\'ve submitted multiple applications recently. Please wait 5 minutes before submitting another one. This helps us prevent spam and ensure everyone gets a fair chance.');
            }
            rateLimits.lastWarning = now;
        }
        return false;
    }
    
    // Add to tracking
    list.push(now);
    return true;
}

// Global functions for inline handlers
window.acceptSuggestion = acceptSuggestion;
window.editSuggestion = editSuggestion;
window.rejectSuggestion = rejectSuggestion;
window.closeSuccessCelebration = closeSuccessCelebration;
window.startNewApplication = startNewApplication;