import type { Meta, StoryObj } from '@storybook/sveltekit';
import DayList from '$lib/components/DayList.svelte';
import { mockTasks } from '$lib/stories/mockData';

const meta: Meta<typeof DayList> = {
    title: 'Components/DayList',
    component: DayList,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DayList>;

export const Default: Story = {
    parameters: {
        stores: {
            taskStore: { tasks: mockTasks, loading: false, error: null },
            preferencesStore: {
                activeFilters: { tags: [], projectId: null, priority: null, showCompleted: false },
                showEmptyDays: true,
            },
            uiStore: { focusedTaskId: null, addingTo: null },
        },
    },
};

export const Empty: Story = {
    parameters: {
        stores: {
            taskStore: { tasks: [], loading: false, error: null },
        },
    },
};

export const Loading: Story = {
    parameters: {
        stores: {
            taskStore: { tasks: [], loading: true, error: null },
        },
    },
};
