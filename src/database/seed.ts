// ============================================================================
// Database Seed Main Entrypoint (Delegates to modular seed architecture)
// ============================================================================
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables (.env from workspace root and local)
config({ path: resolve(__dirname, '../../../.env') });
config();

import { runModularSeed } from './seed/index';

// Export for external callers or CLI invocation
export { runModularSeed };
export { DEFAULT_BRANCH_ID } from './seed/constants';

// Execute modular seed runner
runModularSeed();
