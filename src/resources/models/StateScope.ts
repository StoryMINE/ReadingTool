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
import {StateCollection} from "../collections/StateCollection";
import {VariableAccessor} from "../interfaces/VariableAccessor";
import {VariableReference} from "./VariableReference";
import {Variable} from "./Variable";
import {NotifyCallback, Subscribable, Subscription} from "../interfaces/Subscription";
import {CompositeSubscription} from "../utilities/Subscription";

@inject(Factory.of(StateCollection),
        TypeChecker)
export class StateScope extends BaseModel implements VariableAccessor, Subscribable {

  public readingId: string;
  public storyId: string;
  private states: StateCollection;
  public revision: number;

  constructor(private stateCollectionFactory: (any?) => StateCollection,
              typeChecker: TypeChecker,
              data?: any) {
    super(typeChecker);
    this.fromObject(data);
  }

  fromObject(data: any = {states: [], revision: 0}) {
    this.typeChecker.validateAsObjectAndNotArray("StateScope States", data);
    this.readingId = data.readingId;
    this.storyId = data.storyId;
    this.states = this.stateCollectionFactory((data && data.states) || []);
    this.revision = data.revision;
  }

  toJSON() {
    return {
      readingId: this.readingId,
      storyId: this.storyId,
      states: this.states,
      revision: this.revision
    };
  }

  get(varRef: VariableReference): Variable {
    let state = this.states.get(varRef.namespace);
    //It's valid to access a state that hasn't been created - it's an empty state.
    if(!state) { return null; }
    return state.get(varRef);
  }

  save(varRef: VariableReference, value: string) {
    let state = this.states.get(varRef.namespace);
    if(!state) {
      this.states.save({
        id: varRef.namespace,
        variables: [{
          id: varRef.variable,
          value: value
        }]
      })
    } else {
      state.save(varRef, value);
    }
  }

  subscribe(callback: NotifyCallback): Subscription {
    return new CompositeSubscription(callback, this.states.all);
  }
}
