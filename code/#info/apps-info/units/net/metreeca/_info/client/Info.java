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

import net.metreeca.tile.client.Tile;
import net.metreeca.tile.client.View;
import net.metreeca.tile.client.plugins.Overlay;

import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;

import static net.metreeca.tile.client.Tile.$;


public final class Info extends View {

	private static final Resources resources=GWT.create(Resources.class);


	public static interface Resources extends ClientBundle {

		@Source("Info.css") TextResource skin();

	}


	private float x;
	private float y;


	public Info() {
		root("<div/>").skin(resources.skin().getText());
	}


	public Info spot(final float x, final float y) {

		this.x=x;
		this.y=y;

		return render();
	}

	public Info text(final String text) {
		return text($("<span/>").text(text));
	}

	public Info text(final Tile text) {

		root().clear().append(text);

		return render();
	}


	public Info open() {

		root().<Overlay>as().open();

		return this;
	}

	public Info close() {

		root().<Overlay>as().close();

		return this;
	}


	private Info render() { // !!! avoid repeated execution

		root().<Overlay>as().align(x-root().width(true)-5, y-root().height(true)/2.0f);

		return this;
	}
}
