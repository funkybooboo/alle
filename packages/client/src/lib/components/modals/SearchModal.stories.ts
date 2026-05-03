import type { Meta, StoryObj } from '@storybook/sveltekit';
import SearchModal from '$lib/components/modals/SearchModal.svelte';

const meta: Meta<typeof SearchModal> = {
    title: 'Components/Modals/SearchModal',
    component: SearchModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchModal>;

export const Default: Story = {};
