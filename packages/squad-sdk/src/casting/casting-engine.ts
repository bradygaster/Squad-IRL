/**
 * Casting Engine v1 (M3-2, Issue #138)
 *
 * Generates themed agent personas from a universe template.
 * Each CastMember maps to an agent role with name, personality, and backstory.
 */

// --- Types ---

export type AgentRole =
  | 'lead'
  | 'developer'
  | 'tester'
  | 'prompt-engineer'
  | 'security'
  | 'devops'
  | 'designer'
  | 'scribe'
  | 'reviewer';

export type UniverseId = 'usual-suspects' | 'oceans-eleven' | 'custom';

export interface CastMember {
  /** Character name from the universe */
  name: string;
  /** Agent role this character fills */
  role: AgentRole;
  /** One-line personality trait */
  personality: string;
  /** Short backstory for system-prompt injection */
  backstory: string;
  /** Display name: "Name — Role" */
  displayName: string;
}

export interface CastingConfig {
  /** Universe theme to draw characters from */
  universe: UniverseId;
  /** Desired team size (clamped to available characters) */
  teamSize?: number;
  /** Roles that must be filled */
  requiredRoles?: AgentRole[];
  /** Custom character names (only for universe = 'custom') */
  customNames?: Record<AgentRole, string>;
}

// --- Universe Templates ---

interface UniverseCharacter {
  name: string;
  personality: string;
  backstory: string;
  preferredRoles: AgentRole[];
}

interface UniverseTemplate {
  id: UniverseId;
  label: string;
  characters: UniverseCharacter[];
}

const USUAL_SUSPECTS: UniverseTemplate = {
  id: 'usual-suspects',
  label: 'The Usual Suspects',
  characters: [
    {
      name: 'Keyser',
      personality: 'Quietly commanding; sees the whole board before anyone else.',
      backstory: 'A legendary figure who orchestrates from the shadows, ensuring every piece falls into place.',
      preferredRoles: ['lead'],
    },
    {
      name: 'McManus',
      personality: 'Bold and direct; ships fast, asks questions later.',
      backstory: 'The hotshot operator who dives headfirst into the hardest problems.',
      preferredRoles: ['developer'],
    },
    {
      name: 'Fenster',
      personality: 'Eccentric communicator; finds bugs nobody else can see.',
      backstory: 'Speaks in riddles but has an uncanny knack for spotting what everyone else missed.',
      preferredRoles: ['tester'],
    },
    {
      name: 'Verbal',
      personality: 'Silver-tongued storyteller; turns complexity into clarity.',
      backstory: 'The narrator who shapes every prompt and message into something an LLM can\'t misunderstand.',
      preferredRoles: ['prompt-engineer', 'scribe'],
    },
    {
      name: 'Hockney',
      personality: 'Street-smart and suspicious; trusts no input.',
      backstory: 'A seasoned skeptic who probes every surface for weaknesses before anyone else can.',
      preferredRoles: ['security', 'reviewer'],
    },
    {
      name: 'Redfoot',
      personality: 'Resourceful fixer; keeps the machinery running.',
      backstory: 'The behind-the-scenes operator who makes sure builds ship and pipelines stay green.',
      preferredRoles: ['devops'],
    },
    {
      name: 'Edie',
      personality: 'Methodical and detail-oriented; nothing escapes review.',
      backstory: 'A meticulous analyst who ensures every deliverable meets the bar.',
      preferredRoles: ['reviewer', 'tester'],
    },
    {
      name: 'Kobayashi',
      personality: 'Precise and formal; an interface between worlds.',
      backstory: 'The liaison who translates requirements into structured specifications.',
      preferredRoles: ['designer', 'prompt-engineer'],
    },
  ],
};

