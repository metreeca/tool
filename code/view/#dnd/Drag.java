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

public abstract class Drag extends Action<Event> {

    private static final int HoldOnset=300; // hold onset [ms]


    private boolean active;
    private boolean holding;

    private Event first; // the dragstart event
    private Event last; // the last dragstart/drag event


    private final Action<Event> grabbed=new Action<Event>() {
        @Override public void execute(final Event e) {
            e.current().is("holding", holding=true);
        }
    };


    private boolean active() {
        return active;
    }

    private boolean active(final boolean active) {
        return this.active=active;
    }


    protected final boolean holding() {
        return holding;
    }

    protected final Event first() {
        return first != null ? first : (first=(Event)JavaScriptObject.createObject());
    }

    protected final Event last() {
        return last != null ? last : (last=(Event)JavaScriptObject.createObject());
    }


    @Override public final void execute(final Event e) {
        if ( e.type().equals("mousedown") ) {

            e.stop().current().delay(HoldOnset, grabbed); // ignore nested drag sources

        } else if ( e.type().equals("mouseup") || e.type().equals("mouseout") ) {

            e.current().cancel(grabbed).is("holding", holding=false);

        } else if ( e.targeting() ) { // ignore nested drag sources

            if ( e.type().equals("dragstart") ) {

                e.current().cancel(grabbed);

                try {
                    dragstart(first=last=e);
                } finally {
                    if ( active(!e.cancelled()) ) { // accepted drag
                        e.target().is("dragging", true);
                    } else { // rejected drag
                        e.current().is("holding", holding=false);
                    }
                }

            } else if ( e.type().equals("drag") ) {

                try {
                    if ( active() ) { drag(e); }
                } finally {
                    last=e;
                }

            } else if ( e.type().equals("dragend") ) {

                try {
                    if ( active() ) { dragend(e); }
                } finally {
                    holding=false;
                    first=null;
                    last=null;
                    e.target().is("holding dragging", false);
                    active(true);
                }

            }

        }
    }


    protected void dragstart(final Event e) {}

    protected void drag(final Event e) {}

    protected void dragend(final Event e) {}

}
