document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatContainer = document.getElementById('chatContainer');
    const form = document.getElementById('grantApplication');
    const projectCategory = document.getElementById('projectCategory');
    const otherCategoryGroup = document.getElementById('otherCategoryGroup');

    // Chat functionality
    const responses = {
        greetings: [
            "Hello! I'm here to help you with your REGEN IRL Grant application. What questions do you have?",
            "Hi there! Ready to work on your grant application? I can help explain any part of the form.",
            "Welcome! I'm your AI assistant for the grant application. How can I assist you today?"
        ],
        proi: [
            "PROI stands for Planetary Return on Investment - it measures the positive environmental impact of your project. This could include carbon sequestration, biodiversity enhancement, soil health improvement, water conservation, or other measurable environmental benefits.",
            "Planetary Return on Investment (PROI) is about quantifying the environmental benefits your project creates. Think about how your project helps the planet - does it capture carbon, restore habitats, improve soil, conserve water, or create other positive environmental outcomes?"
        ],
        timeline: [
            "For your timeline, break down your project into key phases with specific dates. Include major milestones like planning completion, implementation start, first results, and final outcomes. Be realistic but show clear progress markers.",
            "A good timeline should show: 1) When you'll complete planning, 2) Implementation phases with dates, 3) Key milestones for measuring success, 4) Expected completion date. Make it specific and achievable."
        ],
        documents: [
            "Supporting documents help demonstrate your project's credibility and impact potential. You can upload project proposals, photos of existing work, videos, research papers, or any materials that show your project's feasibility and environmental benefits.",
            "Good supporting documents include: project plans, photos of your site or previous work, letters of support, research backing your approach, or videos explaining your project. Max 10MB per file."
        ],
        wallet: [
            "You need an EVM-compatible wallet address that can receive USDC on Mainnet, Base, or Celo networks. This should be a wallet you control (like MetaMask) starting with '0x'. Make sure you have access to this wallet!",
            "Your wallet address should be compatible with Ethereum Virtual Machine (EVM) and able to receive USDC tokens. Popular options include MetaMask, Coinbase Wallet, or hardware wallets. Double-check the address is correct!"
        ],
        stages: [
            "Choose the stage that best fits your project: Idea/Concept (just starting to think about it), Planning/Development (researching and planning), Pilot Project (small-scale testing), Ongoing Implementation (actively working), or Scaling Up (expanding successful work).",
            "Project stages help us understand where you are: Idea = early concept, Planning = developing the approach, Pilot = testing on small scale, Ongoing = active implementation, Scaling = expanding proven results."
        ]
    };

    // Show/hide other category input
    projectCategory.addEventListener('change', function() {
        if (this.value === 'other') {
            otherCategoryGroup.style.display = 'block';
            document.getElementById('otherCategory').required = true;
        } else {
            otherCategoryGroup.style.display = 'none';
            document.getElementById('otherCategory').required = false;
        }
    });

    // Chat functionality
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'agent-message'}`;
        messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message agent-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                AI is typing
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const typing = document.getElementById('typing-indicator');
        if (typing) {
            typing.remove();
        }
    }

    function getResponse(userInput) {
        const input = userInput.toLowerCase();
        
        if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
            return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
        }
        
        if (input.includes('proi') || input.includes('planetary return') || input.includes('environmental impact')) {
            return responses.proi[Math.floor(Math.random() * responses.proi.length)];
        }
        
        if (input.includes('timeline') || input.includes('milestone') || input.includes('schedule')) {
            return responses.timeline[Math.floor(Math.random() * responses.timeline.length)];
        }
        
        if (input.includes('document') || input.includes('upload') || input.includes('file') || input.includes('photo') || input.includes('video')) {
            return responses.documents[Math.floor(Math.random() * responses.documents.length)];
        }
        
        if (input.includes('wallet') || input.includes('address') || input.includes('usdc') || input.includes('evm')) {
            return responses.wallet[Math.floor(Math.random() * responses.wallet.length)];
        }
        
        if (input.includes('stage') || input.includes('phase') || input.includes('development')) {
            return responses.stages[Math.floor(Math.random() * responses.stages.length)];
        }
        
        if (input.includes('title') || input.includes('name')) {
            return "Your project title should be clear and descriptive. It should give reviewers a good sense of what your project is about in just a few words. Think of it as your project's headline!";
        }
        
        if (input.includes('summary') || input.includes('describe')) {
            return "In your project summary, briefly explain what you're doing, why it matters for the environment, and what impact you expect. Keep it to 2-3 sentences but make them count!";
        }
        
        if (input.includes('category') || input.includes('focus')) {
            return "Choose the category that best matches your project's main environmental focus. If none fit perfectly, select 'Other' and specify your focus. The categories help us understand the type of environmental impact you're creating.";
        }
        
        if (input.includes('confidence') || input.includes('achieve') || input.includes('goals')) {
            return "Rate your confidence in achieving your PROI goals honestly. Consider your experience, resources, timeline, and any potential challenges. Higher confidence should be backed by solid planning and realistic expectations.";
        }
        
        if (input.includes('importance') || input.includes('grant') || input.includes('funding')) {
            return "Consider how critical this $888 grant is for your project's success. Is it essential to get started, helpful for acceleration, or nice to have? Be honest - this helps us understand the grant's potential impact.";
        }
        
        if (input.includes('help') || input.includes('assist')) {
            return "I can help you understand any part of this grant application! Ask me about PROI, project stages, timelines, required documents, wallet addresses, or any specific field you're unsure about.";
        }
        
        // Default responses
        const defaultResponses = [
            "I'd be happy to help with that! Could you be more specific about which part of the application you need assistance with?",
            "That's a great question! Can you tell me more about what specifically you'd like to know?",
            "I'm here to help you complete your grant application successfully. What particular aspect would you like guidance on?",
            "Feel free to ask about any part of the application - PROI requirements, project stages, timelines, or anything else you're curious about!"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        addMessage(message, true);
        chatInput.value = '';

        showTypingIndicator();

        // Simulate AI thinking time
        setTimeout(() => {
            hideTypingIndicator();
            const response = getResponse(message);
            addMessage(response);
        }, 1000 + Math.random() * 2000);
    }

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic validation
        const requiredFields = form.querySelectorAll('[required]');
        let hasErrors = false;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('highlight');
                hasErrors = true;
            } else {
                field.classList.remove('highlight');
            }
        });

        if (hasErrors) {
            addMessage("I noticed some required fields are missing. I've highlighted them in the form. Please fill them out and try again!", false);
            return;
        }

        // Validate wallet address format
        const walletAddress = document.getElementById('walletAddress').value;
        if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            document.getElementById('walletAddress').classList.add('highlight');
            addMessage("Your wallet address doesn't look quite right. It should start with '0x' and be 42 characters long. Please double-check it!", false);
            return;
        }

        // Success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <h3>🎉 Application Submitted Successfully!</h3>
            <p>Thank you for applying to the REGEN IRL Grant! Your application has been received and will be reviewed by our team. You should receive a confirmation email shortly.</p>
            <p><strong>Next steps:</strong> All qualifying applicants will receive $10 in $REGEN, and the winner will receive $888 USDC. We'll be in touch!</p>
        `;
        
        form.parentNode.insertBefore(successDiv, form);
        form.style.display = 'none';
        
        addMessage("🎉 Congratulations! Your grant application has been submitted successfully. You should receive a confirmation email soon. Good luck with your project!", false);
    });

    // Help users with form fields
    const formFields = document.querySelectorAll('input, textarea, select');
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            const fieldName = this.name || this.id;
            let helpMessage = '';
            
            switch(fieldName) {
                case 'projectTitle':
                    helpMessage = "💡 Tip: Make your project title clear and compelling. What's the main thing you're doing for the planet?";
                    break;
                case 'projectSummary':
                    helpMessage = "💡 Tip: In 2-3 sentences, explain what you're doing, why it matters, and what impact you expect.";
                    break;
                case 'proiGeneration':
                    helpMessage = "💡 Tip: PROI is about measurable environmental benefits. How does your project help the planet in quantifiable ways?";
                    break;
                case 'timeline':
                    helpMessage = "💡 Tip: Break your project into phases with realistic dates. Show clear milestones and progress markers.";
                    break;
                case 'walletAddress':
                    helpMessage = "💡 Tip: Use an EVM wallet address (like MetaMask) that starts with '0x' and can receive USDC on Mainnet/Base/Celo.";
                    break;
            }
            
            if (helpMessage && Math.random() < 0.3) { // Show tips occasionally
                setTimeout(() => addMessage(helpMessage, false), 500);
            }
        });
    });
});