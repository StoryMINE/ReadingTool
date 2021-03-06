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
import {autoinject, BindingEngine, Disposable, factory, inject, Factory} from "aurelia-framework";
import {Reading} from "../models/Reading";
import {Story} from "../models/Story";
import {StoryConnector} from "../store/StoryConnector";
import {ReadingConnector} from "../store/ReadingConnector";
import {Page} from "../models/Page";
import {CachedMediaConnector} from "../store/CachedMediaConnector";
import {Subscription} from "../interfaces/Subscription";
import {SynchronisedStateContainer} from "../store/SynchronisedStateContainer";
import {UpdateStatesResponse} from "../interfaces/UpdateStatesResponse";
import {Authenticator} from "../auth/Authenticator";
import {VariableNamespaceResolver} from "../utilities/VariableNamespaceResolver";
import {VariableAccessor} from "../interfaces/VariableAccessor";
import {Role} from "../models/Role";
import {GetUserRole} from "../utilities/RoleManagement";
import {Reader} from "../models/Reader";

//@autoinject()
@inject(LocationManager,
        StoryConnector,
        ReadingConnector,
        BindingEngine,
        CachedMediaConnector,
        Factory.of(Reader),
        Authenticator)
export class ReadingManager {

    story: Story;
    reading: Reading;

    updateInterval: number = 500;

    private variableSub: Subscription;
    private locationSub: Disposable;
    private timeSub: number;

    private stateContainer: SynchronisedStateContainer;

    viewablePages: Array<Page>;

    constructor(private locationManager: LocationManager,
                private storyConnector: StoryConnector,
                private readingConnector: ReadingConnector,
                private bindingEngine: BindingEngine,
                private cachedMediaConnector: CachedMediaConnector,
                private readerFactory: (any?) => Reader,
                public auth: Authenticator) {
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
                this.stateContainer = new SynchronisedStateContainer(this.readingConnector);
                return this.stateContainer.initialize(this.reading.id);
            }).then(() => {
                if (withUpdates) {
                    this.attachListeners();
                    this.updateStatus();
                }

                if(!this.reading.readers.get(this.auth.userId)) {
                    this.reading.readers.save(this.readerFactory({id: this.auth.userId}));
                    this.saveReading();
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
        this.detachListeners();
        this.stateContainer.stopPolling();
    }

    private attachListeners() {
        this.variableSub = this.stateContainer.subscribe(() => { this.updateStatus(); });
        this.locationSub = this.bindingEngine.propertyObserver(this.locationManager, 'location').subscribe(() => this.updateStatus());
        this.timeSub = window.setInterval(() => this.updateStatus(), 5 * 1000);
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

    private getVariableAccessor(): VariableAccessor {
        return new VariableNamespaceResolver(this.stateContainer, this);
    }

    updateStatus() {
        console.log("updating page status");
        this.story.pages.forEach(page => {
            page.updateStatus(this.getVariableAccessor(), this.story.conditions, this.story.locations, this.locationManager.location);
        });

        this.viewablePages = this.story.pages.all.filter(page => page.isViewable);
    }

    private executePageFunctionsImpl(page: Page) {
        page.executeFunctions(this.story, this.reading, this.getVariableAccessor(), this.story.conditions, this.story.locations, this.locationManager.location, this.story.functions)
    }

    executePageFunctionsAndSave(page: Page): Promise<UpdateStatesResponse> {
        //Pause notifications while updating, else we'll get a ton.
        this.stateContainer.pauseNotifications();
        this.executePageFunctionsImpl(page);

        //Attempt to save, handling collisions.
        let pushResult = this.stateContainer.push().catch((result: UpdateStatesResponse) => {
            console.log("COLLISION: Checking for a collision.");
            if(result && result.collision) {
                console.log("COLLISION: Attempting to resolve");
                //Update every page with the new variables before checking if it's readable.
                this.updateStatus();
                if(page.isReadable) {
                    this.executePageFunctionsImpl(page);
                    console.log("COLLISION: Page reapplied.");
                } else {
                    console.log("COLLISION: Page no longer readable, aborting.");
                    return;
                }
            }

            //Attempt a second save, in case:
            //A) We've corrected the error above
            //B)
            return this.stateContainer.push().then((result: UpdateStatesResponse) => {
                    console.log("EXECUTE PAGE FUNCTIONS: Second save succeeded");
                    return Promise.resolve(result);
                },
                (result: UpdateStatesResponse) => {
                    console.error("EXECUTE PAGE FUNCTIONS:: Second save failed.");
                    console.log(result);
                    return Promise.reject(result);
                });
        });

        return pushResult.then(() => {
          this.stateContainer.resumeNotifications();
          return pushResult;
        })
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

    getLocalUserRole(): Role {
        return this.getUserRole(this.auth.userId);
    }

    getUserRole(userId: string): Role {
        return GetUserRole(userId, this.getVariableAccessor(), this.story);
    }
}
