'use client';

import React from 'react';
import Image from 'next/image';
import { UtensilsCrossed, Home, FileSearch, FileText, User } from 'lucide-react';

export type DashboardTab = 'menu' | 'home' | 'search' | 'jarvis' | 'orders' | 'profile';

export interface BottomNavProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  isVisible?: boolean;
  hasActiveOrder?: boolean;
}

/**
 * BottomNav has been deprecated and disabled per design specification.
 * Navigation is handled via the top header bar (Logo, Table, Cart, Profile, Orders)
 * and the floating Ask AI concierge button.
 */
export default function BottomNav(_props: BottomNavProps) {
  return null;
}


