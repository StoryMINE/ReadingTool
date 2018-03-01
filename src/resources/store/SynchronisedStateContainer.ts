import {inject, NewInstance} from 'aurelia-framework';
import {VariableAccessor} from "../interfaces/VariableAccessor";
import {NotifyCallback, Subscribable, Subscription} from "../interfaces/Subscription";
import {VariableReference} from "../models/VariableReference";
import {Variable} from "../models/Variable";
import {ReadingConnector} from "./ReadingConnector";
import {StateScope} from "../models/StateScope";
import {CombinedScopes} from "../interfaces/ScopedStates";
import {CompositeSubscription, SimpleSubscriptionService} from "../utilities/Subscription";
import {UpdateStatesResponse} from "../interfaces/UpdateStatesResponse";

/**
 * Contains all of the StoryInstance's state.
 *
 * Synchronises local state with the server, while ensuring
 * all variable accesses are atomic.
 */
@inject(NewInstance.of(ReadingConnector))
export class SynchronisedStateContainer implements VariableAccessor, Subscribable {
  public updateInterval = 500;

  private readingId: string;
  private scopes: CombinedScopes;

  private stateUpdateTimer: number;
  private saveInProgress: Promise<UpdateStatesResponse>;

  private stateChangeSubscription: Subscription;
  private subscriptionService: SimpleSubscriptionService = new SimpleSubscriptionService();

  constructor(private readingConnector: ReadingConnector) {
  }

  initialize(readingId: string): Promise<void> {
    this.readingId = readingId;
    return this.readingConnector.getStates(this.readingId).then((scopes: CombinedScopes) => {
      this.scopes = scopes;
    }).then(() => {
      this.beginPolling();
    })
  }

  beginPolling() {
    this.stateUpdateTimer = window.setInterval(() => {
      if(this.saveInProgress) { return false; }
      this.readingConnector.getStates(this.readingId).then((scopes) => {
        if(this.saveInProgress) { return; }
        this.replaceScopes(scopes);
      });
    }, this.updateInterval);
  }

  replaceScopes(scopes: CombinedScopes) {
    this.stopWatchingStates();
    this.scopes = scopes;
    this.watchStates();
    this.subscriptionService.notify();
  }

  private stopWatchingStates() {
    if (this.stateChangeSubscription) {
      this.stateChangeSubscription.dispose();
    }
  }

  private watchStates() {
    let callback = this.subscriptionService.notify.bind(this.subscriptionService);
    this.stateChangeSubscription =
      new CompositeSubscription(callback, [this.scopes.global, this.scopes.shared])
  }

  private getScope(scopeName: string): StateScope {
    let scope: StateScope = this.scopes[scopeName];
    if(!scope) {
      throw new Error("Story attempts to access invalid variable scope " + scopeName);
    }
    return scope;
  }

  push(): Promise<UpdateStatesResponse> {
    this.saveInProgress = this.readingConnector.saveStates(this.scopes).then((result) => {
      if (result.collision) {
        this.replaceScopes(result.scopes);
        this.saveInProgress = null;
        return Promise.reject(result);
      }
      this.saveInProgress = null;
      return Promise.resolve(result);
    });
    return this.saveInProgress;
  }

  get(varRef: VariableReference): Variable {
    return this.getScope(varRef.scope).get(varRef);
  }

  save(varRef: VariableReference, value: string) {
    return this.getScope(varRef.scope).save(varRef, value);
  }

  subscribe(callback: NotifyCallback): Subscription {
    return this.subscriptionService.subscribe(callback);
  }

}
