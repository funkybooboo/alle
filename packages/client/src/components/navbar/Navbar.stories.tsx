import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Navbar } from './Navbar';

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onNavigateToday: fn(),
    onNavigatePrevDay: fn(),
    onNavigateNextDay: fn(),
    onNavigatePrevWeek: fn(),
    onNavigateNextWeek: fn(),
    onSearchToggle: fn(),
    onCalendarToggle: fn(),
  },
  argTypes: {
    onNavigateToday: { action: 'onNavigateToday clicked' },
    onNavigatePrevDay: { action: 'onNavigatePrevDay clicked' },
    onNavigateNextDay: { action: 'onNavigateNextDay clicked' },
    onNavigatePrevWeek: { action: 'onNavigatePrevWeek clicked' },
    onNavigateNextWeek: { action: 'onNavigateNextWeek clicked' },
    onSearchToggle: { action: 'onSearchToggle clicked' },
    onCalendarToggle: { action: 'onCalendarToggle clicked' },
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentDate: new Date(),
  },
};

export const WithCurrentDate: Story = {
  args: {
    currentDate: new Date(),
  },
};

export const FutureDate: Story = {
  args: {
    currentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Click navigation arrows to move between days/weeks. Click calendar icon to jump to today. Click search icon to toggle search.',
      },
    },
  },
};
