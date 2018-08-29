import {NotifyCallback, Subscribable, Subscription} from "../interfaces/Subscription";

export class SimpleSubscriptionService implements Subscribable {

  private observers: Set<Subscription> = new Set();

  subscribe(callback: NotifyCallback): Subscription {
    let disposalCallback = this.unsubscribe.bind(this);
    let subscription = new SimpleSubscription(callback, disposalCallback);
    this.observers.add(subscription);
    return subscription;
  }

  unsubscribe(sub: Subscription) {
    this.observers.delete(sub);
  }

  notify() {
    this.observers.forEach((sub) => sub.notify());
  }
}

export class PausableSubscriptionService extends SimpleSubscriptionService {
  private notificationsPaused: boolean = false;
  private notificationOccurredWhilePaused: boolean = false;

  notify() {
    if(this.notificationsPaused) {
      this.notificationOccurredWhilePaused = true;
    } else {
      super.notify();
    }
  }

  pauseNotifications() {
    this.notificationsPaused = true;
  }

  resumeNotifications() {
    this.notificationsPaused = false;

    if(this.notificationOccurredWhilePaused) {
      super.notify();
      this.notificationOccurredWhilePaused = false;
    }
  }
}


export class SimpleSubscription implements Subscription {
  paused: boolean = false;

  constructor(private callback: NotifyCallback,
              private disposeFunc: (sub: Subscription) => any) {}

  notify() {
    if(!this.paused) {
      this.callback();
    }
  }

  dispose() {
    this.disposeFunc(this);
  }
}

export class CompositeSubscription implements Subscription {
  paused: boolean = false;

  private subscriptions: Array<Subscription>;

  constructor(private callback: NotifyCallback,
              private subscribables: Array<Subscribable>) {
    let proxyCallback = this.notify.bind(this);
    this.subscriptions = subscribables.map(
      (subscribable) => subscribable.subscribe(proxyCallback));
  }

  notify() {
    if(!this.paused) {
      this.callback();
    }
  }

  dispose() {
    this.subscriptions.forEach((sub) => sub.dispose());
  }
}
