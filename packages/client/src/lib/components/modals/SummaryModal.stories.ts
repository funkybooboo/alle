import type { Meta, StoryObj } from '@storybook/sveltekit';
import SummaryModal from '$lib/components/modals/SummaryModal.svelte';

const meta: Meta<typeof SummaryModal> = {
    title: 'Components/Modals/SummaryModal',
    component: SummaryModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SummaryModal>;

export const Default: Story = {};
