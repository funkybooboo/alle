import type { Meta, StoryObj } from '@storybook/sveltekit';
import BottomBar from '$lib/components/BottomBar.svelte';

const meta: Meta<typeof BottomBar> = {
    title: 'Components/BottomBar',
    component: BottomBar,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BottomBar>;

export const Default: Story = {};

export const WithFilters: Story = {
    parameters: {
        stores: {
            preferencesStore: {
                activeFilters: {
                    tags: ['work', 'p1'],
                    showCompleted: false,
                },
            },
        },
    },
};

export const ScrolledFromToday: Story = {
    parameters: {
        stores: {
            uiStore: { todayVisible: false },
        },
    },
};
