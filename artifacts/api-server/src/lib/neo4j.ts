import { initNeo4j, getSession, createCheckinNode, getKnowledgeGraph, Neo4jConfig } from '@workspace/neo4j';
import { app } from './app';

let neo4jDriver: Awaited<ReturnType<typeof initNeo4j>> | null = null;

export async function initApiNeo4j() {
  if (neo4jDriver) return neo4jDriver;

  const config: Neo4jConfig = {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
  };

  neo4jDriver = await initNeo4j(config);
  return neo4jDriver;
}

export async function getNeo4jSession() {
  await initApiNeo4j();
  return getSession();
}

export async function saveCheckinToGraph(checkin: any) {
  const session = await getNeo4jSession();
  try {
    await createCheckinNode(session, checkin.id, checkin);
    console.log(`[Neo4j] Saved checkin ${checkin.id} to knowledge graph`);
  } finally {
    await session.close();
  }
}

// Pattern detection example - call after checkin
export async function detectPatterns(sessionId: string) {
  const session = await getNeo4jSession();
  try {
    // Simple example: connect consecutive low-score checkins
    const result = await session.run(`
      MATCH (c1:Checkin)-[:NEXT_DAY]->(c2:Checkin)
      WHERE c1.sessionId = $sessionId AND c2.sessionId = $sessionId AND c1.score < 2 AND c2.score < 2
      MERGE (c1)-[:CORRELATES_LOW]->(c2)
      RETURN c1, c2
      LIMIT 10
    `, { sessionId });
    console.log(`[Neo4j] Found ${result.records.length} low-score correlations`);
  } finally {
    await session.close();
  }
}

