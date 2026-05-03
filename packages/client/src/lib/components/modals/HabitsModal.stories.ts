import type { Meta, StoryObj } from '@storybook/sveltekit';
import HabitsModal from '$lib/components/modals/HabitsModal.svelte';

const meta: Meta<typeof HabitsModal> = {
    title: 'Components/Modals/HabitsModal',
    component: HabitsModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HabitsModal>;

export const Default: Story = {};
