import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavbarIcon } from './NavbarIcon';

const meta = {
  title: 'Components/Navbar/NavbarIcon',
  component: NavbarIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    iconName: {
      control: 'text',
      description: 'Material Symbols icon name',
    },
    isOpen: {
      control: 'boolean',
      description: 'Whether the associated panel is open',
    },
    handleClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
    handleKeyDown: {
      action: 'keydown',
      description: 'Keyboard event handler',
    },
  },
} satisfies Meta<typeof NavbarIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    iconName: 'search',
    isOpen: false,
    handleClick: () => console.log('Icon clicked'),
    handleKeyDown: () => console.log('Key pressed'),
  },
};

export const Search: Story = {
  args: {
    iconName: 'search',
    isOpen: false,
    handleClick: () => {},
    handleKeyDown: () => {},
  },
};

export const Calendar: Story = {
  args: {
    iconName: 'calendar_today',
    isOpen: false,
    handleClick: () => {},
    handleKeyDown: () => {},
  },
};

export const ArrowLeft: Story = {
  args: {
    iconName: 'keyboard_arrow_left',
    isOpen: false,
    handleClick: () => {},
    handleKeyDown: () => {},
  },
};

export const ArrowRight: Story = {
  args: {
    iconName: 'keyboard_arrow_right',
    isOpen: false,
    handleClick: () => {},
    handleKeyDown: () => {},
  },
};

export const DoubleArrowLeft: Story = {
  args: {
    iconName: 'keyboard_double_arrow_left',
    isOpen: false,
    handleClick: () => {},
    handleKeyDown: () => {},
  },
};

export const DoubleArrowRight: Story = {
  args: {
    iconName: 'keyboard_double_arrow_right',
    isOpen: false,
    handleClick: () => {},
    handleKeyDown: () => {},
  },
};

export const WithOpenState: Story = {
  args: {
    iconName: 'search',
    isOpen: true,
    handleClick: () => {},
    handleKeyDown: () => {},
  },
};
