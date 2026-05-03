import type { Meta, StoryObj } from '@storybook/sveltekit';
import TaskDetailModal from '$lib/components/modals/TaskDetailModal.svelte';
import { mockCompletedTask, mockTask, mockTimeTask } from '$lib/stories/mockData';

const meta: Meta<typeof TaskDetailModal> = {
    title: 'Components/Modals/TaskDetailModal',
    component: TaskDetailModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TaskDetailModal>;

export const Default: Story = {
    parameters: {
        stores: {
            uiStore: { focusedTaskId: '1' },
            taskStore: { tasks: [mockTask] },
        },
    },
};

export const Completed: Story = {
    parameters: {
        stores: {
            uiStore: { focusedTaskId: '2' },
            taskStore: { tasks: [mockCompletedTask] },
        },
    },
};

export const WithTime: Story = {
    parameters: {
        stores: {
            uiStore: { focusedTaskId: '5' },
            taskStore: { tasks: [mockTimeTask] },
        },
    },
};
