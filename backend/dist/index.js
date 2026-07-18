import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import { exec } from "child_process";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import cron from 'node-cron';
import nodemailer from "nodemailer";
import fs from 'fs';
import Groq from "groq-sdk";
import multer from "multer";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL || "",
}).$extends(withAccelerate());
const app = express();
//nodemailer initialization 
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
    },
});
//multer initialization
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });
app.use(cors());
app.use(express.json());
// ── Google Translate TTS Proxy ──────────────────────────────────────────────
// Proxies Google Translate's TTS endpoint so the browser receives the exact
// same audio as google.com/translate, avoiding CORS restrictions.
app.get('/tts', async (req, res) => {
    const word = (req.query.word || '').trim();
    const slow = req.query.slow === 'true';
    if (!word)
        return res.status(400).json({ error: 'word is required' });
    // ttsspeed: 0.75 = clearer normal speed, 0.18 = extra slow speed for learning
    const speed = slow ? '0.18' : '0.75';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en-IN&client=tw-ob&ttsspeed=${speed}`;
    try {
        const gtRes = await fetch(url, {
            headers: {
                // Google requires a browser-like User-Agent to serve audio
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
                'Referer': 'https://translate.google.com/',
            },
        });
        if (!gtRes.ok)
            return res.status(gtRes.status).json({ error: 'TTS fetch failed' });
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // cache for 1 day
        if (gtRes.body) {
            const { Readable } = await import('stream');
            Readable.fromWeb(gtRes.body).pipe(res);
        }
        else {
            const buf = await gtRes.arrayBuffer();
            res.send(Buffer.from(buf));
        }
    }
    catch (err) {
        return res.status(500).json({ error: 'TTS proxy error', details: String(err) });
    }
});
// ───────────────────────────────────────────────────────────────────────────
//routes - signin , signup , pronounciation api(azure/sppechace), analytics  
function generateTeacherCode() {
    return `TC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
app.post('/signin', async (req, res) => {
    const user_data = req.body;
    try {
        const response = await prisma.user.findFirst({
            where: { email: user_data.email }
        });
        if (response) {
            //signin
            const password_check = await bcrypt.compare(user_data.password, response.password);
            if (password_check) {
                return res.status(200).json({
                    "id": response.id,
                    "email": response.email,
                    "teacher_code": response.teacher_code,
                    "teacher": response.teacher,
                    "school_name": response.school_name,
                    "principal_email": response.principal_email,
                    "principal_name": response.principal_name,
                    "msg": "You have signed in"
                });
            }
            else {
                return res.status(404).json({ "msg": "password is incorrect" });
            }
        }
        else {
            const hashedPassword = await bcrypt.hash(user_data.password, 10);
            let teacherCode = generateTeacherCode();
            let existingUser = await prisma.user.findUnique({ where: { teacher_code: teacherCode } });
            while (existingUser) {
                teacherCode = generateTeacherCode();
                existingUser = await prisma.user.findUnique({ where: { teacher_code: teacherCode } });
            }
            const response = await prisma.user.create({
                data: {
                    email: user_data.email,
                    password: hashedPassword,
                    teacher_code: teacherCode,
                    teacher: user_data.teacher ?? false,
                    school_name: user_data.school_name ?? "",
                    principal_email: user_data.principal_email ?? "",
                    principal_name: user_data.principal_name ?? ""
                }
            });
            return res.status(200).json({
                "id": response.id,
                "email": response.email,
                "teacher_code": response.teacher_code,
                "teacher": response.teacher,
                "school_name": response.school_name,
                "principal_email": response.principal_email,
                "principal_name": response.principal_name,
                "msg": "User created"
            });
            //signup
        }
    }
    catch (error) {
        //returns the error 
        return res.status(500).json({ "msg": "Something's up with the server", error });
    }
});
app.post('/student-register', async (req, res) => {
    const { name, roleNumber, teacherCode } = req.body;
    if (!name || !teacherCode) {
        return res.status(400).json({ msg: "name and teacherCode are required" });
    }
    try {
        const teacher = await prisma.user.findUnique({
            where: { teacher_code: teacherCode }
        });
        if (!teacher) {
            return res.status(400).json({ msg: "Invalid teacher code. Teacher not found." });
        }
        const student = await prisma.student.create({
            data: {
                name,
                roll_number: roleNumber || "",
                code: teacherCode
            }
        });
        return res.status(200).json({
            id: student.id,
            name: student.name,
            role_number: student.roll_number,
            teacher_code: student.code,
            msg: "Student registered successfully"
        });
    }
    catch (error) {
        return res.status(500).json({ msg: "Something went wrong during student registration", error });
    }
});
app.get('/find-student', async (req, res) => {
    const rollNumber = req.query.rollNumber;
    const teacherCode = req.query.teacherCode;
    if (!rollNumber || !teacherCode) {
        return res.status(400).json({ msg: "rollNumber and teacherCode query params are required" });
    }
    try {
        const student = await prisma.student.findFirst({
            where: {
                roll_number: {
                    equals: rollNumber,
                    mode: 'insensitive'
                },
                code: teacherCode
            }
        });
        if (!student) {
            return res.status(404).json({ msg: "Student not found. Please check your roll number and teacher code." });
        }
        return res.status(200).json({
            id: student.id,
            name: student.name,
            role_number: student.roll_number,
            teacher_code: student.code
        });
    }
    catch (error) {
        return res.status(500).json({ msg: "Something went wrong", error });
    }
});
app.get('/teacher-students', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ msg: "userId query param is required" });
    }
    try {
        const teacher = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!teacher) {
            return res.status(404).json({ msg: "Teacher not found" });
        }
        const students = await prisma.student.findMany({
            where: { code: teacher.teacher_code },
            include: {
                assessment: {
                    orderBy: { time_created: 'desc' }
                }
            }
        });
        const result = students.map((s) => {
            const sessionCount = s.assessment.length;
            const lastSessionTime = sessionCount > 0 ? s.assessment[0].time_created : null;
            return {
                id: s.id,
                name: s.name,
                roleNumber: s.roll_number,
                teacherId: s.code,
                practiceStreak: 0,
                totalPracticeDays: new Set(s.assessment.map((a) => a.time_created.toISOString().split('T')[0])).size,
                totalPracticeSessions: sessionCount,
                lastSessionTime,
                createdAt: s.time_created.toISOString()
            };
        });
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ msg: "Something went wrong fetching teacher students", error });
    }
});
//three practice sets 
//user-likely paragrpah generation()
//empty text box (by default a text)
function sysIns(context, adaptivePrompt) {
    const systemInstructions = `
  You are a paragraph generator for a phonics app, in which your paragraph would be read by users and the phonics would be analyzed with that voice.
  Output should be in this format-
  {
    "text1": "this is the first paragraph",
    "focus_words_1":[{"word": "word1", "phoneme": "phoneme1", "hindi": "हिन्दी phonetic breakdown", "sounds_like": "sounds · like · guide"}, ...],
    "text2": "this is the second paragraph",  
    "focus_words_2":[{"word": "word2", "phoneme": "phoneme2", "hindi": "हिन्दी phonetic breakdown", "sounds_like": "sounds · like · guide"}, ...],
    "text3": "this is the third paragraph",   
    "focus_words_3":[{"word": "word3", "phoneme": "phoneme3", "hindi": "हिन्दी phonetic breakdown", "sounds_like": "sounds · like · guide"}, ...]
  }
  No markdown in the output. Keep it strictly as valid JSON.
  Also provide focus words for each text paragraph. For each focus word, specify:
  1. The English "word" itself.
  2. Its associated "phoneme" category (like "TH Sounds", "V/W Confusion", etc.).
  3. A Devanagari (Hindi) phonetic breakdown of the English word in the "hindi" field. Make sure it represents the pronunciation using Hindi script syllables separated by hyphens (e.g. for "challenges" output "चा-लें-जेज़", for "very" output "वे-री", for "thought" output "थॉट", for "water" output "वॉ-टर", for "really" output "री-ली").
  4. A syllable-separated English phonetic breakdown in the "sounds_like" field. Use a Google Search style pronunciation spelling with syllables separated by dots (e.g. for "challenges" output "chal · uhn · juhz", for "very" output "veh · ree", for "thought" output "thawt", for "requires" output "ri · kwy · erz", for "weather" output "weh · dher").
  Also there is a user choice for the paragraph generation , if it empty string, then dont consider it.Each paragraph must be of 20 words.
  Each paragraph should contain two sentences.
  
  ${adaptivePrompt}
  ${context ? `User requested topic/choice: ${context}` : ""}
  `;
    return systemInstructions;
}
app.post("/generate-sentence", async (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    const { choice, userId, studentId } = req.body;
    let assessments = [];
    try {
        if (studentId) {
            assessments = await prisma.assessmentStudent.findMany({
                where: { student_id: studentId },
                orderBy: { time_created: "asc" },
            });
        }
        else if (userId) {
            assessments = await prisma.assessment.findMany({
                where: { user_id: userId },
                orderBy: { time_created: "asc" },
            });
        }
    }
    catch (dbError) {
        console.error("Failed to fetch assessments for adaptive generation:", dbError);
    }
    const errorCounts = {};
    const recentWordsMap = {};
    for (const a of assessments) {
        if (a.error) {
            try {
                const errorTypes = JSON.parse(a.error);
                for (const type of errorTypes) {
                    errorCounts[type] = (errorCounts[type] || 0) + 1;
                }
            }
            catch { }
        }
    }
    const lastAssessments = assessments.slice(-5);
    for (const a of lastAssessments) {
        if (a.words) {
            try {
                const parsed = JSON.parse(a.words);
                for (const w of parsed) {
                    const word = (w.word || "").toLowerCase().trim();
                    if (!word)
                        continue;
                    const accuracy = w.accuracyScore ?? 100;
                    const isError = w.errorType && w.errorType !== "None";
                    if (!recentWordsMap[word]) {
                        recentWordsMap[word] = { totalAttempts: 0, errorCount: 0, lastAccuracy: accuracy };
                    }
                    recentWordsMap[word].totalAttempts++;
                    if (isError || accuracy < 80) {
                        recentWordsMap[word].errorCount++;
                    }
                    recentWordsMap[word].lastAccuracy = accuracy;
                }
            }
            catch { }
        }
    }
    const persistentErrorWords = Object.entries(recentWordsMap)
        .filter(([_, stats]) => stats.errorCount > 0 && stats.lastAccuracy < 80)
        .map(([word]) => word);
    const sessionCount = assessments.length;
    const sum_pron = assessments.reduce((acc, a) => acc + (a.pronunciation ?? 0), 0);
    const avg_pron = sessionCount > 0 ? sum_pron / sessionCount : 0;
    let difficulty = "beginner";
    if (sessionCount >= 5 && sessionCount <= 20) {
        difficulty = avg_pron >= 75 ? "intermediate" : "beginner";
    }
    else if (sessionCount > 20) {
        difficulty = avg_pron >= 80 ? "advanced" : "intermediate";
    }
    let adaptivePrompt = "";
    if (assessments.length > 0) {
        const topWeakSounds = Object.entries(errorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);
        adaptivePrompt = `
    Target difficulty level: ${difficulty.toUpperCase()}.
    Make sure the paragraphs are written for a ${difficulty} level reader.
    
    The user is struggling with the following phonics categories:
    ${topWeakSounds.length > 0 ? topWeakSounds.join(", ") : "None specified. Focus on general pronunciation."}
    Please design paragraphs that heavily feature sounds and word patterns from these categories.
    
    Specifically, try to include some of these persistent error words that the user has mispronounced recently:
    ${persistentErrorWords.length > 0 ? persistentErrorWords.join(", ") : "None specified."}
    `;
    }
    else {
        adaptivePrompt = `
    Target difficulty level: BEGINNER.
    The user has no previous sessions. Generate friendly, beginner-level phonics paragraphs.
    `;
    }
    const instruction = sysIns(choice, adaptivePrompt);
    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: instruction,
                },
            ],
            temperature: 0.7,
            max_completion_tokens: 1200,
            top_p: 1,
            stream: true,
            stop: null,
        });
        for await (const chunk of completion) {
            res.write(chunk.choices[0]?.delta?.content || "");
        }
    }
    catch (apiError) {
        console.error("LLM completion failed:", apiError);
    }
    res.end();
});
function pronounciationSysIns(azure_output) {
    const sysIns = `
  You are Phonics Bridge Engine, an AI phonics assessment system.
  You receive structured pronunciation assessment output from an upstream pronunciation service after a student reads aloud.
  Your task is to analyze pronunciation errors and return a simplified phonics assessment.
  You must output a single JSON object in the following format:
  {
    "error_words": [],
    "error_types": [],
    "analysis": "A child-friendly encouraging analysis of the reading performance (2-3 sentences)"
  }
  INPUT FORMAT
  Input comes in this structure:
  {
  "success": true,
  "recognizedText": "...",
  "scores": {
    "accuracy": 97,
    "fluency": 92,
    "completeness": 98,
    "pronunciation": 94.2
  },
  "words":[
    {
        "word":"Curiosity",

        "accuracyScore":42,

        "errorType":"Mispronunciation",

        "phonemes":[
          {
            "phoneme":"",
            "accuracyScore":47
          }
        ]
    }
  ]
  }
  Use:
  -overall scores
  -per-word accuracy
  -error labels
  -phoneme scores
  -to determine phonics difficulties.

  Output Rules-
  -No extra text.
  -No markdown.
  -No explanation outside JSON.

  FIELD RULES
    1. error_words
    Include words where pronunciation difficulty exists.

    Add a word if:

    errorType != "None"
    OR

    accuracyScore < 80
    Ignore words with score ≥ 80 unless explicitly marked as errors.

    Example:

    "error_words":[
      "Curiosity",
      "resilient"
    ]
    2. error_types
    Convert pronunciation issues into child-friendly phonics categories.

    Use ONLY these categories:

    V/W Confusion
    TH Sounds
    Long vs Short Vowels
    Blends and Clusters
    Silent Letters
    R Sounds
    L/R Confusion
    Stress in Long Words
    Ending Sounds
    Missing Sounds
    Extra Sounds
    Vowel Sounds
    Multi-Syllable Words
    Consonant Sounds
    Word Stress
    
    Mapping examples:

    1.Low score on long words:
    Examples:
    curiosity
    resilient
    experimentation
    Multi-Syllable Words
    Word Stress
    Stress in Long Words

    2.Missing ending sounds
    Ending Sounds
    Missing Sounds

    3.Blend simplification
    Examples:
    school → cool
    stop → top
    Blends and Clusters

    4.TH substitutions
    Examples:
    the → de
    think → tink
    TH Sounds

    5.V/W substitutions
    Examples:
    vine ↔ wine
    V/W Confusion

    6.Vowel substitutions
    Examples:
    sit → seat
    bed → bad
    Long vs Short Vowels
    Vowel Sounds
  3. analysis
  Write feedback for a 4th grade student.

  Rules:
  -Maximum 2–3 sentences
  -Simple vocabulary
  -Encouraging tone
  -Never mention scores
  -Never say “failure”, “poor”, “weak”
  -Focus on practice
  
  Good example:
  You read most words very well. Some longer words were harder because they have many parts and tricky stress patterns. Practice saying long words slowly and breaking them into smaller parts.
  Bad example:

  ❌ Student shows multisyllabic articulation deficit.

  ❌ Stress transfer issue detected.


  Response from pronounciation service-
  ${azure_output}

  `;
    return sysIns;
}
//pronounciation-service
app.post("/pronounciation-service", upload.single('audio'), async (req, res) => {
    const audio = req.file;
    console.log(audio);
    if (!audio) {
        return res.status(400).json({ "msg": "You should attach a file" });
    }
    const referenceText = req.header("referenceText");
    const language = req.header('language');
    const userId = req.header('userId');
    const studentId = req.header('studentId');
    if (!referenceText) {
        fs.unlinkSync(audio.path);
        return res.status(401).json({ "msg": "No reference text was provided" });
    }
    const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.AZURE_KEY || "", process.env.AZURE_REGION || "centralindia");
    speechConfig.speechRecognitionLanguage = language || "en-US";
    const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(audio.path));
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(referenceText, sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Phoneme, true);
    //webm
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronunciationAssessmentConfig.applyTo(recognizer);
    try {
        const result = await new Promise((resolve, reject) => {
            recognizer.recognizeOnceAsync((result) => {
                recognizer.close();
                resolve(result);
            }, (err) => {
                recognizer.close();
                reject(new Error(err));
            });
        });
        fs.unlinkSync(audio.path);
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(result);
            const detailResult = pronunciationResult.detailResult;
            const completion = await client.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: pronounciationSysIns({
                            success: true,
                            recognizedText: result.text,
                            scores: {
                                accuracy: pronunciationResult.accuracyScore,
                                fluency: pronunciationResult.fluencyScore,
                                completeness: pronunciationResult.completenessScore,
                                pronunciation: pronunciationResult.pronunciationScore,
                            },
                            words: detailResult?.Words?.map((word) => ({
                                word: word.Word,
                                accuracyScore: word.PronunciationAssessment?.AccuracyScore,
                                errorType: word.PronunciationAssessment?.ErrorType,
                                phonemes: word.Phonemes?.map((p) => ({
                                    phoneme: p.Phoneme,
                                    accuracyScore: p.PronunciationAssessment?.AccuracyScore,
                                })),
                            })) ?? [],
                        }),
                    },
                ],
                temperature: 1,
                max_completion_tokens: 2000,
                top_p: 1,
                stream: false,
                stop: null,
            });
            const rawContent = completion.choices[0]?.message.content || "";
            let llmAnalysis = rawContent;
            let llmErrors = "";
            try {
                const parsedLLM = JSON.parse(rawContent);
                llmAnalysis = parsedLLM.analysis || rawContent;
                llmErrors = JSON.stringify(parsedLLM.error_types || []);
            }
            catch (e) {
                // Not JSON
            }
            const wordsJSON = JSON.stringify(detailResult?.Words?.map((word) => ({
                word: word.Word,
                accuracyScore: word.PronunciationAssessment?.AccuracyScore,
                errorType: word.PronunciationAssessment?.ErrorType,
                phonemes: word.Phonemes?.map((p) => ({
                    phoneme: p.Phoneme,
                    accuracyScore: p.PronunciationAssessment?.AccuracyScore,
                })),
            })) ?? []);
            if (studentId) {
                await prisma.assessmentStudent.create({
                    data: {
                        accuracy: pronunciationResult.accuracyScore,
                        fluency: pronunciationResult.fluencyScore,
                        completeness: pronunciationResult.completenessScore,
                        pronunciation: pronunciationResult.pronunciationScore,
                        words: wordsJSON,
                        analysis: llmAnalysis,
                        error: llmErrors,
                        student_id: studentId
                    }
                });
            }
            else {
                await prisma.assessment.create({
                    data: {
                        accuracy: pronunciationResult.accuracyScore,
                        fluency: pronunciationResult.fluencyScore,
                        completeness: pronunciationResult.completenessScore,
                        pronunciation: pronunciationResult.pronunciationScore,
                        words: wordsJSON,
                        analysis: llmAnalysis,
                        error: llmErrors,
                        user_id: userId || ""
                    }
                });
            }
            return res.status(200).json({
                "data": rawContent,
                "scores": {
                    "accuracy": pronunciationResult.accuracyScore,
                    "fluency": pronunciationResult.fluencyScore,
                    "completeness": pronunciationResult.completenessScore,
                    "pronunciation": pronunciationResult.pronunciationScore,
                },
                "words": detailResult?.Words?.map((word) => ({
                    word: word.Word,
                    accuracyScore: word.PronunciationAssessment?.AccuracyScore,
                    errorType: word.PronunciationAssessment?.ErrorType,
                })) ?? []
            });
        }
        else {
            return res.status(422).json({
                success: false,
                reason: sdk.ResultReason[result.reason],
                details: result.errorDetails ?? 'Speech not recognized',
            });
        }
    }
    catch (error) {
        // fs.unlinkSync(audio.path)
        return res.status(505).json({ "msg": "Something is up with the server", error });
    }
});
// GET /improved_words?userId=<id>
// Returns words the user has practiced and improved on across sessions.
// A word is considered "improved" if its latest accuracy is higher than its first recorded accuracy.
app.get("/improved_words", async (req, res) => {
    const userId = req.query.userId;
    const studentId = req.query.studentId;
    if (!userId && !studentId) {
        return res.status(400).json({ msg: "userId or studentId query param is required" });
    }
    try {
        let assessments;
        if (studentId) {
            assessments = await prisma.assessmentStudent.findMany({
                where: { student_id: studentId },
                orderBy: { time_created: "asc" },
            });
        }
        else {
            assessments = await prisma.assessment.findMany({
                where: { user_id: userId },
                orderBy: { time_created: "asc" },
            });
        }
        if (assessments.length === 0) {
            return res.status(200).json({ improved_words: [] });
        }
        // Build a map: word → [{accuracyScore, session_time_created}]
        const wordHistory = {};
        for (const assessment of assessments) {
            if (!assessment.words)
                continue;
            let parsedWords;
            try {
                parsedWords = JSON.parse(assessment.words);
            }
            catch {
                continue; // skip malformed entries
            }
            for (const w of parsedWords) {
                const word = (w.word ?? "").toLowerCase().trim();
                const accuracyScore = w.accuracyScore ?? 0;
                const errorType = w.errorType ?? "None";
                if (!word)
                    continue;
                // Only track words that have had at least one error at some point
                if (errorType === "None" && accuracyScore === 100)
                    continue;
                if (!wordHistory[word])
                    wordHistory[word] = [];
                wordHistory[word].push({ accuracyScore, time_created: assessment.time_created });
            }
        }
        // A word is "improved" if its latest accuracy > its first recorded accuracy
        const improved_words = Object.entries(wordHistory)
            .filter(([, history]) => {
            if (history.length < 2)
                return false;
            const first = history[0]?.accuracyScore;
            const latest = history[history.length - 1]?.accuracyScore;
            return latest > first;
        })
            .map(([word, history]) => ({
            word,
            first_accuracy: Math.round(history[0].accuracyScore),
            latest_accuracy: Math.round(history[history.length - 1].accuracyScore),
            improvement: Math.round(history[history.length - 1].accuracyScore - history[0].accuracyScore),
            sessions_practiced: history.length,
            history: history.map((h) => ({
                accuracyScore: Math.round(h.accuracyScore),
                time_created: h.time_created,
            })),
        }))
            .sort((a, b) => b.improvement - a.improvement); // most improved first
        return res.status(200).json({ improved_words });
    }
    catch (error) {
        return res.status(500).json({ msg: "Something's up with the server", error });
    }
});
// GET /analytics?userId=<id>
// Returns per-session score history and aggregated stats for the progress dashboard.
app.get("/analytics", async (req, res) => {
    const userId = req.query.userId;
    const studentId = req.query.studentId;
    if (!userId && !studentId) {
        return res.status(400).json({ msg: "userId or studentId query param is required" });
    }
    try {
        let assessments;
        if (studentId) {
            assessments = await prisma.assessmentStudent.findMany({
                where: { student_id: studentId },
                orderBy: { time_created: "asc" },
            });
        }
        else {
            assessments = await prisma.assessment.findMany({
                where: { user_id: userId },
                orderBy: { time_created: "asc" },
            });
        }
        if (assessments.length === 0) {
            return res.status(200).json({
                total_sessions: 0,
                average_scores: { accuracy: 0, fluency: 0, completeness: 0, pronunciation: 0 },
                session_history: [],
                streak: 0,
                total_practice_days: 0,
            });
        }
        // Per-session history (for charts)
        const session_history = assessments.map((a, index) => ({
            session: index + 1,
            time_created: a.time_created,
            accuracy: a.accuracy ?? 0,
            fluency: a.fluency ?? 0,
            completeness: a.completeness ?? 0,
            pronunciation: a.pronunciation ?? 0,
        }));
        const total_sessions = assessments.length;
        // Aggregate averages
        const sum = assessments.reduce((acc, a) => ({
            accuracy: acc.accuracy + (a.accuracy ?? 0),
            fluency: acc.fluency + (a.fluency ?? 0),
            completeness: acc.completeness + (a.completeness ?? 0),
            pronunciation: acc.pronunciation + (a.pronunciation ?? 0),
        }), { accuracy: 0, fluency: 0, completeness: 0, pronunciation: 0 });
        const average_scores = {
            accuracy: Math.round((sum.accuracy / total_sessions) * 10) / 10,
            fluency: Math.round((sum.fluency / total_sessions) * 10) / 10,
            completeness: Math.round((sum.completeness / total_sessions) * 10) / 10,
            pronunciation: Math.round((sum.pronunciation / total_sessions) * 10) / 10,
        };
        // Unique practice days
        const uniqueDays = new Set(assessments.map((a) => new Date(a.time_created).toISOString().split("T")[0]));
        const total_practice_days = uniqueDays.size;
        // Current streak — count consecutive days up to today
        const sortedDays = Array.from(uniqueDays).sort();
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = sortedDays.length - 1; i >= 0; i--) {
            const day = new Date(sortedDays[i]);
            const diffDays = Math.round((today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === sortedDays.length - 1 - i) {
                streak++;
            }
            else {
                break;
            }
        }
        // Best and latest scores
        const latest = session_history[session_history.length - 1];
        const best_pronunciation = Math.max(...assessments.map((a) => a.pronunciation ?? 0));
        const errorCounts = {};
        for (const a of assessments) {
            if (!a.error)
                continue;
            try {
                const errorTypes = JSON.parse(a.error);
                for (const type of errorTypes) {
                    errorCounts[type] = (errorCounts[type] || 0) + 1;
                }
            }
            catch {
                // Skip malformed
            }
        }
        const weak_sounds = Object.entries(errorCounts).map(([name, count]) => {
            let description = `Practice distinguishing the ${name} sounds`;
            let status = count > 5 ? 'needs-work' : 'improving';
            return {
                id: name.toLowerCase().replace(/[^a-z]/g, ''),
                name,
                description,
                errorCount: count,
                lastSeen: 'Recently',
                status
            };
        }).sort((a, b) => b.errorCount - a.errorCount);
        return res.status(200).json({
            total_sessions,
            total_practice_days,
            streak,
            average_scores,
            best_pronunciation: Math.round(best_pronunciation * 10) / 10,
            latest_scores: {
                accuracy: latest?.accuracy,
                fluency: latest?.fluency,
                completeness: latest?.completeness,
                pronunciation: latest?.pronunciation,
            },
            session_history,
            weak_sounds,
        });
    }
    catch (error) {
        return res.status(500).json({ msg: "Something's up with the server", error });
    }
});
// GET /analytics/tag-scoring?userId=<id>&studentId=<id>&schoolName=<name>
// Aggregates phoneme-level stats (attempts, errors, accuracy) for granular research analysis.
app.get("/analytics/tag-scoring", async (req, res) => {
    const userId = req.query.userId;
    const studentId = req.query.studentId;
    const schoolName = req.query.schoolName;
    try {
        let assessments = [];
        if (studentId) {
            assessments = await prisma.assessmentStudent.findMany({
                where: { student_id: studentId },
            });
        }
        else if (userId) {
            const teacher = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (teacher) {
                assessments = await prisma.assessmentStudent.findMany({
                    where: { student: { code: teacher.teacher_code } },
                });
            }
        }
        else if (schoolName) {
            assessments = await prisma.assessmentStudent.findMany({
                where: { student: { user: { school_name: schoolName } } },
            });
        }
        else {
            return res.status(400).json({ msg: "studentId, userId, or schoolName query param is required" });
        }
        const phonemeStats = {};
        for (const a of assessments) {
            if (a.words) {
                try {
                    const parsedWords = JSON.parse(a.words);
                    if (Array.isArray(parsedWords)) {
                        for (const w of parsedWords) {
                            const phonemes = w.phonemes || [];
                            for (const p of phonemes) {
                                const phName = (p.phoneme || "").toLowerCase().trim();
                                if (!phName)
                                    continue;
                                const accuracy = p.accuracyScore ?? 100;
                                if (!phonemeStats[phName]) {
                                    phonemeStats[phName] = { totalAttempts: 0, errorCount: 0, sumAccuracy: 0 };
                                }
                                phonemeStats[phName].totalAttempts++;
                                phonemeStats[phName].sumAccuracy += accuracy;
                                if (accuracy < 80) {
                                    phonemeStats[phName].errorCount++;
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    // ignore JSON parse errors
                }
            }
        }
        const report = Object.entries(phonemeStats).map(([phoneme, stats]) => ({
            phoneme,
            averageAccuracy: stats.totalAttempts > 0 ? Math.round((stats.sumAccuracy / stats.totalAttempts) * 10) / 10 : 0,
            totalAttempts: stats.totalAttempts,
            totalErrors: stats.errorCount,
            errorRate: stats.totalAttempts > 0 ? Math.round((stats.errorCount / stats.totalAttempts) * 1000) / 10 : 0
        })).sort((a, b) => b.totalErrors - a.totalErrors);
        return res.status(200).json({ phonemes: report });
    }
    catch (error) {
        return res.status(500).json({ msg: "Something went wrong fetching tag-scoring analytics", error });
    }
});
app.get("/sessions", async (req, res) => {
    const userId = req.query.userId;
    const studentId = req.query.studentId;
    if (!userId && !studentId) {
        return res.status(400).json({ msg: "userId or studentId query param is required" });
    }
    try {
        let sessions;
        if (studentId) {
            sessions = await prisma.assessmentStudent.findMany({
                where: { student_id: studentId },
                orderBy: { time_created: "desc" },
            });
        }
        else {
            sessions = await prisma.assessment.findMany({
                where: { user_id: userId },
                orderBy: { time_created: "desc" },
            });
        }
        return res.status(200).json({ sessions });
    }
    catch (error) {
        return res.status(500).json({ msg: "Failed to fetch sessions", error });
    }
});
app.post("/chat", async (req, res) => {
    const { messages, studentId, userId } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ msg: "messages array is required" });
    }
    try {
        let performanceSummary = "";
        if (studentId || userId) {
            let assessments;
            if (studentId) {
                assessments = await prisma.assessmentStudent.findMany({
                    where: { student_id: studentId },
                    orderBy: { time_created: "desc" },
                    take: 10,
                });
            }
            else {
                assessments = await prisma.assessment.findMany({
                    where: { user_id: userId },
                    orderBy: { time_created: "desc" },
                    take: 10,
                });
            }
            if (assessments.length > 0) {
                const errorCounts = {};
                let totalAccuracy = 0;
                for (const a of assessments) {
                    totalAccuracy += a.accuracy ?? 0;
                    if (a.error) {
                        try {
                            const errorTypes = JSON.parse(a.error);
                            for (const type of errorTypes) {
                                errorCounts[type] = (errorCounts[type] || 0) + 1;
                            }
                        }
                        catch { }
                    }
                }
                const avgAcc = Math.round(totalAccuracy / assessments.length);
                const weakSounds = Object.entries(errorCounts)
                    .map(([name, count]) => `${name} (${count} errors)`)
                    .join(", ");
                performanceSummary = `
Here is the user's recent performance data from their last ${assessments.length} sessions:
- Average pronunciation accuracy: ${avgAcc}%
- Weak/troublesome sounds detected: ${weakSounds || "None detected yet"}
- Total practice sessions: ${assessments.length}
`;
            }
        }
        const systemPrompt = `You are Phonics Bridge Tutor, a friendly, encouraging AI phonics coach for students and teachers. 
Your goal is to help them understand their pronunciation errors, give tips on how to produce specific sounds, suggest words to practice, and keep them motivated.

Keep your answers relatively concise, warm, and easy to understand (especially if talking to a student). Use phonics notations like /sh/ or /th/ when referencing sounds.
${performanceSummary ? `\nUse this context about the user's performance to answer their questions:\n${performanceSummary}` : ""}
Always speak directly to the user. Provide practical pronunciation tips, mouth positioning guidance (e.g. "put your tongue between your teeth for the /th/ sound"), or encouragement.`;
        const chatMessages = [
            { role: "system", content: systemPrompt },
            ...messages
        ];
        const stream = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: chatMessages,
            temperature: 0.7,
            max_completion_tokens: 1000,
            stream: true,
        });
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
        }
        res.write("data: [DONE]\n\n");
        res.end();
    }
    catch (error) {
        console.error("Chat error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ msg: "Something went wrong in the chat service", error });
        }
        res.end();
    }
});
//[1,2,3,4]
//add a reminder cron_job
// mail + scheduler 
//rsounak55 gmail.com
cron.schedule("*/30 * * * *", async () => {
    try {
        const response = await prisma.user.findMany({});
        response.map(async (item) => {
            try {
                const name = item.email.split("@")[0];
                const info = await transporter.sendMail({
                    from: '"Phonics Engine"',
                    to: `${item.email}`,
                    subject: `Reminder to take the assessment`,
                    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keep Building Strong Reading Skills!</title>

    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        }

        table {
            border-spacing: 0;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }
    </style>
</head>

<body>

    <!-- Hidden Preview Text -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Keep practicing and continue building stronger reading skills every day.
    </div>

    <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color:#f4f6f8;"
    >
        <tr>
            <td align="center" style="padding:40px 20px;">

                <!-- Main Container -->
                <table
                    role="presentation"
                    width="600"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        background-color:#ffffff;
                        border-radius:10px;
                        overflow:hidden;
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color:#2563eb;
                                padding:32px;
                            "
                        >
                            <h1
                                style="
                                    margin:0;
                                    color:#ffffff;
                                    font-size:28px;
                                    font-weight:bold;
                                "
                            >
                                Keep Building Strong Reading Skills!
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding:40px;">

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                    margin-top:0;
                                "
                            >
                                Hello ${name},
                            </p>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                "
                            >
                                Every reading session is an opportunity to build stronger phonics skills, improve pronunciation, and grow confidence as a reader.
                            </p>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                "
                            >
                                Regular practice helps reinforce sound-letter relationships, improve word recognition, and develop reading fluency over time. Even a few minutes of focused reading each day can make a meaningful difference.
                            </p>

                            <!-- Highlight Box -->
                            <table
                                role="presentation"
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    margin:30px 0;
                                "
                            >
                                <tr>
                                    <td
                                        style="
                                            background:#eff6ff;
                                            border-left:4px solid #2563eb;
                                            padding:20px;
                                        "
                                    >
                                        <p
                                            style="
                                                margin:0;
                                                color:#1e3a8a;
                                                font-size:15px;
                                                line-height:1.8;
                                            "
                                        >
                                            <strong>Why keep practicing?</strong>
                                            <br><br>
                                            • Strengthen phonics and decoding skills<br>
                                            • Improve pronunciation and word recognition<br>
                                            • Build confidence while reading aloud<br>
                                            • Track progress and celebrate growth over time
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                "
                            >
                                Consistent practice is one of the most effective ways to become a stronger reader. We encourage you to continue your learning journey and make reading a part of your daily routine.
                            </p>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                "
                            >
                                We look forward to seeing your progress continue and celebrating your reading achievements along the way.
                            </p>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                    margin-bottom:0;
                                "
                            >
                                Happy Learning,
                                <br>
                                <strong>The PhonicsFlow Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding:0 40px;">
                            <hr
                                style="
                                    border:none;
                                    border-top:1px solid #e5e7eb;
                                "
                            >
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background:#fafafa;
                                padding:24px;
                            "
                        >
                            <p
                                style="
                                    margin:0;
                                    color:#6b7280;
                                    font-size:13px;
                                    line-height:1.6;
                                "
                            >
                                This is an automated reminder from the Phonics Bridge Engine.
                            </p>

                            <p
                                style="
                                    margin-top:8px;
                                    color:#9ca3af;
                                    font-size:12px;
                                "
                            >
                                © 2026 PhonicsFlow Engine. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- End Main Container -->

            </td>
        </tr>
    </table>

</body>
</html>`
                });
                console.log(`Reminder email sent successfully to ${item.email}`);
            }
            catch (err) {
                console.error(`Failed to send reminder email to ${item.email}:`, err);
            }
        });
    }
    catch (err) {
        console.error("Reminder cron job database error:", err);
    }
});
// Helper function to generate and send monthly reports
async function generateAndSendMonthlyReports() {
    console.log("Starting automated monthly principal report generation...");
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' }) + " " + now.getFullYear();
    try {
        const teachers = await prisma.user.findMany({
            where: {
                teacher: true,
                school_name: { not: "" }
            }
        });
        for (const teacher of teachers) {
            try {
                const students = await prisma.student.findMany({
                    where: { code: teacher.teacher_code },
                    include: {
                        assessment: {
                            where: {
                                time_created: {
                                    gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                                }
                            }
                        }
                    }
                });
                if (students.length === 0) {
                    console.log(`No student activity for school "${teacher.school_name}" (Teacher: ${teacher.email}). Skipping report.`);
                    continue;
                }
                // Aggregate statistics
                let totalSessions = 0;
                let totalAccuracySum = 0;
                let totalAccuracyCount = 0;
                const schoolPhonemes = {};
                const studentDetails = [];
                for (const student of students) {
                    let studentAccSum = 0;
                    let studentAccCount = 0;
                    const studentPhonemes = {};
                    for (const assess of student.assessment) {
                        totalSessions++;
                        if (assess.accuracy !== null && assess.accuracy !== undefined) {
                            totalAccuracySum += assess.accuracy;
                            totalAccuracyCount++;
                            studentAccSum += assess.accuracy;
                            studentAccCount++;
                        }
                        if (assess.words) {
                            try {
                                const wordsList = JSON.parse(assess.words);
                                if (Array.isArray(wordsList)) {
                                    for (const w of wordsList) {
                                        if (w.phonemes && Array.isArray(w.phonemes)) {
                                            for (const p of w.phonemes) {
                                                const ph = (p.phoneme || '').toLowerCase().trim();
                                                if (!ph)
                                                    continue;
                                                const score = p.accuracyScore ?? 100;
                                                // School level
                                                if (!schoolPhonemes[ph])
                                                    schoolPhonemes[ph] = { sum: 0, count: 0 };
                                                schoolPhonemes[ph].sum += score;
                                                schoolPhonemes[ph].count++;
                                                // Student level
                                                if (!studentPhonemes[ph])
                                                    studentPhonemes[ph] = { sum: 0, count: 0 };
                                                studentPhonemes[ph].sum += score;
                                                studentPhonemes[ph].count++;
                                            }
                                        }
                                    }
                                }
                            }
                            catch (err) {
                                // Ignore parse errors
                            }
                        }
                    }
                    const avgStudentAccuracy = studentAccCount > 0 ? Math.round(studentAccSum / studentAccCount) : 0;
                    // Identify student weaknesses (average accuracy < 80)
                    const needsPractice = Object.entries(studentPhonemes)
                        .filter(([_, stats]) => (stats.sum / stats.count) < 80)
                        .map(([ph]) => `/${ph}/`)
                        .slice(0, 3)
                        .join(', ');
                    studentDetails.push({
                        name: student.name,
                        rollNumber: student.roll_number || 'N/A',
                        sessions: student.assessment.length,
                        accuracy: avgStudentAccuracy,
                        needsPractice: needsPractice || 'None'
                    });
                }
                const overallAccuracy = totalAccuracyCount > 0 ? Math.round(totalAccuracySum / totalAccuracyCount) : 0;
                // Phoneme rankings
                const phonemeAverages = Object.entries(schoolPhonemes).map(([ph, stats]) => ({
                    phoneme: ph,
                    accuracy: Math.round(stats.sum / stats.count)
                }));
                const strengths = phonemeAverages
                    .filter(item => item.accuracy >= 80)
                    .sort((a, b) => b.accuracy - a.accuracy)
                    .slice(0, 3);
                const weaknesses = phonemeAverages
                    .filter(item => item.accuracy < 80)
                    .sort((a, b) => a.accuracy - b.accuracy)
                    .slice(0, 3);
                const reportPayload = {
                    schoolName: teacher.school_name,
                    principalName: teacher.principal_name || 'School Principal',
                    month: monthName,
                    totalStudents: students.length,
                    averageAccuracy: overallAccuracy,
                    strengths,
                    weaknesses,
                    students: studentDetails
                };
                const uploadDir = path.resolve(__dirname, '../uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const jsonPath = path.join(uploadDir, `report_${teacher.id}.json`);
                const pdfPath = path.join(uploadDir, `report_${teacher.id}.pdf`);
                fs.writeFileSync(jsonPath, JSON.stringify(reportPayload, null, 2));
                // Spawn python script to compile PDF
                const scriptPath = path.resolve(__dirname, 'generate_pdf_report.py');
                await new Promise((resolve, reject) => {
                    exec(`python3 "${scriptPath}" "${jsonPath}" "${pdfPath}"`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Python script failed for ${teacher.school_name}:`, error, stderr);
                            reject(error);
                        }
                        else {
                            resolve();
                        }
                    });
                });
                // Send email to principal
                const targetEmail = teacher.principal_email || teacher.email;
                const mailOptions = {
                    from: `"Phonics Bridge Engine" <${process.env.MAIL_ID || 'noreply@phonicsflow.com'}>`,
                    to: targetEmail,
                    subject: `Monthly Phonics Progress Report - ${teacher.school_name} (${monthName})`,
                    html: `<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
              <h2 style="margin: 0; font-size: 20px;">Monthly Phonics Progress Report</h2>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">${teacher.school_name}</p>
            </div>
            <div style="padding: 24px;">
              <p>Dear Principal <b>${teacher.principal_name || 'Administrator'}</b>,</p>
              <p>Please find attached the automated monthly Phonics Progress Report for your school, <b>${teacher.school_name}</b>, for the period ending <b>${monthName}</b>.</p>
              <p>This report includes high-level statistics on student progress, cohort strengths, phonemes requiring targeted intervention, and individual student participation rates.</p>
              <p style="margin-top: 24px;">Best regards,</p>
              <p><b>Phonics Bridge Engine Dashboard Team</b></p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e2e8f0;">
              This is an automated notification. Please contact ${teacher.email} for details about this class.
            </div>
          </div>`,
                    attachments: [
                        {
                            filename: `Phonics_Report_${monthName.replace(/\s+/g, '_')}.pdf`,
                            path: pdfPath
                        }
                    ]
                };
                if (teacher.principal_email && teacher.email) {
                    mailOptions.cc = teacher.email;
                }
                await transporter.sendMail(mailOptions);
                console.log(`Report successfully emailed to ${targetEmail}`);
                // Cleanup files
                if (fs.existsSync(jsonPath))
                    fs.unlinkSync(jsonPath);
                if (fs.existsSync(pdfPath))
                    fs.unlinkSync(pdfPath);
            }
            catch (err) {
                console.error(`Failed to process report for teacher ${teacher.email}:`, err);
            }
        }
    }
    catch (err) {
        console.error("Failed to fetch teachers for monthly reports:", err);
    }
}
// REST endpoint to trigger report generation manually
app.get('/trigger-monthly-reports', async (req, res) => {
    try {
        await generateAndSendMonthlyReports();
        return res.status(200).json({ success: true, msg: "Monthly reports triggered and sent successfully." });
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: "Failed to trigger reports", error: err.message });
    }
});
// Schedule monthly principal reports on the 1st of every month at midnight
cron.schedule("0 0 1 * *", async () => {
    try {
        await generateAndSendMonthlyReports();
    }
    catch (err) {
        console.error("Cron scheduled monthly reports error:", err);
    }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map