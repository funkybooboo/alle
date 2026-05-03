import type { Meta, StoryObj } from '@storybook/sveltekit';
import ModalHost from '$lib/components/ModalHost.svelte';

const meta: Meta<typeof ModalHost> = {
    title: 'Components/ModalHost',
    component: ModalHost,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ModalHost>;

export const Default: Story = {};

export const WithActiveModal: Story = {
    parameters: {
        stores: {
            uiStore: { activeModal: 'help' },
        },
    },
};
