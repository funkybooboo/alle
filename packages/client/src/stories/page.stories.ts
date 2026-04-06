import type { Meta, StoryObj } from '@storybook/sveltekit';
import Page from './+page.svelte';

const meta: Meta<typeof Page> = {
    title: 'App/Main',
    component: Page,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Page>;

export const Default: Story = {};

export const ServerOffline: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Displays fallback message when server is not reachable',
            },
        },
    },
};
