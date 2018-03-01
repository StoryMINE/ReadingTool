/**
 * Created by andy on 04/01/17.
 */

import {StoryPlacesAPI} from './StoryplacesAPI';
import {UpdateStatesResponse} from "../interfaces/UpdateStatesResponse";
import {CombinedScopes} from "../interfaces/ScopedStates";

export class ReadingAPI extends StoryPlacesAPI {

    getAllForStoryAndUser(storyId: String, userId: String): Promise<Response> {
        return this.client.fetch(this._path + "story/" + storyId +"/user/" + userId);
    }

    getStates(readingId: string): Promise<Response> {
        return this.client.fetch(this._path + readingId + "/states")
    }

    saveStates(scopes: CombinedScopes): Promise<UpdateStatesResponse> {
        return this.client.fetch(this._path + scopes.shared.readingId + "/states", {
          method: "PUT",
          body: JSON.stringify(scopes)
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
