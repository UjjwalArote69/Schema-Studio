import { Table, Relation } from "@/store/useSchemaStore";

// Added sqlite, mongoose-js, and mongoose-ts
export type ExportFormat = "postgresql" | "mysql" | "sqlite" | "prisma" | "mongoose-js" | "mongoose-ts";

export function generateCode(tables: Table[], relations: Relation[], format: ExportFormat): string {
  if (tables.length === 0) return "-- No tables defined yet. Add some tables to the canvas!";

  switch (format) {
    case "postgresql":
      return generatePostgres(tables, relations);
    case "mysql":
      return generateMySQL(tables, relations);
    case "sqlite":
      return generateSQLite(tables, relations);
    case "prisma":
      return generatePrisma(tables, relations);
    case "mongoose-js":
      return generateMongooseJS(tables, relations);
    case "mongoose-ts":
      return generateMongooseTS(tables, relations);
    default:
      return "";
  }
}

// 1. PostgreSQL (Upgraded with Junction Tables & 1:1 Constraints)
function generatePostgres(tables: Table[], relations: Relation[]): string {
  let sql = "";
  
  // Normal Tables
  tables.forEach((table) => {
    sql += `CREATE TABLE "${table.name}" (\n`;
    table.columns.forEach((col, index) => {
      let colDef = `  "${col.name}" ${col.type === "VARCHAR" ? "VARCHAR(255)" : col.type}`;
      if (col.isPrimary) colDef += " PRIMARY KEY";
      if (col.isUnique && !col.isPrimary) colDef += " UNIQUE";
      if (index < table.columns.length - 1) colDef += ",";
      sql += `${colDef}\n`;
    });
    sql += `);\n\n`;
  });

  // Foreign Keys & Junction Tables
  relations.forEach((rel) => {
    const source = tables.find(t => t.id === rel.sourceTableId);
    const target = tables.find(t => t.id === rel.targetTableId);
    const sourceCol = source?.columns.find(c => c.id === rel.sourceColumnId);
    const targetCol = target?.columns.find(c => c.id === rel.targetColumnId);
    
    if (source && target && sourceCol && targetCol) {
      if (rel.type === "m:n") {
        // Generate an automatic Junction Table for Many-to-Many
        const junctionName = `${source.name}_${target.name}`;
        sql += `-- Auto-generated Junction Table for Many-to-Many\n`;
        sql += `CREATE TABLE "${junctionName}" (\n`;
        sql += `  "${source.name}_id" ${sourceCol.type === "VARCHAR" ? "VARCHAR(255)" : sourceCol.type},\n`;
        sql += `  "${target.name}_id" ${targetCol.type === "VARCHAR" ? "VARCHAR(255)" : targetCol.type},\n`;
        sql += `  PRIMARY KEY ("${source.name}_id", "${target.name}_id"),\n`;
        sql += `  FOREIGN KEY ("${source.name}_id") REFERENCES "${source.name}" ("${sourceCol.name}"),\n`;
        sql += `  FOREIGN KEY ("${target.name}_id") REFERENCES "${target.name}" ("${targetCol.name}")\n`;
        sql += `);\n\n`;
      } else {
        // Standard Foreign Key (1:n or 1:1)
        sql += `ALTER TABLE "${source.name}" ADD FOREIGN KEY ("${sourceCol.name}") REFERENCES "${target.name}" ("${targetCol.name}");\n`;
        // If 1:1, add a UNIQUE constraint to the source column
        if (rel.type === "1:1") {
           sql += `ALTER TABLE "${source.name}" ADD CONSTRAINT "uq_${source.name}_${sourceCol.name}" UNIQUE ("${sourceCol.name}");\n`;
        }
      }
    }
  });
  return sql.trim();
}

