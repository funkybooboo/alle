import type { Meta, StoryObj } from '@storybook/sveltekit';
import SettingsModal from '$lib/components/modals/SettingsModal.svelte';

const meta: Meta<typeof SettingsModal> = {
    title: 'Components/Modals/SettingsModal',
    component: SettingsModal,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SettingsModal>;

export const Default: Story = {};

export const DarkTheme: Story = {
    parameters: {
        stores: {
            preferencesStore: { theme: 'dark' },
        },
    },
};
