// Ensure global.__dirname injected by tsx does not break ESM plugins
if (typeof (globalThis as any).__dirname !== 'undefined' && (globalThis as any).__dirname === '.') {
  delete (globalThis as any).__dirname;
}
if (typeof (global as any).__dirname !== 'undefined' && (global as any).__dirname === '.') {
  delete (global as any).__dirname;
}

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Body parser with support for base64 direct media uploads up to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization of Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Submissions persistence helper
const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

interface Submission {
  id: string;
  authorName: string;
  relationship: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}

function loadSubmissions(): Submission[] {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading submissions file:', err);
  }
  return [];
}

function saveSubmissions(submissions: Submission[]): void {
  try {
    const dir = path.dirname(SUBMISSIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving submissions file:', err);
  }
}

// Site Content persistence helper
const SITE_CONTENT_FILE = path.join(process.cwd(), 'data', 'siteContent.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads directory is created
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  // ignore
}

// Serve uploaded files and public assets statically
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(process.cwd(), 'public')));

function loadSiteContent(): any {
  try {
    if (fs.existsSync(SITE_CONTENT_FILE)) {
      const content = fs.readFileSync(SITE_CONTENT_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading siteContent file:', err);
  }
  return null;
}

function saveSiteContent(content: any): void {
  const dir = path.dirname(SITE_CONTENT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SITE_CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'sheikh-kazim-huraib-platform' });
});

// Site Content: Read all site content
app.get('/api/content', (req: Request, res: Response) => {
  const content = loadSiteContent();
  res.json({ success: true, content });
});

// Site Content: Update all site content (handles both PUT and POST/sendBeacon)
const handleSaveContent = (req: Request, res: Response) => {
  let content = req.body?.content;
  if (!content && typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      content = parsed.content;
    } catch {
      // ignore
    }
  }
  if (!content) {
    return res.status(400).json({ success: false, message: 'بيانات المحتوى مطلوبة' });
  }
  try {
    const updatedAt = content.updatedAt || new Date().toISOString();
    const contentWithMeta = {
      ...content,
      updatedAt,
    };
    saveSiteContent(contentWithMeta);
    res.json({ success: true, message: 'تم حفظ كافة التعديلات على المحتوى بنجاح', updatedAt });
  } catch (err: any) {
    console.error('Error saving site content:', err);
    res.status(500).json({ success: false, message: 'فشل حفظ المحتوى: ' + (err.message || '') });
  }
};

app.put('/api/content', handleSaveContent);
app.post('/api/content', handleSaveContent);

// Dedicated timeline endpoints for atomic timeline reading and saving
app.get('/api/timeline', (req: Request, res: Response) => {
  const content = loadSiteContent();
  res.json({ success: true, timeline: content?.timeline || [] });
});

app.put('/api/timeline', (req: Request, res: Response) => {
  let timeline = req.body?.timeline;
  if (!timeline && typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      timeline = parsed.timeline;
    } catch {}
  }
  if (!Array.isArray(timeline)) {
    return res.status(400).json({ success: false, message: 'قائمة الخط الزمني غير صالحة' });
  }
  try {
    const current = loadSiteContent() || {};
    const updatedAt = new Date().toISOString();
    const updatedContent = {
      ...current,
      timeline,
      updatedAt,
    };
    saveSiteContent(updatedContent);
    res.json({ success: true, message: 'تم حفظ وتثبيت الخط الزمني بنجاح', updatedAt, timeline });
  } catch (err: any) {
    console.error('Error saving timeline:', err);
    res.status(500).json({ success: false, message: 'فشل حفظ الخط الزمني: ' + (err.message || '') });
  }
});
app.post('/api/timeline', (req: Request, res: Response) => {
  let timeline = req.body?.timeline;
  if (!timeline && typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      timeline = parsed.timeline;
    } catch {}
  }
  if (!Array.isArray(timeline)) {
    return res.status(400).json({ success: false, message: 'قائمة الخط الزمني غير صالحة' });
  }
  try {
    const current = loadSiteContent() || {};
    const updatedAt = new Date().toISOString();
    const updatedContent = {
      ...current,
      timeline,
      updatedAt,
    };
    saveSiteContent(updatedContent);
    res.json({ success: true, message: 'تم حفظ وتثبيت الخط الزمني بنجاح', updatedAt, timeline });
  } catch (err: any) {
    console.error('Error saving timeline:', err);
    res.status(500).json({ success: false, message: 'فشل حفظ الخط الزمني: ' + (err.message || '') });
  }
});

