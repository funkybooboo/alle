import type { Meta, StoryObj } from '@storybook/sveltekit';
import IconRail from '$lib/components/IconRail.svelte';

const meta: Meta<typeof IconRail> = {
    title: 'Components/IconRail',
    component: IconRail,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IconRail>;

export const Default: Story = {};

export const SearchActive: Story = {
    parameters: {
        stores: {
            uiStore: { activeModal: 'search' },
        },
    },
};
