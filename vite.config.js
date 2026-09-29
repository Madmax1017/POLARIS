import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

function geminiServerPlugin() {
  const handler = async (req, res, next) => {
    if (req.url === '/api/analyze-mission' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        try {
          const env = loadEnv('development', process.cwd(), '');
          const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

          if (!apiKey) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'GEMINI_API_KEY is missing on server.' }));
          }

          const { payload } = JSON.parse(body || '{}');

          const prompt = `You are the NORTHSTAR Polar Expedition Intelligence Engine. Analyze the following structured polar mission data and return ONLY a valid JSON object matching the exact schema required. Do NOT return markdown backticks around the JSON.

SCHEMA REQUIREMENTS:
Return a JSON object with this exact structure:
{
  "executiveSummary": "Concise 2-3 sentence operational state summary of the mission.",
  "overallReadiness": {
    "score": 78,
    "status": "READY WITH CAUTIONS",
    "explanation": "Brief explanation derived strictly from data."
  },
  "readinessBreakdown": {
    "personnel": 96,
    "assets": 88,
    "inventory": 72,
    "logistics": 81,
    "route": 84,
    "weather": 63,
    "communications": 91
  },
  "resourceAnalysis": [
    {
      "resource": "Resource Name",
      "required": "8,000 L",
      "available": "157,000 L",
      "remaining": "149,000 L",
      "status": "HEALTHY",
      "assessment": "Detailed assessment"
    }
  ],
  "logisticsAssessment": {
    "score": 81,
    "cargoStatus": "Cargo state summary",
    "transportStatus": "Transport status",
    "dependencies": "Key dependencies",
    "assessment": "Detailed logistics assessment"
  },
  "routeAssessment": {
    "status": "CAUTION",
    "reason": "Route/weather reason",
    "details": "Details on route conditions"
  },
  "personnelAssessment": {
    "score": 96,
    "assessment": "Personnel assessment",
    "risks": "Personnel risks",
    "recommendations": "Personnel recommendations"
  },
  "assetAssessment": {
    "availableCount": 2,
    "totalCount": 2,
    "maintenanceConcerns": "Maintenance concerns",
    "dependencies": "Asset dependencies",
    "assessment": "Asset assessment"
  },
  "risks": [
    {
      "risk": "Risk description",
      "category": "Weather",
      "severity": "HIGH",
      "probability": "MEDIUM",
      "impact": "Operational impact",
      "mitigation": "Mitigation steps",
      "priority": "HIGH"
    }
  ],
  "criticalFindings": [
    {
      "type": "warning",
      "text": "Critical finding line"
    }
  ],
  "recommendations": [
    {
      "priority": "HIGH",
      "action": "Practical action",
      "reason": "Reason for recommendation"
    }
  ],
  "finalAssessment": {
    "status": "READY WITH CAUTIONS",
    "explanation": "Final decision support note for Expedition Commander."
  }
}

IMPORTANT:
- Analyze ONLY the supplied mission data. If information is unavailable, use "Insufficient data" instead of inventing facts.
- Generate realistic scores derived from the data.

STRUCTURED MISSION DATA:
${JSON.stringify(payload, null, 2)}`;

          const models = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
          let lastErr = null;
          let reportObj = null;

          for (const model of models) {
            try {
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
              const geminiRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: "application/json"
                  }
                })
              });

              if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
                  reportObj = JSON.parse(cleaned);
                  break;
                }
              } else {
                lastErr = await geminiRes.text();
              }
            } catch (e) {
              lastErr = e.message;
            }
          }

          if (reportObj) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(reportObj));
          }

          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: `Gemini API call failed: ${lastErr}` }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else {
      next();
    }
  };

  return {
    name: 'gemini-server-plugin',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), geminiServerPlugin()],
})

