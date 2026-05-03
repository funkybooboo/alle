import type { Meta, StoryObj } from '@storybook/sveltekit';
import TaskRow from '$lib/components/TaskRow.svelte';
import {
    mockCompletedTask,
    mockOverdueTask,
    mockPriorityTask,
    mockRecurringTaskInstance,
    mockSubTask,
    mockTask,
    mockTimeTask,
} from '$lib/stories/mockData';

const meta: Meta<typeof TaskRow> = {
    title: 'Components/TaskRow',
    component: TaskRow,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TaskRow>;

export const Default: Story = { args: { task: mockTask } };
export const Completed: Story = { args: { task: mockCompletedTask } };
export const SubTask: Story = { args: { task: mockSubTask } };
export const WithTime: Story = { args: { task: mockTimeTask } };
export const Recurring: Story = { args: { task: mockRecurringTaskInstance } };
export const Priority: Story = { args: { task: mockPriorityTask } };
export const Overdue: Story = { args: { task: mockOverdueTask } };