// Site Content: Reset to defaults
app.post('/api/content/reset', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(SITE_CONTENT_FILE)) {
      fs.unlinkSync(SITE_CONTENT_FILE);
    }
    res.json({ success: true, message: 'تمت استعادة محتوى الموقع الافتراضي' });
  } catch (err: any) {
    console.error('Error resetting site content:', err);
    res.status(500).json({ success: false, message: 'فشل استعادة المحتوى الافتراضي: ' + err.message });
  }
});

// File Upload Endpoint: accepts base64 and saves to /uploads or returns base64
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'بيانات الملف مطلوبة' });
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('svg')) ext = 'svg';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('pdf')) ext = 'pdf';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const safeName = (fileName || 'image').replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}_${safeName}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${uniqueFileName}`;
    res.json({ success: true, url: publicUrl, fileName: uniqueFileName });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, message: 'تعذر حفظ الملف: ' + err.message });
  }
});

// Admin authentication endpoint
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'admin@huraib.sa' && password === 'AlHuraib@2026') {
    return res.json({
      success: true,
      token: 'admin-auth-token-huraib-2026',
      user: {
        name: 'مدير المنصة الرقمية',
        email: 'admin@huraib.sa',
        role: 'SUPER_ADMIN',
      },
    });
  }
  return res.status(401).json({
    success: false,
    message: 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.',
  });
});

// Public: Get all approved community memories and submissions
app.get('/api/published-archive', (req: Request, res: Response) => {
  const all = loadSubmissions();
  const approved = all.filter((s) => s.status === 'approved');
  res.json({ submissions: approved });
});

// Admin / Public: Get all submissions (admin filters by status)
app.get('/api/submissions', (req: Request, res: Response) => {
  const submissions = loadSubmissions();
  res.json({ submissions });
});

// Public: Submit new memory with direct file upload
app.post('/api/submissions', (req: Request, res: Response) => {
  const { authorName, relationship, message, mediaUrl, mediaType } = req.body;

  if (!authorName || !message) {
    return res.status(400).json({
      success: false,
      message: 'الاسم ونص الذكرى أو المشاركة حقول إلزامية',
    });
  }

  const newSub: Submission = {
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    authorName: authorName.trim(),
    relationship: (relationship || 'أحد محبي وعارفي الشيخ').trim(),
    message: message.trim(),
    mediaUrl: mediaUrl || undefined,
    mediaType: mediaType || (mediaUrl?.startsWith('data:video') ? 'video' : 'image'),
    status: 'pending', // routed to Admin Dashboard under Pending Approvals
    createdAt: new Date().toISOString(),
  };

  const submissions = loadSubmissions();
  submissions.unshift(newSub);
  saveSubmissions(submissions);

  res.status(201).json({
    success: true,
    message: 'تم إرسال مشاركتكم بنجاح وبانتظار المراجعة والاعتماد من قبل الإدارة.',
    submission: newSub,
  });
});

// Admin: Update submission status (approve / reject / edit)
const handleUpdateSubmission = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, authorName, relationship, message } = req.body;

  const submissions = loadSubmissions();
  const idx = submissions.findIndex((s) => s.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'المشاركة غير موجودة' });
  }

  if (status) {
    submissions[idx].status = status;
    if (status === 'approved') {
      submissions[idx].approvedAt = new Date().toISOString();
    }
  }

  if (authorName) submissions[idx].authorName = authorName;
  if (relationship) submissions[idx].relationship = relationship;
  if (message) submissions[idx].message = message;

  saveSubmissions(submissions);

  res.json({
    success: true,
    message: `تم تحديث حالة المشاركة إلى (${submissions[idx].status}) بنجاح`,
    submission: submissions[idx],
  });
};
app.put('/api/submissions/:id', handleUpdateSubmission);
app.patch('/api/submissions/:id', handleUpdateSubmission);

// Admin: Delete submission
app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let submissions = loadSubmissions();
  const beforeCount = submissions.length;
  submissions = submissions.filter((s) => s.id !== id);

  if (submissions.length === beforeCount) {
    return res.status(404).json({ success: false, message: 'المشاركة غير موجودة' });
  }

  saveSubmissions(submissions);
  res.json({ success: true, message: 'تم حذف المشاركة بنجاح' });
});

// AI Admin Copilot: Analyze uploaded media and draft metadata
app.post('/api/ai/analyze-media', async (req: Request, res: Response) => {
  try {
    const { filename, description, mediaData, mimeType } = req.body;
    const ai = getAi();

    const prompt = `
