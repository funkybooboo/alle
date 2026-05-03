import type { Meta, StoryObj } from '@storybook/sveltekit';
import InlineAddTask from '$lib/components/InlineAddTask.svelte';

const meta: Meta<typeof InlineAddTask> = {
    title: 'Components/InlineAddTask',
    component: InlineAddTask,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InlineAddTask>;

export const Default: Story = {
    args: { date: '2026-04-27' },
};

export const SomedayGroup: Story = {
    args: { date: '', someDayGroupId: 'sg-1' },
};
