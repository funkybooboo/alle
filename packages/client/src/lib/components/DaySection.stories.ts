import type { Meta, StoryObj } from '@storybook/sveltekit';
import DaySection from '$lib/components/DaySection.svelte';
import {
    mockCompletedTask,
    mockOverdueTask,
    mockTask,
    mockTasks,
    mockTimeTask,
} from '$lib/stories/mockData';

const meta: Meta<typeof DaySection> = {
    title: 'Components/DaySection',
    component: DaySection,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DaySection>;

export const Default: Story = {
    args: {
        id: 'day-2026-04-27',
        dateStr: '2026-04-27',
        label: 'April 27, 2026 • Sunday',
        tasks: mockTasks,
    },
};

export const Today: Story = {
    args: {
        id: 'day-today',
        dateStr: new Date().toISOString().split('T')[0],
        label: 'Today • April 27, 2026',
        tasks: [mockTask, mockCompletedTask, mockTimeTask],
    },
};

export const Overdue: Story = {
    args: {
        id: 'day-2026-04-25',
        dateStr: '2026-04-25',
        label: 'April 25, 2026 • Friday',
        tasks: [mockOverdueTask],
    },
};

export const Empty: Story = {
    args: {
        id: 'day-2026-04-28',
        dateStr: '2026-04-28',
        label: 'April 28, 2026 • Monday',
        tasks: [],
    },
};
