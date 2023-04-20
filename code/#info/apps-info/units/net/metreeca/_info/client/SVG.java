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

import net.metreeca.tile.client.*;

import com.google.gwt.core.client.JavaScriptObject;

import static net.metreeca.tile.client.Tile.$;


@SuppressWarnings("ProtectedMemberInFinalClass")
public final class SVG extends Plugin {

	// !!! optimize $() for svg nodes

	public static SVG svg() {
		return $("<svg:svg preserveAspectRatio='xMidYMid meet'/>").as();
	}

	public static SVG svg(final float width, final float height) {
		return svg().width(width).height(height);
	}

	public static Group group() {
		return $("<svg:g/>").as();
	}

	public static Circle circle() {
		return $("<svg:circle/>").as();
	}

	public static Rect rect() {
		return $("<svg:rect/>").as();
	}

	public static Rect rect(final float w, final float h) {
		return rect().w(w).h(h);
	}

	public static Rect rect(final float x, final float y, final float w, final float h) {
		return rect().x(x).y(y).w(w).h(h);
	}

	public static Line line() {
		return $("<svg:line/>").as();
	}

	public static Polyline polyline() {
		return $("<svg:polyline/>").as();
	}

	public static Line line(final float sx, final float sy, final float tx, final float ty) {
		return line().sx(sx).sy(sy).tx(tx).ty(ty);
	}

	public static Path path() {
		return $("<svg:path/>").as();
	}

	public static Text text() {
		return $("<svg:text/>").as();
	}

	public static Text text(final String text) {
		return text().text(text);
	}

	public static HTML html() {
		return $("<svg:foreignObject/>").as();
	}


	protected SVG() {}


	public SVG width(final float width) {
		return this.<Tile>as().attribute("width", width > 0 ? String.valueOf(width) : "").as();
	}

	public SVG height(final float height) {
		return this.<Tile>as().attribute("height", height > 0 ? String.valueOf(height) : "").as();
	}


	public abstract static class Shape<T extends Shape<T>> extends Plugin {

		protected Shape() {}


		public final native Box box() /*-{
			return this[0] && this[0].getBBox() || {};
		}-*/;


		public final T stroke(final String stroke) {
			return this.<Tile>as().style("stroke", stroke).as();
		}

		public final T strokeWidth(final float width) {
			return strokeWidth(width+"px");
		}

		public final T strokeWidth(final String width) {
			return this.<Tile>as().attribute("stroke-width", width).as();
		}

		public final T fill(final String fill) {
			return this.<Tile>as().style("fill", fill).as();
		}

		public final T translate(final float x, final float y) {
			return transform("translate("+x+", "+y+")", true);
		}

		public final T rotate(final float a) {
			return transform("rotate("+a+")", true);
		}

		public final T transform(final String transform) {
			return this.<Tile>as().attribute("transform", transform).as();
		}

		private T transform(final String translate, final boolean incremental) {
			return this.<Tile>as().each(new Lambda<Tile>() {
				@Override public Tile apply(final Tile tile) {

					final String current=tile.attribute("transform");

					return tile.attribute("transform", incremental && current != null ? translate+" "+current : translate);

				}
			}).as();
		}


		public final native Point point(final Event e) /*-{ // see http://stackoverflow.com/a/5223921

			var self=this[0];

			if ( self ) {

				var svg=self.ownerSVGElement;
				var point=svg.createSVGPoint();

				point.x=e.clientX;
				point.y=e.clientY;

				return point
						.matrixTransform(svg.getScreenCTM().inverse())
						.matrixTransform(self.getTransformToElement(svg).inverse());

			} else {
				return {}
			}
		}-*/;


		public final native Point screen(final float x, final float y) /*-{

			var self=this[0];

			if ( self ) {

				var svg=self.ownerSVGElement;
				var point=svg.createSVGPoint();

				point.x=x;
				point.y=y;

				return point
						.matrixTransform(self.getTransformToElement(svg))
						.matrixTransform(svg.getScreenCTM());

			} else {
				return {}
			}
		}-*/;
	}


	public static final class Group extends Shape<Group> {

		protected Group() {}

	}

