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

import com.metreeca._tile.client.js.JSArray;

import com.google.gwt.core.client.JavaScriptObject;

import static com.metreeca._tile.client.Agent.Agent;
import static com.metreeca._tile.client.Tile.$;


public abstract class Event extends JavaScriptObject {

	public static final int WheelClick=100;


	private static interface Resources { // !!! ;(gwt) broken static constants on overlays

		public static final Agent Agent=Agent();

		public static final JavaScriptObject Keys=Agent.keys();

	}


	private static native String cmdKey() /*-{
		return /^Mac[A-Z]/.test($wnd.navigator.platform) ? "META" : "CTRL";
	}-*/;


	protected Event() {}


	public final Event stop() {
		return stop(false);
	}

	public final native Event stop(final boolean immediate) /*-{
		try {
			return this;
		} finally {
			if ( immediate ) {
				this.stopImmediatePropagation && this.stopImmediatePropagation(); // handle fake events
			} else {
				this.stopPropagation && this.stopPropagation(); // handle fake events
			}
		}
	}-*/;


	public final native boolean cancel() /*-{
		try {
			return !this.defaultPrevented; // true if actually cancelling
		} finally {
			this.preventDefault && this.preventDefault() || (this.defaultPrevented=true); // handle fake events
		}
	}-*/;

	public final native boolean cancelled() /*-{
		return this.defaultPrevented;
	}-*/;


	public final native Tile at() /*-{

		var element=$doc.elementFromPoint(this.clientX, this.clientY); // !!! merge with Agent

		return element && [element] || []
	}-*/;


	public final native Tile target() /*-{

		var target=this.target;

		return target && [
			target.nodeType === Node.ELEMENT_NODE || !target.parentNode ? target : target.parentNode
		] || [];

	}-*/;

	public final native Tile related() /*-{

		var related=this.relatedTarget;

		return related && [
			related.nodeType === Node.ELEMENT_NODE || !related.parentNode ? related : related.parentNode
		] || [];
	}-*/;

	public final native Tile current() /*-{

		var current=this.currentTarget || this.target;

		return current && [
			current.nodeType === Node.ELEMENT_NODE || !current.parentNode ? current : current.parentNode
		] || [];

	}-*/;

	public final native Tile path() /*-{

		var path=[];

		var lower=this.target;
		var upper=this.currentTarget;

		for (var node=lower; node !== upper; node=node.parentNode) {
			if ( node.nodeType === Node.ELEMENT_NODE ) { path.push(node); }
		}

		return path;

	}-*/;


	public final native String type() /*-{
		return this.type;
	}-*/;

	public final native double time() /*-{ // ;( jsni methods can't return long // !!! review
		return this.timeStamp || Date.now(); // ;(firefox) some event don't have a timestamp
	}-*/;


	public final native boolean capturing() /*-{
		return this.eventPhase == 1;
	}-*/;

	public final native boolean targeting() /*-{
		return this.eventPhase == 2 || this.eventPhase === undefined; // handle fake events
	}-*/;

	public final native boolean bubbling() /*-{
		return this.eventPhase == 3;
	}-*/;


	public final native String value() /*-{
		return this.value || "";
	}-*/;


	public final native int key() /*-{
		return this.keyCode || this.charCode || 0;
	}-*/;

	public final boolean key(final String... patterns) {

		if ( patterns != null ) {
			for (final String pattern : patterns) {
				if ( key(pattern) ) { return true; }
			}
		}

		return false;
	}

	public final native boolean key(final String pattern) /*-{

		var keys=$wnd.$keyCodes || ($wnd.$keyCodes=@com.metreeca._tile.client.Event.Resources::Keys);
		var tests=$wnd.$keyTests || ($wnd.$keyTests={});

		function test(pattern) {

			var tokens=(pattern || "").toUpperCase().split(/[-\s]+/);

			while ( tokens.length > 1 ) {
				tokens[tokens.shift()]=true;
			}

			tokens[@com.metreeca._tile.client.Event::cmdKey()()]|=tokens.CMD;

			var key=tokens[0] || "";
			var code=keys[key] || Number(key) || key.length == 1 && key.charCodeAt(0) || 0;

			// !!! refactor

			return function (event) { // noinspection OverlyComplexBooleanExpressionJS
				return (tokens.ANY || !(
								event.altKey^tokens.ALT
								|| event.shiftKey^tokens.SHIFT
								|| event.ctrlKey^tokens.CTRL
								|| event.metaKey^tokens.META)
				) && (event.keyCode || event.charCode) === code; // !!! char/key support
			};
		}

		return (tests[pattern] || (tests[pattern]=test(pattern)))(this);
	}-*/;


	public final native char character() /*-{
		return this.charCode || 0; // !!! char support
	}-*/;

	public final native boolean character(final char c) /*-{
		return this.charCode === c; // !!! char support
	}-*/;


	public final native boolean alt() /*-{
		return this.altKey || false;
	}-*/;

