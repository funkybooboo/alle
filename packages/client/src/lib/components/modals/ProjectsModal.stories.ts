import type { Meta, StoryObj } from '@storybook/sveltekit';
import ProjectsModal from '$lib/components/modals/ProjectsModal.svelte';

const meta: Meta<typeof ProjectsModal> = {
    title: 'Components/Modals/ProjectsModal',
    component: ProjectsModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectsModal>;

export const Default: Story = {};
