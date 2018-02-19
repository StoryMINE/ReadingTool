import {AbstractConnector} from "./AbstractConnector";
import {Factory, inject, NewInstance} from 'aurelia-framework';
import {Reading} from "../models/Reading";
import {ReadingAPI} from "./ReadingAPI";

import {ReadingCollection} from "../collections/ReadingCollection";
import {ScopedStates} from "../interfaces/ScopedStates";
import {StateScope} from "../models/StateScope";
import moment = require('moment');

/**
 * Created by andy on 09/12/16.
 */

@inject(ReadingCollection,
        NewInstance.of(ReadingAPI),
        Factory.of(StateScope))
export class ReadingConnector extends AbstractConnector<Reading> {

    constructor(private readingCollection : ReadingCollection,
                private storyplacesAPI: ReadingAPI,
                private stateScopeFactory: (any?) => StateScope) {
        super();
        this.storyplacesAPI.path = "/reading/";
    }

    get all(): Array<Reading> {
        return this.readingCollection.all;
    }

    byId(id: string): Reading {
        return this.readingCollection.get(id);
    }

    byIdOrFetch(id: string): Promise<Reading> {
        return new Promise(complete => {
            if (this.readingCollection.get(id)) {
                complete(this.readingCollection.get(id));
                return;
            }

            complete(this.fetchById(id).then(() => this.readingCollection.get(id)));
        });
    }

    fetchAll(): Promise<Reading[]> {
        return this.storyplacesAPI.getAll()
            .then(readings => readings.json() as any)
            .then(readings => {
                this.readingCollection.saveMany(readings);
                return null;
            });
    }

    fetchById(id: string): Promise<Reading> {
        return this.storyplacesAPI.getOne(id)
            .then(reading => reading.json() as any)
            .then(reading => {
                this.readingCollection.save(reading);
                return null;
            });
    }

    fetchForUserAndStory(userId: string, storyId: string): Promise<void> {
        return this.storyplacesAPI.getAllForStoryAndUser(storyId, userId)
            .then(readings => readings.json() as any)
            .then (readings => {
                this.readingCollection.saveMany(readings);
                return;
            });
    }

    save(object: Reading): Promise<Reading> {
        object.timestamp = moment().unix();
        return this.storyplacesAPI.save(object)
            .then(reading => reading.json())
            .then (reading => {
                this.readingCollection.save(reading);
                return null;
            });
    }

    remove(id: string): Promise<boolean> {
        return new Promise((success) => {
            return success(true);
        });
    }

    byStoryId(storyId: string): Array<Reading> {
        return this.all.filter(reading => reading.storyId == storyId);
    }

    getStates(readingId: string): Promise<ScopedStates> {
        return this.storyplacesAPI.getStates(readingId)
          .then((response) => response.json())
          .then((states: ScopedStates) => {
            return {
              global: this.stateScopeFactory(states.global),
              shared: this.stateScopeFactory(states.shared)
            };
          });
    }
}
