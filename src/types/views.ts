import type { ComponentType } from 'react';

export interface ViewDefinition {
  id: string;
  title: string;
  hash: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
}

