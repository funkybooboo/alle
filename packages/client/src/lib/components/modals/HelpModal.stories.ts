import type { Meta, StoryObj } from '@storybook/sveltekit';
import HelpModal from '$lib/components/modals/HelpModal.svelte';

const meta: Meta<typeof HelpModal> = {
    title: 'Components/Modals/HelpModal',
    component: HelpModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HelpModal>;

export const Default: Story = {};