// 2. MySQL
function generateMySQL(tables: Table[], relations: Relation[]): string {
  let sql = "";
  tables.forEach((table) => {
    sql += `CREATE TABLE \`${table.name}\` (\n`;
    table.columns.forEach((col, index) => {
      const type = col.type === "UUID" ? "VARCHAR(36)" : (col.type === "VARCHAR" ? "VARCHAR(255)" : col.type);
      let colDef = `  \`${col.name}\` ${type}`;
      if (col.isPrimary) colDef += " PRIMARY KEY";
      if (col.isUnique && !col.isPrimary) colDef += " UNIQUE";
      if (index < table.columns.length - 1) colDef += ",";
      sql += `${colDef}\n`;
    });
    sql += `);\n\n`;
  });

  relations.forEach((rel) => {
    const source = tables.find(t => t.id === rel.sourceTableId);
    const target = tables.find(t => t.id === rel.targetTableId);
    const sourceCol = source?.columns.find(c => c.id === rel.sourceColumnId);
    const targetCol = target?.columns.find(c => c.id === rel.targetColumnId);
    if (source && target && sourceCol && targetCol) {
      sql += `ALTER TABLE \`${source.name}\` ADD CONSTRAINT \`fk_${source.name}_${target.name}\` FOREIGN KEY (\`${sourceCol.name}\`) REFERENCES \`${target.name}\` (\`${targetCol.name}\`);\n`;
    }
  });
  return sql.trim();
}

// 3. SQLite (Foreign Keys MUST be inline)
function generateSQLite(tables: Table[], relations: Relation[]): string {
  let sql = "PRAGMA foreign_keys = ON;\n\n";

  const mapType = (type: string) => {
    const map: Record<string, string> = { "UUID": "TEXT", "VARCHAR": "TEXT", "INT": "INTEGER", "FLOAT": "REAL", "BOOLEAN": "INTEGER", "DATE": "TEXT" };
    return map[type] || "TEXT";
  };

  tables.forEach((table) => {
    sql += `CREATE TABLE "${table.name}" (\n`;
    
    const tableRelations = relations.filter(r => r.sourceTableId === table.id);
    
    table.columns.forEach((col, index) => {
      let colDef = `  "${col.name}" ${mapType(col.type)}`;
      if (col.isPrimary) colDef += " PRIMARY KEY";
      if (col.isUnique && !col.isPrimary) colDef += " UNIQUE";
      
      // Add a comma if it's not the last column OR if there are foreign keys to add
      if (index < table.columns.length - 1 || tableRelations.length > 0) colDef += ",";
      sql += `${colDef}\n`;
    });

    // Inject Foreign Keys directly into the CREATE TABLE statement
    tableRelations.forEach((rel, index) => {
      const target = tables.find(t => t.id === rel.targetTableId);
      const sourceCol = table.columns.find(c => c.id === rel.sourceColumnId);
      const targetCol = target?.columns.find(c => c.id === rel.targetColumnId);
      
      if (target && sourceCol && targetCol) {
        let fkDef = `  FOREIGN KEY ("${sourceCol.name}") REFERENCES "${target.name}" ("${targetCol.name}")`;
        if (index < tableRelations.length - 1) fkDef += ",";
        sql += `${fkDef}\n`;
      }
    });

    sql += `);\n\n`;
  });

  return sql.trim();
}

