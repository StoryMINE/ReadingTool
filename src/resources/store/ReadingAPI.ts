/**
 * Created by andy on 04/01/17.
 */

import {StoryPlacesAPI} from './StoryplacesAPI';
import {StateScope} from "../models/StateScope";

export class ReadingAPI extends StoryPlacesAPI {

    getAllForStoryAndUser(storyId: String, userId: String): Promise<Response> {
        return this.client.fetch(this._path + "story/" + storyId +"/user/" + userId);
    }

    getStates(readingId: string): Promise<Response> {
        return this.client.fetch(this._path + readingId + "/states")
    }

    saveStates(stateScope: StateScope): Promise<Response> {
        return this.client.fetch(this._path + stateScope.readingId + "/states", {
          method: "PUT",
          body: JSON.stringify(stateScope)
        });
    }
}