أنت المساعد الذكي والمستشار التوثيقي المعتمد للأرشيف الرقمي لسماحة الشيخ الدكتور كاظم ياسين الحريب (قدست نفسه الزكية)، القائد الديني والاجتماعي لبلدة المنيزلة بالأحساء.

المطلوب: تحليل هذا الملف أو الصورة المرفوعة من قبل الأدمن واقتراح بيانات توثيقية دقيقة ووقورة باللغة العربية الفصحى.

بيانات الملف المتوفرة:
اسم الملف: "${filename || 'وثيقة غير مسماة'}"
وصف أو ملاحظات الأدمن: "${description || 'لا يوجد وصف مرفق'}"

يرجى إخراج النتيجة بتنسيق JSON حصري يحتوي على الحقول التالية:
{
  "title": "عنوان موجز ووقور بالعربية للمحتوى",
  "suggestedSection": "timeline" | "certificates" | "gallery" | "books",
  "caption": "شرح وصفي بليغ من فقرتين يوضح أهمية هذا الأثر في مسيرة الشيخ أو مجتمع المنيزلة",
  "estimatedYear": "السنة التقريبية مثل (2018م أو 2021م أو حقبة التسعينيات)",
  "tags": ["وسم1", "وسم2", "وسم3"]
}

قواعد هامة:
- النبرة: وقورة، أكاديمية، توثيقية، تعكس مكانة الشيخ الدينية والاجتماعية.
- التقسيم: الشهادات تذهب لـ certificates، المقتطفات السيرية لـ timeline، صور اللقاءات والمحاريب لـ gallery، والكتب والدراسات لـ books.
- لا تضع علامات اقتباس برمجية markdown كـ \`\`\`json فقط أرجع كائن الـ JSON الصافي.
`;

    let contentsPayload: any = prompt;

    // Multimodal support if image base64 provided
    if (mediaData && mimeType && mediaData.startsWith('data:')) {
      const base64Data = mediaData.split(',')[1];
      const actualMime = mimeType || mediaData.split(';')[0].replace('data:', '');
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: actualMime,
            },
          },
          { text: prompt },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPayload,
    });

    const rawText = response.text || '{}';
    const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanJsonStr);
    } catch {
      parsedResult = {
        title: filename || 'وثيقة أرشيفية مباركة',
        suggestedSection: 'gallery',
        caption: 'وثيقة وأثر توثيقي مبارك يجسد جانباً من العطاء العلمي والمجتمعي لسماحة الشيخ الدكتور كاظم ياسين الحريب.',
        estimatedYear: '2021م',
        tags: ['المنيزلة', 'أثر_يبقى', 'الشيخ_كاظم_الحريب'],
      };
    }

    res.json({ success: true, result: parsedResult });
  } catch (err: any) {
    console.error('AI Media Analysis Error:', err);
    res.status(500).json({
      success: false,
      message: 'تعذر تحليل الوسائط عبر الذكاء الاصطناعي: ' + (err.message || 'خطأ غير معروف'),
      fallback: {
        title: 'مادة توثيقية جديدة',
        suggestedSection: 'gallery',
        caption: 'مادة أرشيفية توثق مسيرة العطاء لسماحة الشيخ الدكتور كاظم ياسين الحريب.',
        estimatedYear: '2021م',
        tags: ['أثر_يبقى', 'المنيزلة'],
      },
    });
  }
});

