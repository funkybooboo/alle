import type { Meta, StoryObj } from '@storybook/sveltekit';
import SomedayPanel from '$lib/components/SomedayPanel.svelte';

const meta: Meta<typeof SomedayPanel> = {
    title: 'Components/SomedayPanel',
    component: SomedayPanel,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SomedayPanel>;

export const Default: Story = {};

export const Collapsed: Story = {
    parameters: {
        stores: {
            preferencesStore: { someDayPanelCollapsed: true },
        },
    },
};
