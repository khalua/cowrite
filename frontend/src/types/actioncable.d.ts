declare module '@rails/actioncable' {
  export interface Consumer {
    subscriptions: Subscriptions;
    connect(): void;
    disconnect(): void;
  }

  export interface Subscriptions {
    create<T>(
      channel: string | { channel: string; [key: string]: unknown },
      mixin?: SubscriptionMixin<T>
    ): Subscription;
  }

  export interface SubscriptionMixin<T = unknown> {
    connected?(): void;
    disconnected?(): void;
    rejected?(): void;
    received?(data: T): void;
  }

  export interface Subscription {
    unsubscribe(): void;
    perform(action: string, data?: Record<string, unknown>): void;
  }

  export function createConsumer(url?: string): Consumer;
}
