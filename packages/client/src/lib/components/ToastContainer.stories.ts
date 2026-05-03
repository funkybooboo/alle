import type { Meta, StoryObj } from '@storybook/sveltekit';
import ToastContainer from '$lib/components/ToastContainer.svelte';

const meta: Meta<typeof ToastContainer> = {
    title: 'Components/ToastContainer',
    component: ToastContainer,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ToastContainer>;

export const Default: Story = {};

export const WithMessage: Story = {
    parameters: {
        stores: {
            uiStore: { toastMessage: 'Task deleted', toastAction: { label: 'Undo', fn: () => {} } },
        },
    },
};
