import type { Meta, StoryObj } from '@storybook/sveltekit';
import Modal from '$lib/components/Modal.svelte';

const meta: Meta<typeof Modal> = {
    title: 'Components/Modal',
    component: Modal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
    args: { title: 'Example Modal' },
    render: args => ({
        Component: Modal,
        props: args,
        slot: '<p>This is modal content.</p>',
    }),
};
