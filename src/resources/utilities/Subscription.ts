
export class SimpleSubscriptionService implements Subscribable {

  private observers: Set<Subscription>;

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

import {NotifyCallback, Subscribable, Subscription} from "../interfaces/Subscription";

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
