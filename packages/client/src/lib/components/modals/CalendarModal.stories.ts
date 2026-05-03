import type { Meta, StoryObj } from '@storybook/sveltekit';
import CalendarModal from '$lib/components/modals/CalendarModal.svelte';

const meta: Meta<typeof CalendarModal> = {
    title: 'Components/Modals/CalendarModal',
    component: CalendarModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarModal>;

export const Default: Story = {};
