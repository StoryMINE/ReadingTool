/**
 * Created by andy on 04/01/17.
 */

import {StoryPlacesAPI} from './StoryplacesAPI';
import {StateScope} from "../models/StateScope";
import {UpdateStatesResponse} from "../interfaces/UpdateStatesResponse";

export class ReadingAPI extends StoryPlacesAPI {

    getAllForStoryAndUser(storyId: String, userId: String): Promise<Response> {
        return this.client.fetch(this._path + "story/" + storyId +"/user/" + userId);
    }

    getStates(readingId: string): Promise<Response> {
        return this.client.fetch(this._path + readingId + "/states")
    }

    saveStates(stateScope: StateScope): Promise<UpdateStatesResponse> {
        return this.client.fetch(this._path + stateScope.readingId + "/states", {
          method: "PUT",
          body: JSON.stringify(stateScope)
        }).then((response) => {
          return response.json()
        }).then((data) => {
          return new Promise<UpdateStatesResponse>((resolve, reject) => {
            if(!data || data.scopes == null) {
              return reject(null);
            }
            return resolve(data);
          });
        });
    }
}