	public static final class Circle extends Shape<Circle> {

		protected Circle() {}


		public Circle x(final float x) {
			return this.<Tile>as().attribute("cx", x).as();
		}

		public Circle y(final float y) {
			return this.<Tile>as().attribute("cy", y).as();
		}
	}

	public static final class Rect extends Shape<Rect> {

		protected Rect() {}


		public Rect x(final float x) {
			return this.<Tile>as().attribute("x", x).as();
		}

		public Rect y(final float y) {
			return this.<Tile>as().attribute("y", y).as();
		}

		public Rect w(final float w) {
			return this.<Tile>as().attribute("width", w).as();
		}

		public Rect h(final float h) {
			return this.<Tile>as().attribute("height", h).as();
		}
	}

	public static final class Line extends Shape<Line> {

		protected Line() {}


		public Line sx(final float x) {
			return this.<Tile>as().attribute("x1", x).as();
		}

		public Line sy(final float y) {
			return this.<Tile>as().attribute("y1", y).as();
		}

		public Line tx(final float x) {
			return this.<Tile>as().attribute("x2", x).as();
		}

		public Line ty(final float y) {
			return this.<Tile>as().attribute("y2", y).as();
		}
	}

	public static final class Polyline extends Shape<Polyline> {

		protected Polyline() {}

		public Line point(final float x, final float y) {

			return this.<Tile>as().each(new Lambda<Tile>() {
				@Override public Tile apply(final Tile tile) {

					final String points=tile.attribute("points");
					final String point=x+","+y;

					return tile.attribute("points", points == null ? point : points+" "+point);
				}
			}).as();
		}
	}

	public static final class Path extends Shape<Path> {

		protected Path() {}


		public Path Move(final float x, float y) {
			return add("M "+x+" "+y);
		}

		public Path move(final float x, float y) {
			return add("m "+x+" "+y);
		}


		public Path Line(final float x, float y) {
			return add("L "+x+" "+y);
		}

		public Path close() {
			return add("z");
		}

		public Path clear() {
			return this.<Tile>as().attribute("d", "").as();
		}

		public Path line(final float x, float y) {
			return add("l "+x+" "+y);
		}


		public Path add(final String command) {

			final Tile self=as();
			final String d=self.attribute("d");

			return self.attribute("d", d != null && command != null ? d+' '+command : command != null ? command : "").as();
		}

		public Path quadratic(final float cx, final float cy, final float x, final float y) {
			return add("q "+cx+' '+cy+' '+x+' '+y);
		}
	}

	public static final class Text extends Shape<Text> {

		protected Text() {}

		public native float length() /*-{
			return this[0] ? this[0].getComputedTextLength() : 0;
		}-*/;

		public Text text(final String text) {
			return this.<Tile>as().text(text).as();
		}
	}

	public static final class HTML extends Shape<HTML> {

		protected HTML() {}


		public HTML x(final float x) {
			return this.<Tile>as().attribute("x", x).as();
		}

		public HTML y(final float y) {
			return this.<Tile>as().attribute("y", y).as();
		}

		public HTML w(final float w) {
			return this.<Tile>as().attribute("width", w).as();
		}

		public HTML h(final float h) {
			return this.<Tile>as().attribute("height", h).as();
		}

		public HTML w(final String w) {
			return this.<Tile>as().attribute("width", w).as();
		}

		public HTML h(final String h) {
			return this.<Tile>as().attribute("height", h).as();
		}
	}


	public static final class Point extends JavaScriptObject {

		@SuppressWarnings("ProtectedMemberInFinalClass") protected Point() {}


		public native float x() /*-{ return this.x || 0; }-*/;

		public native float y() /*-{ return this.y || 0; }-*/;

	}

	public static final class Box extends JavaScriptObject {

		@SuppressWarnings("ProtectedMemberInFinalClass") protected Box() {}


		public native float x() /*-{ return this.x || 0; }-*/;

		public native float y() /*-{ return this.y || 0; }-*/;

		public native float w() /*-{ return this.width || 0; }-*/;

		public native float h() /*-{ return this.height || 0; }-*/;

	}
}
