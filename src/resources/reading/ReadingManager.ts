/*******************************************************************
 *
 * StoryPlaces
 *
 This application was developed as part of the Leverhulme Trust funded
 StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk
 Copyright (c) 2017
 University of Southampton
 Charlie Hargood, cah07r.ecs.soton.ac.uk
 Kevin Puplett, k.e.puplett.soton.ac.uk
 David Pepper, d.pepper.soton.ac.uk

 All rights reserved.
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * The name of the University of Southampton nor the name of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE ABOVE COPYRIGHT HOLDERS BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import {LocationManager} from "../gps/LocationManager";
import {autoinject, BindingEngine, Disposable} from "aurelia-framework";
import {Reading} from "../models/Reading";
import {Story} from "../models/Story";
import {StoryConnector} from "../store/StoryConnector";
import {ReadingConnector} from "../store/ReadingConnector";
import {Page} from "../models/Page";
import {CachedMediaConnector} from "../store/CachedMediaConnector";
import {CompositeScope} from "../utilities/CompositeScope";
import {Subscription} from "../interfaces/Subscription";
import {StateScope} from "../models/StateScope";
import {ScopedStates} from "../interfaces/ScopedStates";

@autoinject()
export class ReadingManager {

    story: Story;
    reading: Reading;

    updateInterval: number = 500;

    private variableSub: Subscription;
    private locationSub: Disposable;
    private timeSub: number;

    private saving: boolean = false;
    private stateUpdateSub: number;
    private lastPageExecuted: Page;

    private globalStates: StateScope;
    private sharedStates: StateScope;

    viewablePages: Array<Page>;

    constructor(private locationManager: LocationManager, private storyConnector: StoryConnector, private readingConnector: ReadingConnector, private bindingEngine: BindingEngine, private cachedMediaConnector: CachedMediaConnector) {
    }

    attach(storyId: string, readingId: string, withUpdates: boolean = true) {
        return this.storyConnector.byIdOrFetch(storyId)
            .then((story) => {
                this.story = story;
            })
            .then(() => {
                return this.readingConnector.byIdOrFetch(readingId)
                    .then((reading) => {
                        this.reading = reading;
                    });
            }).then(() => {
                return this.readingConnector.getStates(this.reading.id).then((states) => {
                  this.globalStates = states.global;
                  this.sharedStates = states.shared;
                });
            }).then(() => {
                if (withUpdates) {
                    this.attachListeners();
                    this.updateStatus();
                    this.beginUpdatePolling();
                }
                // Start the reading if it has not already been started.
                if (this.reading.state == "notstarted") {
                    this.startReading();
                }
                this.cachedMediaConnector.fetchForStory(this.story);
            });
    }

    detach() {
        this.reading = undefined;
        this.story = undefined;
        this.stopUpdatePolling();
        this.detachListeners();
    }

    private attachListeners() {
        this.variableSub = this.getVariableAccessor().subscribe(() => this.updateStatus());
        this.locationSub = this.bindingEngine.propertyObserver(this.locationManager, 'location').subscribe(() => this.updateStatus());
        this.timeSub = window.setInterval(() => this.updateStatus(), 60 * 1000);
    }

    private detachListeners() {
        if (this.variableSub) {
            this.variableSub.dispose();
            this.variableSub = undefined;
        }

        if (this.locationSub) {
            this.locationSub.dispose();
            this.locationSub = undefined;
        }

        if (this.timeSub) {
            clearInterval(this.timeSub);
            this.timeSub = undefined;
        }
    }

    private getVariableAccessor(): CompositeScope {
        return new CompositeScope({global: this.globalStates, shared: this.sharedStates})
    }

    private updateStatus() {
        console.log("updating page status");
        this.story.pages.forEach(page => {
            page.updateStatus(this.getVariableAccessor(), this.story.conditions, this.story.locations, this.locationManager.location);
        });

        this.viewablePages = this.story.pages.all.filter(page => page.isViewable);
    }

    executePageFunctions(page: Page) {
        if(this.saving) { return false; }
        this.lastPageExecuted = page;
        page.executeFunctions(this.story.id, this.reading.id, this.getVariableAccessor(), this.story.conditions, this.story.locations, this.locationManager.location, this.story.functions);
        this.saveState();
    }

    saveReading() {
        this.readingConnector.save(this.reading);
    }

    startReading() {
        this.reading.state = "inprogress";
        this.saveReading();
    }

    closeReading() {
        this.reading.state = "closed";
        this.saveReading();
    }

    saveState() {
      this.saving = true;
      console.log("Saving");
      this.readingConnector.saveStates(this.sharedStates).then((result) => {
        if(result.collision) {
          //Set states on Reading Manager
          this.replaceScopes(result.scopes);
          //Rerun functions.
          //Re-attempt post.
          this.executePageFunctions(this.lastPageExecuted);
        }
      }).then(() => this.saving = false, () => this.saving = false);
    }

    private replaceScopes(states: ScopedStates) {
      this.detachListeners();
      this.globalStates = states.global;
      this.sharedStates = states.shared;
      this.attachListeners();
      this.variableSub.notify();
    }

    private beginUpdatePolling() {
      this.stateUpdateSub = window.setInterval(() => {
        if(this.saving) { return false; }
        this.readingConnector.getStates(this.reading.id).then((scopes) => {
          if(this.saving) { return; }
          this.replaceScopes(scopes);
        });
      }, this.updateInterval);
    }

    private stopUpdatePolling() {
      window.clearInterval(this.stateUpdateSub);
    }
}
