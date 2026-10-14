export const SETTINGS_SECTIONS = ['org-profile', 'admin-profile', 'notifications', 'security'] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export type SettingsTab = 'organization' | 'admin-profile' | 'notifications' | 'security';

export const SECTION_TO_TAB: Record<SettingsSection, SettingsTab> = {
  'org-profile': 'organization',
  'admin-profile': 'admin-profile',
  notifications: 'notifications',
  security: 'security',
};

export const TAB_TO_SECTION: Record<SettingsTab, SettingsSection> = {
  organization: 'org-profile',
  'admin-profile': 'admin-profile',
  notifications: 'notifications',
  security: 'security',
};

export function isSettingsSection(value: string | undefined | null): value is SettingsSection {
  return SETTINGS_SECTIONS.includes(value as SettingsSection);
}
