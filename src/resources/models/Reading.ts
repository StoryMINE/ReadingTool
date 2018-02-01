/*******************************************************************
 *
 * StoryPlaces
 *
 This application was developed as part of the Leverhulme Trust funded
 StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk
 Copyright (c) 2016
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
import {Factory, inject} from "aurelia-framework";
import {BaseModel} from "./BaseModel";
import {TypeChecker} from "../utilities/TypeChecker";
import {ReaderCollection} from "../collections/ReaderCollection";
import {VariableScope} from "./VariableScope";

@inject(Factory.of(ReaderCollection),
        Factory.of(VariableScope),
        TypeChecker)
export class Reading extends BaseModel {

    private _name: string;
    private _storyId: string;
    private _readers: ReaderCollection;
    private _sharedStates: VariableScope;
    private _state: string;
    private _timestamp: number;

    constructor(private readerCollectionFactory: (any?) => ReaderCollection,
                private variableScopeFactory: (any?) => VariableScope,
                typeChecker: TypeChecker, data?: any) {
        super(typeChecker);
        this.fromObject(data);
    }

    fromObject(data: any = {id: undefined, name:undefined, storyId: undefined, readers: undefined, sharedStates: undefined, state:undefined, timestamp: undefined}) {
        this.typeChecker.validateAsObjectAndNotArray("Data", data);
        this.id = data.id;
        this.name = data.name;
        this.storyId = data.storyId;
        this.readers = this.readerCollectionFactory(data.readers);
        this.sharedStates = this.variableScopeFactory(data.sharedStates);
        this.state = (data.state || "notstarted");
        this.timestamp = data.timestamp;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            storyId: this.storyId,
            readers: this.readers,
            sharedStates: this.sharedStates,
            state: this.state,
            timestamp: this.timestamp,
        }
    }

    get state(): string {
        return this._state;
    }

    set state(value: string) {
        this.typeChecker.validateAsStringOrUndefined('State', value);
        if (value != "closed" && value != "notstarted" && value != "inprogress"){
            throw TypeError("State can only be set to 'closed', 'notstarted' or 'inprogress'.")
        }
        this._state = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this.typeChecker.validateAsStringOrUndefined('Name', value);
        this._name = value;
    }

    get timestamp(): number {
        return this._timestamp;
    }

    set timestamp(value: number) {
        this.typeChecker.validateAsNumberOrUndefined('Time', value);
        this._timestamp = value;
    }

    get storyId(): string {
        return this._storyId;
    }

    set storyId(value: string) {
        this.typeChecker.validateAsStringOrUndefined('StoryId', value);
        this._storyId = value;
    }

    get readers(): ReaderCollection {
        return this._readers;
    }

    set readers(value: ReaderCollection) {
        this.typeChecker.validateAsObjectOrUndefined('Readers', value, "ReaderCollection", ReaderCollection);
        this._readers = value;
    }

    get sharedStates(): VariableScope {
      return this._sharedStates;
    }

    set sharedStates(value: VariableScope) {
      this.typeChecker.validateAsObjectOrUndefined("SharedStates", value, "VariableScope", VariableScope);
      this._sharedStates = value;
    }

}
