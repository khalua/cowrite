import { createConsumer, type Consumer, type Subscription } from '@rails/actioncable';

let consumer: Consumer | null = null;

export function getConsumer(): Consumer | null {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  if (!consumer) {
    // In development, connect to Rails server on port 3001
    // In production, use relative URL
    const wsUrl = import.meta.env.DEV
      ? `ws://localhost:3001/cable?token=${token}`
      : `/cable?token=${token}`;

    consumer = createConsumer(wsUrl);
  }

  return consumer;
}

export function disconnectConsumer(): void {
  if (consumer) {
    consumer.disconnect();
    consumer = null;
  }
}

export interface ContributionData {
  id: number;
  story_id: number;
  user_id: number;
  content: string;
  word_count: number;
  position: number;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface StoryChannelCallbacks {
  onNewContribution: (contribution: ContributionData) => void;
  onContributionUpdated?: (contribution: ContributionData) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onRejected?: () => void;
}

interface StoryChannelMessage {
  type: string;
  contribution: ContributionData;
}

export function subscribeToStory(
  storyId: number,
  callbacks: StoryChannelCallbacks
): Subscription | null {
  const cable = getConsumer();
  if (!cable) return null;

  return cable.subscriptions.create<StoryChannelMessage>(
    { channel: 'StoryChannel', story_id: storyId },
    {
      connected() {
        console.log(`Connected to story ${storyId}`);
        callbacks.onConnected?.();
      },
      disconnected() {
        console.log(`Disconnected from story ${storyId}`);
        callbacks.onDisconnected?.();
      },
      rejected() {
        console.log(`Rejected from story ${storyId}`);
        callbacks.onRejected?.();
      },
      received(data: StoryChannelMessage) {
        if (data.type === 'new_contribution') {
          callbacks.onNewContribution(data.contribution);
        } else if (data.type === 'contribution_updated') {
          callbacks.onContributionUpdated?.(data.contribution);
        }
      },
    }
  );
}

export function unsubscribe(subscription: Subscription | null): void {
  if (subscription) {
    subscription.unsubscribe();
  }
}

export type { Subscription };
