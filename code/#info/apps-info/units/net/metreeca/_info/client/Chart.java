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

package net.metreeca._info.client;

import net.metreeca._info.shared.Series;
import net.metreeca.tile.client.View;

import com.google.gwt.core.client.GWT;
import com.google.gwt.core.client.JavaScriptObject;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;


public class Chart extends View {

	public static Data data() {
		return Data.create();
	}


	private static final Resources resources=GWT.create(Resources.class);


	public static interface Resources extends ClientBundle {

		@Source("Chart.css") TextResource skin();

	}


	public Chart() {
		root("<div/>").skin(resources.skin().getText());
	}


	public static final class Data extends JavaScriptObject implements Series {

		protected Data() {}


		public static Data create() {
			return (Data)createArray();
		}


		@Override public native int length() /*-{
			return this.length;
		}-*/;


		@Override public native String string(final int index) /*-{
			return this[index] !== undefined ? String(this[index]) : "";
		}-*/;

		@Override public native float number(final int index) /*-{
			return Number(this[index]);
		}-*/;

		@Override public long time(final int index) {
			try {
				return Long.parseLong(string(index)); // !!! parse ISO timestamps
			} catch ( final NumberFormatException ignored ) {
				return -1;
			}
		}


		public native Data string(final String string) /*-{

			this.push(string || "");

			return this;
		}-*/;

		public native Data number(final float number) /*-{

			this.push(number);

			return this;
		}-*/;

		public Data time(final long time) {
			return string(String.valueOf(time));
		}
	}
}