// 4. Prisma Schema (Upgraded with m:n arrays)
function generatePrisma(tables: Table[], relations: Relation[]): string {
  let code = `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;

  const mapType = (type: string) => {
    const map: Record<string, string> = { "UUID": "String", "VARCHAR": "String", "INT": "Int", "FLOAT": "Float", "BOOLEAN": "Boolean", "DATE": "DateTime" };
    return map[type] || "String";
  };

  tables.forEach((table) => {
    code += `model ${table.name} {\n`;
    table.columns.forEach((col) => {
      let colDef = `  ${col.name} ${mapType(col.type)}`;
      if (col.isPrimary) colDef += col.type === "UUID" ? " @id @default(uuid())" : " @id @default(autoincrement())";
      if (col.isUnique && !col.isPrimary) colDef += " @unique";
      code += `${colDef}\n`;
    });

    const tableRelations = relations.filter(r => r.sourceTableId === table.id || r.targetTableId === table.id);
    tableRelations.forEach(rel => {
      const source = tables.find(t => t.id === rel.sourceTableId);
      const target = tables.find(t => t.id === rel.targetTableId);
      const sourceCol = source?.columns.find(c => c.id === rel.sourceColumnId);
      const targetCol = target?.columns.find(c => c.id === rel.targetColumnId);

      if (source && target && sourceCol && targetCol) {
        if (rel.type === "m:n") {
           // Many to Many: Just an array of the other type on both sides
           if (rel.sourceTableId === table.id) {
             code += `  ${target.name.toLowerCase()}s ${target.name}[]\n`;
           } else {
             code += `  ${source.name.toLowerCase()}s ${source.name}[]\n`;
           }
        } else if (rel.sourceTableId === table.id) {
          // Source side of 1:n or 1:1
          const uniqueTag = rel.type === "1:1" ? " @unique" : "";
          code += `  ${target.name.toLowerCase()} ${target.name} @relation(fields: [${sourceCol.name}], references: [${targetCol.name}])${uniqueTag}\n`;
        } else {
          // Target side of 1:n or 1:1
          const isOneToOne = rel.type === "1:1";
          code += `  ${source.name.toLowerCase()}${isOneToOne ? '' : 's'} ${source.name}${isOneToOne ? '?' : '[]'}\n`;
        }
      }
    });
    code += `}\n\n`;
  });
  return code.trim();
}

// 5. Mongoose (JavaScript)
function generateMongooseJS(tables: Table[], relations: Relation[]): string {
  let code = `const mongoose = require('mongoose');\n\n`;

  const mapType = (type: string) => {
    const map: Record<string, string> = { "UUID": "String", "VARCHAR": "String", "INT": "Number", "FLOAT": "Number", "BOOLEAN": "Boolean", "DATE": "Date" };
    return map[type] || "String";
  };

  tables.forEach((table) => {
    code += `const ${table.name}Schema = new mongoose.Schema({\n`;
    table.columns.forEach((col) => {
      if (col.isPrimary) return; 
      const relation = relations.find(r => r.sourceTableId === table.id && r.sourceColumnId === col.id);
      
      if (relation) {
        const target = tables.find(t => t.id === relation.targetTableId);
        code += `  ${col.name}: { type: mongoose.Schema.Types.ObjectId, ref: '${target?.name}' },\n`;
      } else {
        code += `  ${col.name}: { type: ${mapType(col.type)}${col.isUnique ? ", unique: true" : ""} },\n`;
      }
    });

    code += `}, { timestamps: true });\n\n`;
    code += `module.exports = mongoose.model('${table.name}', ${table.name}Schema);\n\n`;
  });

  return code.trim();
}

// 6. Mongoose (TypeScript)
function generateMongooseTS(tables: Table[], relations: Relation[]): string {
  let code = `import mongoose, { Schema, Document, Types } from 'mongoose';\n\n`;

  const mapTSType = (type: string) => {
    const map: Record<string, string> = { "UUID": "string", "VARCHAR": "string", "INT": "number", "FLOAT": "number", "BOOLEAN": "boolean", "DATE": "Date" };
    return map[type] || "string";
  };

  const mapSchemaType = (type: string) => {
    const map: Record<string, string> = { "UUID": "String", "VARCHAR": "String", "INT": "Number", "FLOAT": "Number", "BOOLEAN": "Boolean", "DATE": "Date" };
    return map[type] || "String";
  };

  tables.forEach((table) => {
    // 1. Generate the TypeScript Interface
    code += `export interface I${table.name} extends Document {\n`;
    table.columns.forEach((col) => {
      if (col.isPrimary) return; // _id is handled by Document extension
      const relation = relations.find(r => r.sourceTableId === table.id && r.sourceColumnId === col.id);
      
      if (relation) {
        code += `  ${col.name}: Types.ObjectId;\n`;
      } else {
        code += `  ${col.name}: ${mapTSType(col.type)};\n`;
      }
    });
    code += `}\n\n`;

    // 2. Generate the Mongoose Schema
    code += `const ${table.name}Schema: Schema = new Schema({\n`;
    table.columns.forEach((col) => {
      if (col.isPrimary) return;
      const relation = relations.find(r => r.sourceTableId === table.id && r.sourceColumnId === col.id);
      
      if (relation) {
        const target = tables.find(t => t.id === relation.targetTableId);
        code += `  ${col.name}: { type: Schema.Types.ObjectId, ref: '${target?.name}' },\n`;
      } else {
        code += `  ${col.name}: { type: ${mapSchemaType(col.type)}${col.isUnique ? ", unique: true" : ""} },\n`;
      }
    });

    code += `}, { timestamps: true });\n\n`;
    code += `export default mongoose.models.${table.name} || mongoose.model<I${table.name}>('${table.name}', ${table.name}Schema);\n\n`;
  });

  return code.trim();
}