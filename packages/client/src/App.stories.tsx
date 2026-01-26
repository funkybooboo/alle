import type { Meta, StoryObj } from '@storybook/react';
import App from './App';

const meta: Meta<typeof App> = {
    title: 'App/Main',
    component: App,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof App>;

export const Default: Story = {};

export const Loading: Story = {
    parameters: {
        // Mock server not responding
        mockData: {
            delay: 'infinite',
        },
    },
};

export const ServerOffline: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Displays fallback message when server is not reachable',
            },
        },
    },
};
