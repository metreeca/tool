/*
 * Copyright © 2020-2023 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Tile } from "@metreeca/tile/index";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Locates a command executor.
 *
 * @param tile the target tile
 *
 * @returns the the nearest command executor registered with a parent of the target `tile`
 * or a fallback global command executor, if none is found
 */
export default function executor(tile: Tile): Executor;

/**
 * Registers a comamnd executor.
 *
 * @param tile the target tile
 * @param opts the options for the new command executor
 *
 * @returns a new comamnd executor registered with the target `tile`
 */
export default function executor(tile: Tile, opts: Partial<typeof Options>): Executor;

export default function executor(tile: Tile, opts?: Partial<typeof Options>) {
	return opts

		? tile.set("tile$executor", tile => new Executor(tile, { ...Options, ...opts }))

		: Object.create(tile.get("tile$executor", tile => new Executor(tile, Options)), {

			exec: {

				get: () => function (this: any, name: string, task: (() => void) | Task) {

					Object.getPrototypeOf(this).exec(name, task instanceof Function ? {

						exec: task.bind(tile),
						undo: undo(tile),
						redo: task.bind(tile)

					} : {

						exec: task.exec.bind(tile),
						undo: task.undo?.bind(tile) || undo(tile),
						redo: task.redo?.bind(tile) || task.exec.bind(tile)

					});

					function undo(tile: Tile): () => void {

						const memo:{ [property: string]: any}={};

						const descriptors: { [property: string]: PropertyDescriptor }
							=(<any>Object).getOwnPropertyDescriptors((<any>tile).constructor.prototype);

						for (const property in descriptors) {
							if ( descriptors[property].set ) {
								memo[property]=(<any>tile)[property]
							}
						}

						return () => Object.assign(tile, memo);

					}

				}

			}

		});
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Executable task.
 */
export interface Task {

	/**
	 * Execute this task.
	 */
	readonly exec: () => void;

	/**
	 * Undo this task.
	 */
	readonly undo?: () => void;

	/**
	 * Redo this task.
	 */
	readonly redo?: () => void;

}

/**
 * Executor options.
 */
export const Options={

	/**
	 * The maximum depth of undo/redo stacks; must be greater than or equal to 0; 0 for no depth limit.
	 */
	limit: 0 as number

} as const;


/**
 * Task executor.
 *
 * Manages task executing and undo/redo stacks.
 */
export class Executor {

	private _undo: ({ name: string } & Task)[]=[];
	private _redo: ({ name: string } & Task)[]=[];


	constructor(public readonly tile: Tile, public readonly opts: typeof Options) {}


	get undoable() { return this._undo.length > 0 && this._undo[this._undo.length-1].name || ""; }

	get redoable() { return this._redo.length > 0 && this._redo[this._redo.length-1].name || ""; }


	/**
	 * Executes a task.
	 *
	 * @param name  the human-readable name of the task to be executed; will be returned by {@link undoable()} and
	 *              {@link redoable()} when the task is on top of the undo/redo stack
	 * @param task the task to be executed
	 *
	 */
	exec(name: string, task: () => void): void;

	/**
	 * Executes a possibly un/redoable task.
	 *
	 * @param name  the human-readable name of the task to be executed; will be returned by {@link undoable()} and
	 *              {@link redoable()} when the task is on top of the undo/redo stack
	 * @param task the task to be executed
	 *
	 */
	exec(name: string, task: Task): void;

	public exec(name: string, task: (() => void) | Task) {

		if ( task instanceof Function ) {

			this.exec(name, { exec: task });

		} else {

			if ( this._undo.push({ name, ...task }) > this.opts.limit && this.opts.limit > 0 ) { this._undo.shift(); }

			this._redo=[];

			this.tile.requestUpdate().then(() => task.exec());

		}

	}


	undo() {

		const task=this._undo.pop();

		if ( task ) {

			this._redo.push(task);

			this.tile.requestUpdate().then(() => task.undo?.());

		}
	}

	redo() {

		const task=this._redo.pop();

		if ( task ) {

			this._undo.push(task);

			this.tile.requestUpdate().then(() => task.redo?.());

		}
	}

}

