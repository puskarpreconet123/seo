const { Router } = require('express');
const { prisma } = require('../db/client.js');
const { generateAssistantChatResponse } = require('../services/ai.js');

const router = Router();

router.post('/chat', async (req, res) => {
  const { messages, audit_id } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ detail: "Invalid request. 'messages' array is required." });
  }

  console.info(`[AssistantRouter] Query received. Messages: ${messages.length}, Audit ID: ${audit_id}`);

  let auditResults = null;
  if (audit_id) {
    try {
      const auditRecord = await prisma.audit.findUnique({
        where: { id: audit_id }
      });
      if (auditRecord && auditRecord.results) {
        auditResults = auditRecord.results;
        console.info(`[AssistantRouter] Loaded audit context for URL: ${auditRecord.url}`);
      } else {
        console.warn(`[AssistantRouter] Audit context ${audit_id} not found or results empty.`);
      }
    } catch (err) {
      console.error(`[AssistantRouter] Failed to fetch audit context ${audit_id}: ${err.message}`);
    }
  }

  try {
    const reply = await generateAssistantChatResponse(messages, auditResults);
    res.json({ response: reply });
  } catch (err) {
    console.error(`[AssistantRouter] Assistant generation failed:`, err);
    res.status(500).json({ detail: `Failed to generate assistant response: ${err.message}` });
  }
});

module.exports = router;