	public final native boolean shift() /*-{
		return this.shiftKey || false;
	}-*/;

	public final native boolean ctrl() /*-{
		return this.ctrlKey || false;
	}-*/;

	public final native boolean meta() /*-{
		return this.metaKey || false;
	}-*/;

	public final native boolean cmd() /*-{
		return this[$wnd.$cmdKey || ($wnd.$cmdKey=@com.metreeca._tile.client.Event::cmdKey()().toLowerCase()+"Key")] || false;
	}-*/;


	public final native int button() /*-{
		return this.button || 0;
	}-*/;

	public final boolean button(final String... patterns) {

		if ( patterns != null ) {
			for (final String pattern : patterns) {
				if ( button(pattern) ) { return true; }
			}
		}

		return false;
	}

	public final native boolean button(final String pattern) /*-{

		var buttons=$wnd.buttonCodes || ($wnd.buttonCodes={
			LEFT: 0,
			MIDDLE: 1,
			RIGHT: 2
		});

		var tests=$wnd.$buttonTests || ($wnd.$buttonTests={});

		function test(pattern) {

			var tokens=(pattern || "").toUpperCase().split(/[-\s]+/);

			while ( tokens.length > 1 ) {
				tokens[tokens.shift()]=true;
			}

			tokens[@com.metreeca._tile.client.Event::cmdKey()()]|=tokens.CMD;

			var button=tokens[0] || "";
			var code=buttons[button] || Number(button) || 0;

			// !!! refactor

			return function (event) { // noinspection OverlyComplexBooleanExpressionJS
				return (tokens.ANY || !(
								event.altKey^tokens.ALT
								|| event.shiftKey^tokens.SHIFT
								|| event.ctrlKey^tokens.CTRL
								|| event.metaKey^tokens.META)
				) && (event.button) === code;
			};
		}

		return (tests[pattern] || (tests[pattern]=test(pattern)))(this);
	}-*/;


	public final boolean wheel(final String... patterns) {

		if ( patterns != null ) {
			for (final String pattern : patterns) {
				if ( wheel(pattern) ) { return true; }
			}
		}

		return false;
	}

	public final native boolean wheel(final String pattern) /*-{

		var tests=$wnd.$wheelTests || ($wnd.$wheelTests={});

		function test(pattern) {

			var tokens=(pattern || "").toUpperCase().split(/[-\s]+/);

			while ( tokens.length > 0 ) {
				tokens[tokens.shift()]=true;
			}

			tokens[@com.metreeca._tile.client.Event::cmdKey()()]|=tokens.CMD;

			// !!! refactor

			return function (event) { // noinspection OverlyComplexBooleanExpressionJS
				return (tokens.ANY || !(
								event.altKey^tokens.ALT
								|| event.shiftKey^tokens.SHIFT
								|| event.ctrlKey^tokens.CTRL
								|| event.metaKey^tokens.META)
				);
			};
		}

		return (tests[pattern] || (tests[pattern]=test(pattern)))(this);
	}-*/;


	/**
	 * Retrieves the horizontal coordinate of this event wrt to its current target.
	 *
	 * @return the horizontal offset coordinate of tis event wrt its current target
	 */
	public final int x() { return x(null); }

	/**
	 * Retrieves the vertical coordinate of this event wrt to its current target.
	 *
	 * @return the vertical offset coordinate of tis event wrt its current target
	 */
	public final int y() { return y(null); }


	public final int x(final boolean absolute) {
		return Resources.Agent.x(this, absolute ? $() : null);
	}

	public final int y(final boolean absolute) {
		return Resources.Agent.y(this, absolute ? $() : null);
	}


	public final int x(final Tile tile) {
		return Resources.Agent.x(this, tile);
	}

	public final int y(final Tile tile) {
		return Resources.Agent.y(this, tile);
	}


	public final native int dx() /*-{
		return this.wheelDeltaX
				|| this.axis === this.HORIZONTAL_AXIS && -(@com.metreeca._tile.client.Event::WheelClick)*this.detail  // !!! ;(ff) review after DOM level 3 are implemented
				|| 0;
	}-*/;

	public final native int dy() /*-{
		return this.wheelDeltaY
				|| this.axis === this.VERTICAL_AXIS && -(@com.metreeca._tile.client.Event::WheelClick)*this.detail  // !!! ;(ff) review after DOM level 3 are implemented
				|| 0;
	}-*/;


	//// Event Data ////////////////////////////////////////////////////////////////////////////////////////////////////

	public final native <T> T data() /*-{
		return this.detail // custom data (see Tile.fire())
				|| this.data; // postMessage data
	}-*/;

	public final native String origin() /*-{
		return this.origin // postMessage origin
				|| "";
	}-*/;


	//// DND protocol //////////////////////////////////////////////////////////////////////////////////////////////////

	// For drag, dragenter, dragleave, dragover and dragend events the drag data store mode is in protected mode: the
	// formats and kinds in the drag data store list of items representing dragged data can be enumerated, but the data
	// itself is unavailable and no new data can be added.

