import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = { args: { children: 'Button' } }
export const Outline: Story = { args: { children: 'Outline', variant: 'outline' } }
export const Destructive: Story = { args: { children: 'Delete', variant: 'destructive' } }
export const Ghost: Story = { args: { children: 'Ghost', variant: 'ghost' } }
