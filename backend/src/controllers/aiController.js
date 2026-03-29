const { GoogleGenerativeAI } = require('@google/generative-ai');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// AI model setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// @desc    Generate task description from title
// @route   POST /api/v1/ai/generate-description
// @access  Private (Registered User)
const generateTaskDescription = asyncHandler(async (req, res, next) => {
    const { title, context } = req.body;

    if (!title) {
        return next(new AppError('Task title is required', 400));
    }

    const prompt = `Write a professional task description for a task titled "${title}". 
    Context: ${context || 'None'}. 
    Please format the response in Markdown with clear sections for Overview, Key Objectives, and Acceptance Criteria.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            data: text,
        });
    } catch (error) {
        console.error('AI Error:', error);
        return next(new AppError('AI service currently unavailable', 503));
    }
});

// @desc    Suggest task priority and estimate
// @route   POST /api/v1/ai/suggest-priority
// @access  Private (Registered User)
const suggestTaskPriority = asyncHandler(async (req, res, next) => {
    const { title, description } = req.body;

    if (!title) {
        return next(new AppError('Task title is required', 400));
    }

    const prompt = `Analyze this task title: "${title}" and description: "${description || 'None'}". 
    Return a JSON object with: 
    1. priority: choose from [none, low, medium, high, urgent]
    2. estimate: estimated hours to complete (number)
    3. tags: array of 3 relevant tags
    4. reasoning: brief sentence explaining the priority.
    
    Response MUST be valid JSON only.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().replace(/```json|```/g, '');
        const data = JSON.parse(text);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('AI Error:', error);
        return next(new AppError('AI analysis failed', 503));
    }
});

// @desc    Analyze project health / risks
// @route   POST /api/v1/ai/project-insights
// @access  Private (Project Manager)
const getProjectInsights = asyncHandler(async (req, res, next) => {
    const { tasks } = req.body;

    if (!tasks || tasks.length === 0) {
        return next(new AppError('No project data found to analyze', 400));
    }

    const prompt = `Analyze these project tasks and provide strategic insights:
    Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, dueDate: t.dueDate, priority: t.priority })))}
    
    Return a summary of:
    1. Project Health (Score 1-100)
    2. Potential Bottlenecks (Where are tasks stuck?)
    3. Critical Risks (What's likely to miss the deadline?)
    4. Smart Next Steps (Which task should be prioritized first?)`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            data: text,
        });
    } catch (error) {
        console.error('AI Error:', error);
        return next(new AppError('AI insights failed', 503));
    }
});

module.exports = {
    generateTaskDescription,
    suggestTaskPriority,
    getProjectInsights,
};