	// Internal types (starting with "$") are made available in protected mode through a global variable ;-(

	public final native boolean mime(final String type) /*-{

		if ( type.charAt(0) === "$" ) { // internal type: see comment above

			return $wnd.$dnd && $wnd.$dnd[type];

		} else if ( this.dataTransfer && this.dataTransfer.types ) { // ;(safari) null types on dragstart

			var types=this.dataTransfer.types;

			return types.contains && types.contains(type) // (html5) types is a StringList
					|| types.indexOf && types.indexOf(type) >= 0; // ;(chrome) types is an Array

		} else {

			return false;

		}

	}-*/;

	public final native String data(final String type) /*-{

		if ( type.charAt(0) === "$" ) { // internal type: see comment above

			return $wnd.$dnd && $wnd.$dnd[type] || "";

		} else if ( this.dataTransfer ) {

			return this.dataTransfer.getData(type) || "";

		} else {

			return "";

		}

	}-*/;

	public final native Event data(final String type, final String data) /*-{

		if ( type.charAt(0) === "$" ) { // internal type: see comment above

			if ( !$wnd.$dnd ) {
				$wnd.addEventListener("dragend", $wnd.$dnd=function (e) {
					try { $wnd.removeEventListener("dragend", $wnd.$dnd); } finally { delete $wnd.$dnd }
				});
			}

			if ( data ) {
				$wnd.$dnd[type]=data;
				this.dataTransfer.setData("URL", data); // ;(ff) won't drag with no data / ;(ie) no support for custom types
			} else {
				delete $wnd.$dnd[type];
				// this.dataTransfer.clearData(type); // ;(ie) no support for custom types
			}

		} else if ( this.dataTransfer ) {

			if ( data ) {
				this.dataTransfer.setData(type, data);
			} else {
				this.dataTransfer.clearData(type);
			}

		}

		return this;

	}-*/;


	public final <T extends View> T data(final Class<T> type) {

		if ( type == null ) {
			throw new NullPointerException("null type");
		}

		return $(data("$"+type.getName())).get(type.getName(), null);
	}

	public final <T extends View> Event data(final Class<T> type, final T data) {

		if ( type == null ) {
			throw new NullPointerException("null type");
		}

		if ( data == null ) {
			throw new NullPointerException("null data");
		}

		return data("$"+type.getName(), "#"+$(data).id());
	}


	public final native String mode() /*-{
		return this.dataTransfer && (this.dataTransfer.dropEffect || "none");
	}-*/;

	public final native Event mode(final String pattern) /*-{

		if ( this.dataTransfer ) {

			var tokens=pattern && pattern.match(/[A-Z]+[a-z]*|[a-z]+/g) || [];

			var index=0;

			for (var i=0; i < tokens.length; ++i) {
				switch ( tokens[i].toLowerCase() ) {

					case 'copy':

						index|=4;
						break;

					case 'move':

						index|=2;
						break;

					case 'link':

						index|=1;
						break;

					case 'any':
					case 'all':
					case 'uninitialized':

						index|=7;
						break;

					default:

						break;
				}
			}

			var mode=["none", "link", "move", "linkMove", "copy", "copyLink", "copyMove", "all"][index];

			// ;(ie) effectAllowed causes exception on file drop (connect.microsoft.com/IE/feedback/details/811625/)

			if ( !this.dataTransfer.types // ;(safari) types null on dragstart
					|| Array.prototype.indexOf.call(this.dataTransfer.types, "Files") < 0 ) { // ;(chrome) types is an Array
				this.dataTransfer.effectAllowed=mode;
			}

			if ( this.type === 'dragstart' && mode === 'none' // no mode set > reject drag
					|| this.type !== 'dragstart' && mode !== 'none' ) { // mode set > accept drop
				this.preventDefault();
			}

		}

		return this;

	}-*/;


	public final Event image(final Tile tile) {
		return image(tile, tile != null ? tile.width()/2 : 0, tile != null ? tile.height()/2 : 0);
	}

	public final native Event image(final Tile tile, final float fx, final float fy) /*-{

		// null >> default
		// empty >> none
		// otherwise >> first element

		if ( !$wnd.$image ) {
			$wnd.$image=new Image(); // ;(wk) empty images won't work on chrome
			$wnd.$image.src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
		}

		if ( this.dataTransfer ) {
			this.dataTransfer.setDragImage(tile && (tile[0] || $wnd.$image), fx, fy)
		}

		return this;
	}-*/;


	//// Files //////////////////////////////////////////////////////////////////////////////////////////////////////////

	public final native JSArray<File> files() /*-{
		return this.dataTransfer && this.dataTransfer.files || [];
	}-*/;


	//// Generic Properties ////////////////////////////////////////////////////////////////////////////////////////////

	public final native <T> T property(final String name) /*-{
		return this[name || ''];
	}-*/;

}
