import { Table, Relation, Column } from "@/store/useSchemaStore";

const generateId = () => Math.random().toString(36).substring(2, 9);

export function parseSQL(sql: string): { tables: Table[]; relations: Relation[] } {
  const tables: Table[] = [];
  const relations: Relation[] = [];
  const pendingRelations: { sourceTableId: string; sourceColName: string; targetTableName: string; targetColName: string }[] = [];

  // 1. Clean the SQL (remove comments and extra whitespace)
  const cleanSql = sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();

  // 2. Split by CREATE TABLE statements
  const tableMatches = cleanSql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\);/gi);

  let offsetX = 100;
  let offsetY = 100;

  for (const match of tableMatches) {
    const tableName = match[1];
    const body = match[2];
    const tableId = `t_${generateId()}`;
    
    const columns: Column[] = [];
    const lines = body.split(",").map(line => line.trim());

    lines.forEach(line => {
      // Check if line is a Column Definition
      const colMatch = line.match(/^["`]?(\w+)["`]?\s+(\w+)(?:\(.*\))?(\s+PRIMARY\s+KEY|\s+UNIQUE|\s+NOT\s+NULL)*/i);
      
      if (colMatch) {
        const colName = colMatch[1];
        const rawType = colMatch[2].toUpperCase();
        const constraints = colMatch[3] || "";

        // Map SQL types to our app types
        let type = "VARCHAR";
        if (rawType.includes("INT")) type = "INT";
        if (rawType.includes("TEXT") || rawType.includes("CHAR")) type = "TEXT";
        if (rawType.includes("UUID")) type = "UUID";
        if (rawType.includes("BOOL")) type = "BOOLEAN";
        if (rawType.includes("DATE") || rawType.includes("TIME")) type = "DATE";
        if (rawType.includes("JSON")) type = "JSON";

        columns.push({
          id: `c_${generateId()}`,
          name: colName,
          type: type,
          isPrimary: /PRIMARY\s+KEY/i.test(line) || /PRIMARY\s+KEY/i.test(constraints),
          isUnique: /UNIQUE/i.test(line) || /UNIQUE/i.test(constraints),
        });
      }

      // Check for Inline Foreign Keys: FOREIGN KEY (col) REFERENCES table(col)
      const fkMatch = line.match(/FOREIGN\s+KEY\s*\((?:["`]?(\w+)["`]?)\)\s*REFERENCES\s+["`]?(\w+)["`]?\s*\((?:["`]?(\w+)["`]?)\)/i);
      if (fkMatch) {
        const sourceColName = fkMatch[1];
        const targetTableName = fkMatch[2];
        const targetColName = fkMatch[3];

        // We'll process these after all tables are created to find IDs
        pendingRelations.push({
          sourceTableId: tableId,
          sourceColName,
          targetTableName,
          targetColName
        });
      }
    });

    tables.push({
      id: tableId,
      name: tableName,
      position: { x: offsetX, y: offsetY },
      columns
    });

    // Offset next table so they don't stack perfectly on top of each other
    offsetX += 300;
    if (offsetX > 900) {
      offsetX = 100;
      offsetY += 400;
    }
  }

  // 3. Resolve Relationships
  // (Simplified version: this matches the table/column names to find the internal IDs)
  pendingRelations.forEach(rel => {
    const sourceTable = tables.find(t => t.id === rel.sourceTableId);
    const targetTable = tables.find(t => t.name.toLowerCase() === rel.targetTableName.toLowerCase());
    
    if (sourceTable && targetTable) {
      const sourceCol = sourceTable.columns.find(c => c.name === rel.sourceColName);
      const targetCol = targetTable.columns.find(c => c.name === rel.targetColName);

      if (sourceCol && targetCol) {
        relations.push({
          id: `r_${generateId()}`,
          sourceTableId: sourceTable.id,
          sourceColumnId: sourceCol.id,
          targetTableId: targetTable.id,
          targetColumnId: targetCol.id,
          type: '1:n'
        });
      }
    }
  });

  return { tables, relations };
}