// ============================================================================
// @tavonza/authorization — AI Adapter: AI Tool Authorizer
// ============================================================================
// Gatekeeper for AI agent tool invocations. Enforces identical security policies
// for AI and human actors without special bypasses.
// ============================================================================

import type { Actor } from '../../core/actor';
import type { AuthorizationDecision } from '../../core/decision';
import { deny, requiresApproval } from '../../core/decision';
import type { Scope } from '../../core/scope';
import type { AuthorizationEngine } from '../../engine/authorization-engine';

export type AiRiskTier = 'read_only' | 'mutation' | 'high_risk_approval';

export interface AiToolDefinition {
  /** The tool name exposed to the LLM (e.g. 'get_menu', 'create_order') */
  readonly name: string;

  /** Domain resource target */
  readonly resource: string;

  /** Action performed on resource */
  readonly action: string;

  /** Explicit permission override (defaults to 'resource:action') */
  readonly requiredPermission?: string;

  /** Risk tier governing approval workflows */
  readonly riskTier?: AiRiskTier;

  /** If true, always requires secondary approval */
  readonly requiresApproval?: boolean;

  /** Tool description */
  readonly description?: string;
}

export interface AuthorizeToolCallParams {
  readonly actor: Actor;
  readonly tool: string;
  readonly args?: Readonly<Record<string, unknown>>;
  readonly scope?: Scope;
  readonly organizationId?: string | null;
  readonly branchId?: string | null;
  readonly requestId?: string;
}

export class AiToolAuthorizer {
  private readonly tools = new Map<string, AiToolDefinition>();

  constructor(
    private readonly engine: AuthorizationEngine,
    tools: AiToolDefinition[] = [],
  ) {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }

  /**
   * Registers a domain tool and its required capability mappings.
   */
  registerTool(tool: AiToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Retrieves a tool definition by name.
   */
  getTool(name: string): AiToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Authorizes an AI tool invocation against the central AuthorizationEngine.
   */
  async authorizeToolCall(params: AuthorizeToolCallParams): Promise<AuthorizationDecision> {
    const { actor, tool, args = {}, scope, organizationId, branchId, requestId } = params;

    const toolDef = this.tools.get(tool);
    if (!toolDef) {
      return deny({
        reason: `Unknown tool: '${tool}' is not registered with the authorization engine`,
        code: 'DENIED_NO_PERMISSION',
        scope,
      });
    }

    const permission = toolDef.requiredPermission ?? `${toolDef.resource}:${toolDef.action}`;

    // 1. Check if tool is unconditionally designated as high-risk requiring approval
    if (toolDef.requiresApproval || toolDef.riskTier === 'high_risk_approval') {
      // First verify actor has basic permission to request the action
      const basicCheck = await this.engine.authorize({
        actor,
        action: permission,
        resource: toolDef.resource,
        scope,
        organizationId: organizationId ?? actor.organizationId,
        branchId: branchId ?? actor.branchId,
        requestId,
        environment: { tool, args, isAiInvocation: true },
      });

      if (!basicCheck.allowed && basicCheck.status === 'DENY') {
        return basicCheck;
      }

      // If actor has base permission, pause for high-risk approval
      return requiresApproval({
        reason: `High-risk tool '${tool}' requires human/manager approval before execution`,
        matchedPermission: basicCheck.matchedPermission,
        scope,
        metadata: {
          tool,
          args,
          requiresConfirmation: true,
        },
      });
    }

    // 2. Standard authorization check through the central engine
    return await this.engine.authorize({
      actor,
      action: permission,
      resource: toolDef.resource,
      scope,
      organizationId: organizationId ?? actor.organizationId,
      branchId: branchId ?? actor.branchId,
      requestId,
      environment: {
        tool,
        args,
        isAiInvocation: true,
      },
    });
  }
}
