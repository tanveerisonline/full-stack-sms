import 'drizzle-kit';

declare module 'drizzle-kit' {
  interface DrizzleKitConfig {
    schema: string | string[];
    out: string;
    driver: 'mysql2' | 'pg' | 'better-sqlite' | 'libsql' | 'turso' | 'd1-http';
    dbCredentials: {
      connectionString?: string;
      host?: string;
      user?: string;
      password?: string;
      database?: string;
      port?: number;
      uri?: string;
    };
    tablesFilter?: string | string[];
    verbose?: boolean;
    strict?: boolean;
  }
}
