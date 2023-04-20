/*
 * Copyright © 2020-2022 Metreeca srl
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

package tile.dnd;

public abstract class Drop extends Action<Event> {

		@Override public final native void execute(final Event e) /*-{

			var drop=e.currentTarget.$drop || (e.currentTarget.$drop={});

			if ( e.type === "dragenter" ) {

				try {

					if ( !drop.target ) { // first dragenter event

						this.@com.metreeca._tile.client.Action.Drop::dragenter(Lcom/metreeca/_tile/client/Event;)(e);

					} else { // ignore events on children and replay the first response

						if ( drop.defaultPrevented ) { e.preventDefault(); }

						e.dataTransfer.dropEffect=drop.dropEffect;

						// ;(ie) effectAllowed causes exception on file drop (connect.microsoft.com/IE/feedback/details/811625/)

						if ( Array.prototype.indexOf.call(e.dataTransfer.types, "Files") < 0 ) { // ;(chrome) types is an Array
							e.dataTransfer.effectAllowed=drop.effectAllowed;
						}

					}

				} finally {

					if ( !drop.target ) { // memo response on first dragenter event

						drop.defaultPrevented=e.defaultPrevented;
						drop.dropEffect=e.dataTransfer.dropEffect;

						// ;(ie) effectAllowed causes exception on file drop (connect.microsoft.com/IE/feedback/details/811625/)

						if ( Array.prototype.indexOf.call(e.dataTransfer.types, "Files") < 0 ) { // ;(chrome) types is an Array
							drop.effectAllowed=e.dataTransfer.effectAllowed;
						}

					}

					drop.target=e.target; // keep track of the last dragenter target

					if ( drop.defaultPrevented ) { // accepted drop
						e.currentTarget.classList.add("dropping");
					} else {
						e.currentTarget.classList.remove("dropping"); // ;(ie) toggle(property, boolean) not supported
					}

				}

			} else if ( e.type === "dragover" ) {

				try {

					this.@com.metreeca._tile.client.Action.Drop::dragover(Lcom/metreeca/_tile/client/Event;)(e);

				} finally {

					if ( e.defaultPrevented ) { // accepted drop
						e.currentTarget.classList.add("dropping");
					} else {
						e.currentTarget.classList.remove("dropping"); // ;(ie) toggle(property, boolean) not supported
					}

				}

			} else if ( e.type === "dragleave" ) {

				if ( drop.target === e.target ) { // real dragleave event: otherwise ignore events on children
					try {

						this.@com.metreeca._tile.client.Action.Drop::dragleave(Lcom/metreeca/_tile/client/Event;)(e);

					} finally {

						e.currentTarget.classList.remove("dropping");

						delete e.currentTarget.$drop;

					}
				}

			} else if ( e.type === "drop" ) {

				try {

					this.@com.metreeca._tile.client.Action.Drop::drop(Lcom/metreeca/_tile/client/Event;)(e);

				} finally {

					e.currentTarget.classList.remove("dropping");

					delete e.currentTarget.$drop;

				}

			}
		}-*/;


		protected void dragenter(final Event e) {}

		protected void dragover(final Event e) {}

		protected void dragleave(final Event e) {}

		protected void drop(final Event e) {}

	}