// AI Admin Copilot: Smart Research & Auto-Drafting of content and quotes
app.post('/api/ai/draft-content', async (req: Request, res: Response) => {
  try {
    const { topic, contentType } = req.body;
    const ai = getAi();

    const prompt = `
أنت المستشار الأرشيفي المعتمد لمنصة الشيخ الدكتور كاظم ياسين الحريب (قدست روحه الزكية) - خطيب المنبر الحسيني، مصلح ذات البين، مؤسس مهرجان الإبداع والتطوير، ورائد الكوتشينج الأسري في الأحساء.

المطلوب: كتابة وصياغة محتوى توثيقي رفيع المستوى حول موضوع: "${topic || 'عطاء الشيخ ومآثره'}".
نوع المحتوى المطلوب: "${contentType || 'مقال توثيقي'}" (خيارات: اقتباس ملهم | محطة سيرة ذاتية | كلمة تأبينية | إضاءة على كتاب | توجيه أسري).

يرجى تقديم الرد بصيغة JSON حصراً:
{
  "title": "عنوان جذاب ورصين",
  "content": "المحتوى الكامل بصياغة لغوية فصيحة ومؤثرة تبرز جهوده ومبادئه الخالدة",
  "keyTakeaways": ["فائدة 1", "فائدة 2", "فائدة 3"],
  "historicalContext": "السياق الزمني أو المجتمعي في بلدة المنيزلة والأحساء",
  "suggestedTags": ["وسم1", "وسم2"]
}

أخرج فقط كود JSON خالصاً.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const rawText = response.text || '{}';
    const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanJsonStr);
    } catch {
      parsedResult = {
        title: topic || 'إشراقة من فكر وأثر الشيخ',
        content: rawText,
        keyTakeaways: ['خدمة المجتمع عبادة وتقرب إلى الله', 'التماسك والتآلف الاجتماعي درع حصين'],
        historicalContext: 'أثر مجتمعي مستمر في المنيزلة والأحساء',
        suggestedTags: ['الأثر_الخالد', 'المنيزلة'],
      };
    }

    res.json({ success: true, result: parsedResult });
  } catch (err: any) {
    console.error('AI Draft Content Error:', err);
    res.status(500).json({
      success: false,
      message: 'تعذر توليد المحتوى: ' + (err.message || 'خطأ غير معروف'),
      fallback: {
        title: 'رسالة وقيم خالدة',
        content: 'كان سماحة الشيخ الدكتور كاظم الحريب رمزاً للمحبة والسلام، ومربياً فاضلاً نذر حياته لجمع القلوب وإصلاح ذات البين.',
        keyTakeaways: ['إصلاح ذات البين', 'دعم المبدعين والتفوق العلمي'],
        historicalContext: 'عقود من البذل والعطاء في بلدة المنيزلة',
        suggestedTags: ['سفير_المحبة_والسلام'],
      },
    });
  }
});

// ================= VITE & SPA HANDLING =================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite dev middleware failed, falling back to static files:', err);
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req: Request, res: Response) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sheikh Kazim Al-Huraib Tribute Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
