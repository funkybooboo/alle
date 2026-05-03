import type { Meta, StoryObj } from '@storybook/sveltekit';
import TrashModal from '$lib/components/modals/TrashModal.svelte';

const meta: Meta<typeof TrashModal> = {
    title: 'Components/Modals/TrashModal',
    component: TrashModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TrashModal>;

export const Default: Story = {};

export const WithDeletedTasks: Story = {
    parameters: {
        stores: {
            taskStore: {
                tasks: [
                    {
                        id: 'd1',
                        text: 'Old task',
                        deletedAt: '2026-04-26T10:00:00Z',
                        completed: false,
                    },
                ],
            },
        },
    },
};
