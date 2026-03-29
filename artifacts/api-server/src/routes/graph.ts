import { Router } from 'express';
import { getNeo4jSession, getKnowledgeGraph } from '@workspace/neo4j';

const router = Router();

router.get('/graph/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getNeo4jSession();
    const result = await getKnowledgeGraph(session, sessionId, 50);
    const nodes: any[] = [];
    const edges: any[] = [];
    
    result.records.forEach(record => {
      const c = record.get('c').properties;
      const r = record.get('r');
      const other = record.get('other').properties;
      
      nodes.push({ id: c.id, label: `Checkin ${new Date(c.createdAt).toLocaleDateString()} (score: ${c.score})`, data: c });
      edges.push({ id: r.identity.low, source: c.id, target: other.id, label: r.type });
    });

    res.json({ nodes, edges });
  } catch (err) {
    console.error('[API Graph] Error:', err);
    res.status(500).json({ error: 'Graph query failed' });
  }
});

export default router;

