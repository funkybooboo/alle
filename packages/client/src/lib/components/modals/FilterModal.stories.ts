import type { Meta, StoryObj } from '@storybook/sveltekit';
import FilterModal from '$lib/components/modals/FilterModal.svelte';

const meta: Meta<typeof FilterModal> = {
    title: 'Components/Modals/FilterModal',
    component: FilterModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterModal>;

export const Default: Story = {};
