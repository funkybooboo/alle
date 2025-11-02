import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Navbar } from './Navbar';

const meta = {
  title: 'Components/Navbar/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    currentDate: {
      control: 'date',
      description: 'Current date displayed in the navbar',
    },
    onNavigateToday: {
      action: 'navigate to today',
    },
    onNavigatePrevDay: {
      action: 'navigate previous day',
    },
    onNavigateNextDay: {
      action: 'navigate next day',
    },
    onNavigatePrevWeek: {
      action: 'navigate previous week',
    },
    onNavigateNextWeek: {
      action: 'navigate next week',
    },
    onSearchToggle: {
      action: 'search toggled',
    },
  },
  args: {
    onNavigateToday: fn(),
    onNavigatePrevDay: fn(),
    onNavigateNextDay: fn(),
    onNavigatePrevWeek: fn(),
    onNavigateNextWeek: fn(),
    onSearchToggle: fn(),
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