const OCEANS_ELEVEN: UniverseTemplate = {
  id: 'oceans-eleven',
  label: "Ocean's Eleven",
  characters: [
    {
      name: 'Danny',
      personality: 'Cool under pressure; the plan is always three steps ahead.',
      backstory: 'The mastermind who assembles the crew and keeps the vision on track.',
      preferredRoles: ['lead'],
    },
    {
      name: 'Rusty',
      personality: 'Effortlessly sharp; reads people and code with equal ease.',
      backstory: 'The right hand who can debug a conversation or a stack trace mid-bite.',
      preferredRoles: ['developer', 'reviewer'],
    },
    {
      name: 'Linus',
      personality: 'Eager and adaptable; learns fast, ships faster.',
      backstory: 'The up-and-comer who takes on any coding challenge to prove his worth.',
      preferredRoles: ['developer'],
    },
    {
      name: 'Basher',
      personality: 'Explosive creativity; demolishes blockers with flair.',
      backstory: 'The demolitions expert who clears technical debt and obstacles in one blast.',
      preferredRoles: ['devops', 'developer'],
    },
    {
      name: 'Livingston',
      personality: 'Quiet tech wizard; the surveillance and tooling expert.',
      backstory: 'The electronics specialist who wires up monitoring, logging, and automation.',
      preferredRoles: ['devops', 'tester'],
    },
    {
      name: 'Saul',
      personality: 'Old-school wisdom; plays the long game with finesse.',
      backstory: 'A veteran con artist who crafts the perfect prompt persona for any situation.',
      preferredRoles: ['prompt-engineer', 'scribe'],
    },
    {
      name: 'Yen',
      personality: 'Acrobatic precision; navigates tight constraints with grace.',
      backstory: 'The acrobat who fits into the tightest security gaps and edge cases.',
      preferredRoles: ['security', 'tester'],
    },
    {
      name: 'Virgil',
      personality: 'Steadfast and reliable; the backbone of every operation.',
      backstory: 'Half of the dependable duo that handles the grunt work with quiet excellence.',
      preferredRoles: ['developer', 'reviewer'],
    },
    {
      name: 'Turk',
      personality: 'Competitive and driven; races to finish first.',
      backstory: 'The other half of the duo, always trying to one-up his partner in velocity.',
      preferredRoles: ['developer', 'designer'],
    },
    {
      name: 'Reuben',
      personality: 'Strategic backer; knows what\'s worth investing in.',
      backstory: 'The financier who scopes effort and ensures the plan is economically sound.',
      preferredRoles: ['lead', 'reviewer'],
    },
  ],
};

const UNIVERSES: Map<UniverseId, UniverseTemplate> = new Map([
  ['usual-suspects', USUAL_SUSPECTS],
  ['oceans-eleven', OCEANS_ELEVEN],
]);

// --- Casting Engine ---

export class CastingEngine {
  /** List available universe IDs. */
  getUniverses(): UniverseId[] {
    return Array.from(UNIVERSES.keys());
  }

  /** Get a universe template by ID. */
  getUniverse(id: UniverseId): UniverseTemplate | undefined {
    return UNIVERSES.get(id);
  }

  /**
   * Cast a team of agents from a universe.
   *
   * Roles are filled by best-fit characters (preferredRoles match).
   * Required roles are guaranteed to be present.
   * Team size is clamped to available characters.
   */
  castTeam(config: CastingConfig): CastMember[] {
    if (config.universe === 'custom') {
      return this.castCustomTeam(config);
    }

    const template = UNIVERSES.get(config.universe);
    if (!template) {
      throw new Error(`Unknown universe: ${config.universe}`);
    }

    const requiredRoles = config.requiredRoles ?? ['lead', 'developer', 'tester'];
    const teamSize = Math.max(
      requiredRoles.length,
      Math.min(config.teamSize ?? requiredRoles.length, template.characters.length),
    );

    const assigned = new Set<string>();
    const members: CastMember[] = [];

    // Phase 1: Fill required roles by best-fit
    for (const role of requiredRoles) {
      const best = this.findBestFit(template.characters, role, assigned);
      if (!best) {
        throw new Error(
          `Cannot fill required role "${role}" — not enough characters in universe "${config.universe}".`,
        );
      }
      assigned.add(best.name);
      members.push(this.toCastMember(best, role));
    }

    // Phase 2: Fill remaining slots with unassigned characters
    if (members.length < teamSize) {
      const remaining = template.characters.filter((c) => !assigned.has(c.name));
      for (const char of remaining) {
        if (members.length >= teamSize) break;
        const role = char.preferredRoles[0] ?? 'developer';
        assigned.add(char.name);
        members.push(this.toCastMember(char, role));
      }
    }

    return members;
  }

  // --- Internals ---

  private castCustomTeam(config: CastingConfig): CastMember[] {
    if (!config.customNames || Object.keys(config.customNames).length === 0) {
      throw new Error('customNames is required when universe is "custom".');
    }

    return (Object.entries(config.customNames) as [AgentRole, string][]).map(
      ([role, name]) => ({
        name,
        role,
        personality: 'Custom team member.',
        backstory: `${name} fills the ${role} role on this squad.`,
        displayName: `${name} — ${formatRole(role)}`,
      }),
    );
  }

  private findBestFit(
    characters: UniverseCharacter[],
    role: AgentRole,
    assigned: Set<string>,
  ): UniverseCharacter | undefined {
    // Prefer characters whose first preferred role matches
    const primary = characters.find(
      (c) => !assigned.has(c.name) && c.preferredRoles[0] === role,
    );
    if (primary) return primary;

    // Fall back to any character that lists this role
    const secondary = characters.find(
      (c) => !assigned.has(c.name) && c.preferredRoles.includes(role),
    );
    if (secondary) return secondary;

    // Last resort: any unassigned character
    return characters.find((c) => !assigned.has(c.name));
  }

  private toCastMember(char: UniverseCharacter, role: AgentRole): CastMember {
    return {
      name: char.name,
      role,
      personality: char.personality,
      backstory: char.backstory,
      displayName: `${char.name} — ${formatRole(role)}`,
    };
  }
}

function formatRole(role: AgentRole): string {
  return role
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
