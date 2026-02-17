const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const https = require('https');

admin.initializeApp();

// TODO: Phase 5 - Web Builder Integration
// This file will need updates for the portfolio web builder

// Helper: Get AI config from Firestore
async function getAIConfig() {
  const configDoc = await admin.firestore().doc('appSettings/ai').get();
  return configDoc.exists ? configDoc.data() : {
    provider: 'deepseek',
    apiKey: process.env.AI_API_KEY || '',
    model: 'deepseek-chat'
  };
}

// Helper: Make HTTP request to AI API
function makeAIRequest(url, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

// Helper: Call AI API based on provider
async function callAIAPI(provider, apiKey, model, messages) {
  const headers = {
    'Content-Type': 'application/json'
  };

  let url, body;

  switch (provider) {
    case 'deepseek':
      url = 'https://api.deepseek.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model: model || 'deepseek-chat',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      };
      break;

    case 'openai':
      url = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model: model || 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      };
      break;

    case 'anthropic':
      url = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: model || 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: messages
      };
      break;

    case 'google':
      url = `https://generativelanguage.googleapis.com/v1/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      body = {
        contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      };
      break;

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }

  const response = await makeAIRequest(url, headers, body);

  // Parse response based on provider
  switch (provider) {
    case 'deepseek':
    case 'openai':
      return response.choices?.[0]?.message?.content || '';
    case 'anthropic':
      return response.content?.[0]?.text || '';
    case 'google':
      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    default:
      return '';
  }
}

// Helper: Check and update AI usage
async function checkAndUpdateAIUsage(userId, userData) {
  if (!userData) {
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    userData = userDoc.data();
  }
  
  if (!userData) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  
  // Admin users bypass usage limits
  if (userData.role === 'admin') {
    return userData;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `aiUsage.${today}`;
  
  // For free tier, limit to 10 AI interactions per day
  if (userData.tier === 'free') {
    const todayUsage = userData.aiUsage?.[today] || 0;
    if (todayUsage >= 10) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Daily AI limit reached. Upgrade to Premium for unlimited usage.'
      );
    }
    // Increment usage
    await admin.firestore().doc(`users/${userId}`).update({
      [`aiUsage.${today}`]: admin.firestore.FieldValue.increment(1)
    });
  }
  
  return userData;
}

// Helper: Build context from CV data and chat history
async function buildAIContext(userId, cvId, sectionType) {
  let cvContext = '';
  
  if (cvId) {
    const cvDoc = await admin.firestore().doc(`users/${userId}/cvs/${cvId}`).get();
    const cvData = cvDoc.data();
    
    if (cvData && cvData.sections) {
      const currentSection = cvData.sections.find(s => s.type === sectionType);
      if (currentSection && currentSection.entries.length > 0) {
        cvContext = `\n\nCurrent ${sectionType} section data:\n${JSON.stringify(currentSection.entries, null, 2)}`;
      }
    }
  }
  
  return cvContext;
}

// System prompt for CV building assistant
const SYSTEM_PROMPT = `You are a helpful CV building assistant. Your role is to help users fill in their CV information section by section. 

For each section, help the user by:
1. Asking clarifying questions to get the right information
2. Suggesting improvements to their content
3. Summarizing and confirming what they've shared

Be conversational, professional, and encouraging. Keep responses concise and focused on helping them complete their CV.

When users provide information, acknowledge it and help them refine it. Ask one question at a time to guide them through each section.

Current sections: personalInfo, summary, experience, education, skills, certifications, projects, languages, references

Always respond in a helpful, encouraging tone.`;

// AI Chat Handler
exports.processAIChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const { userId, cvId, message, sectionType, chatHistory } = data;
  
  // Get user data for role check
  const userDoc = await admin.firestore().doc(`users/${userId}`).get();
  const userData = userDoc.data();
  
  // Check usage limits (admin bypassed inside)
  await checkAndUpdateAIUsage(userId, userData);
  
  // Get AI config
  const aiConfig = await getAIConfig();
  
  // Check if API key is configured
  if (!aiConfig.apiKey) {
    console.log('No API key configured, returning demo response');
    const response = getDemoResponse(message, sectionType);
    return {
      success: true,
      response,
      parsedData: null
    };
  }
  
  try {
    // Build context about current CV section
    const cvContext = await buildAIContext(userId, cvId, sectionType);
    
    // Build messages array for API call
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + `\n\nCurrently working on section: ${sectionType}${cvContext}` }
    ];
    
    // Add recent chat history (last 10 messages)
    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }
    
    // Add current user message
    messages.push({ role: 'user', content: message });
    
    // Call AI API
    const aiResponse = await callAIAPI(
      aiConfig.provider,
      aiConfig.apiKey,
      aiConfig.model,
      messages
    );
    
    return {
      success: true,
      response: aiResponse,
      parsedData: null
    };
    
  } catch (error) {
    console.error('AI API error:', error.message);
    // Fallback to demo response on error
    const response = getDemoResponse(message, sectionType);
    return {
      success: true,
      response,
      parsedData: null,
      error: error.message
    };
  }
});

function getDemoResponse(userInput, sectionType) {
  const responses = {
    personalInfo: "Great! I've noted your details. Let me summarize what you've shared. Ready to move on to your professional summary?",
    summary: "That's a solid summary! It highlights your professional background well. Shall we add your work experience next?",
    experience: "Thanks for sharing that! That's valuable experience. Would you like to add another role or move to education?",
    education: "Good to know! Your educational background is now saved. Ready to add your skills?",
    skills: "Excellent skills list! These will make your CV stand out. Any certifications or awards to add?",
    certifications: "Nice credential! That adds credibility to your profile. Want to add any notable projects?",
    projects: "That's an impressive project! It demonstrates practical experience. Any languages you'd like to add?",
    languages: "Being multilingual is a great asset! Would you like to add any references?",
    references: "Perfect! Your CV is looking comprehensive. Let me know when you'd like to review or download it!"
  };
  
  return responses[sectionType] || "Thanks for sharing! Let me know when you'd like to continue to the next section.";
}

// PDF Generation Handler - Phase 2
// Note: Puppeteer requires a separate server/function with Chrome
// This is a placeholder - actual implementation would use a dedicated Cloud Run service
exports.generatePDF = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const { userId, cvId } = data;
  
  // Get CV data
  const cvDoc = await admin.firestore().doc(`users/${userId}/cvs/${cvId}`).get();
  const cvData = cvDoc.data();
  
  if (!cvData) {
    throw new functions.https.HttpsError('not-found', 'CV not found');
  }
  
  // Get user info for watermark check
  const userDoc = await admin.firestore().doc(`users/${userId}`).get();
  const userData = userDoc.data();
  
  // TODO: Implement actual PDF generation with Puppeteer
  // For now, return placeholder
  // In production, this would:
  // 1. Render the CV template with user data
  // 2. Use Puppeteer to generate PDF
  // 3. Upload to Firebase Storage
  // 4. Return the download URL
  
  return {
    success: true,
    message: 'PDF generation requires server-side Puppeteer setup',
    url: null,
    requiresWatermark: userData?.tier !== 'premium'
  };
});

// Contact Form Submission Handler - Phase 3
exports.submitContactMessage = functions.https.onCall(async (data, context) => {
  const { targetUserId, fromName, fromEmail, message } = data;
  
  if (!fromName || !fromEmail || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(fromEmail)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
  }
  
  // Save to Firestore
  const messageId = Date.now().toString();
  await admin.firestore().doc(`users/${targetUserId}/contactMessages/${messageId}`).set({
    fromName,
    fromEmail,
    message,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    read: false
  });
  
  // TODO: Send email notification via SendGrid
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // ... send email
  
  return { success: true, messageId };
});

// Export Portfolio as Static Site - Phase 4
exports.exportPortfolio = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const userDoc = await admin.firestore().doc(`users/${userId}`).get();
  const userData = userDoc.data();
  
  if (userData?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  
  const { targetUserId } = data;
  
  // TODO: Phase 5 - Implement static site generation with web builder output
  // This would:
  // 1. Get portfolio JSON from Firestore
  // 2. Render using selected template
  // 3. Package as ZIP
  // 4. Upload to Storage and return URL
  
  return {
    success: true,
    message: 'Export not yet implemented - Phase 4/5',
    downloadUrl: null
  };
});

// User Analytics - Cloud Function for daily aggregation
exports.aggregateAnalytics = functions.pubsub
  .schedule('0 0 * * *')  // Run daily at midnight
  .onRun(async (context) => {
    // TODO: Implement daily analytics aggregation
    // This would:
    // 1. Count total users, new signups
    // 2. Count CVs created, PDFs downloaded
    // 3. Count AI interactions
    // 4. Update analytics collection
    
    console.log('Analytics aggregation triggered');
    return null;
  });
