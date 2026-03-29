import neo4j, { Session, Driver, Integer } from 'neo4j-driver';

export interface Neo4jConfig {
  uri: string;
  user: string;
  password: string;
}

let driver: Driver | null = null;

export async function initNeo4j(config: Neo4jConfig): Promise<Driver> {
  if (!driver) {
    driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password));
    // Test connection
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
  }
  return driver;
}

export async function getSession(): Promise<Session> {
  if (!driver) throw new Error('Neo4j driver not initialized');
  return driver.session({ database: 'neo4j' });
}

export async function createCheckinNode(session: Session, checkinId: string, data: any) {
  const score = (data.attendedClass ? 1 : 0) + (data.ateWell ? 1 : 0) + (data.leftRoom ? 1 : 0) + (data.maskingLevel <= 2 ? 1 : 0);
  const query = `
    MERGE (c:Checkin {id: $checkinId})
    SET c += $data,
        c.score = $score,
        c.createdAt = $createdAt
    RETURN c
  `;
  return session.run(query, { checkinId, data, score, createdAt: new Date().toISOString() });
}

export async function createPatternEdge(session: Session, checkinId1: string, checkinId2: string, relation: string) {
  const query = `
    MATCH (c1:Checkin {id: $checkinId1}), (c2:Checkin {id: $checkinId2})
    MERGE (c1)-[r:${relation}]->(c2)
    RETURN r
  `;
  return session.run(query, { checkinId1, checkinId2 });
}

export async function getKnowledgeGraph(session: Session, sessionId: string, limit = 50) {
  const query = `
    MATCH (c:Checkin)-[r]->(other)
    WHERE c.sessionId = $sessionId
    RETURN c, r, other
    LIMIT $limit
  `;
    return session.run(query, { sessionId, limit });
}

export async function closeNeo4j() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

