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

import com.metreeca.self.shared.Command;
import com.metreeca.self.shared.async.Handler;
import com.metreeca.self.shared.async.Promise;
import com.metreeca._tile.client.*;
import com.metreeca.self.client.Self.Bus;
import com.metreeca.self.shared.Report;
import com.metreeca.self.shared.beans.Path;
import com.metreeca.self.shared.beans.Specs;
import com.metreeca.self.shared.forms.Ranges;
import com.metreeca.self.shared.forms.Tuples;
import com.metreeca.self.shared.forms.Values;

import com.google.gwt.core.client.GWT;
import com.google.gwt.i18n.client.NumberFormat;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;

import java.util.HashMap;
import java.util.Map;

import static com.metreeca._tile.client.Tile.$;


public final class FacetsView extends View {

	private static final Resources resources=GWT.create(Resources.class);


	public static interface Resources extends ClientBundle {

		@Source("FacetsView.css") TextResource skin();

	}


	private boolean locked;

	private Report report;
	private Tuples tuples;

	private final Input pattern;
	private final Tile add;
	private final Tile port;

	private final Tile sampling;
	private final Tile slicing;

	private final Tile status;


	private final Map<Path, PathView> facets=new HashMap<>();


	public FacetsView() {
		root("<div/>")

				.skin(resources.skin().getText())


				.append($("<header/>")

						.append($(pattern=new Input().search(true).immediate(true))

								.change(new Action<Event>() {
									@Override public void execute(final Event e) {
										if ( report.arrayed() != null ) {
											filter(e.target().value().trim());
										}
									}
								}))


						.append(add=$("<button/>").is("fa fa-plus", true).title("Add facet")

								.click(new Action<Event>() {
									@Override public void execute(final Event e) {
										$(new PathPicker().open(report.arrayed(), new Path())).change(new Action<Event>() {
											@Override public void execute(final Event e) {
												if ( e.cancel() ) { insert(e.<Path>data()); }
											}
										});
									}
								})))

				.append(port=$("<div/>")

						.drop(new PathDrop()))

				.append($("<footer/>")

						.append(sampling=$("<span/>")
								.visible(false) // don't show at start
								.is("warning fa fa-bars", true)
								.title("Sampled result set: facet values are estimated")

								.click(new Action<Event>() {
									@Override public void execute(final Event event) { samplingWarning(); }
								}))

						.append(slicing=$("<span/>")
								.visible(false) // don't show at start
								.is("warning fa fa-filter", true)
								.title("Aggregate filters: facet values may be overestimated")

								.click(new Action<Event>() {
									@Override public void execute(final Event event) { slicingWarning(); }
								}))

						.append(status=$("<span/>")
								.is("status", true)))


				.bind(Report.class, new Action<Event>() {
					@Override public void execute(final Event e) { report(e.<Report>data()); }
				})

				.bind(Tuples.class, new Action<Event>() {
					@Override public void execute(final Event e) { tuples(e.<Tuples>data()); }
				})

				.bind(Values.class, new Action<Event>() {
					@Override public void execute(final Event e) { values(e.<Values>data()); }
				}) // monitor for sampling hints

				.bind(Ranges.class, new Action<Event>() {
					@Override public void execute(final Event e) { ranges(e.<Ranges>data()); }
				}) // monitor for sampling hints

				.<Bus>as()

				.sampling(new Action<Boolean>() {
					@Override public void execute(final Boolean sampling) { sampling(sampling); }
				})

				.slicing(new Action<Boolean>() {
					@Override public void execute(final Boolean slicing) { slicing(slicing); }
				});
	}


	//// Model /////////////////////////////////////////////////////////////////////////////////////////////////////////

	public boolean locked() {
		return locked;
	}

	public FacetsView locked(final boolean locked) {

		this.locked=locked;

		return render();
	}


	private Report report() {
		return report != null && !report.getEndpoint().isEmpty() ? report : null;
	}

	private FacetsView report(final Report report) {

		this.report=report;
		this.tuples=null;

		return render();
	}


	private Tuples tuples() {
		return tuples != null && tuples.fulfilled() ? tuples : null;
	}

	private FacetsView tuples(final Tuples tuples) {

		(this.tuples=tuples) // ensure field is set before rendering

				.then(new Handler<Tuples>() {
					@Override public void value(final Tuples tuples) { render(); }
				});

		return this;
	}


	private FacetsView sampling(final Boolean sampling) {

		this.sampling.visible(sampling);

		return this;
	}

	private FacetsView slicing(final Boolean slicing) {

		this.slicing.visible(slicing);

		return this;
	}


	//// Events ////////////////////////////////////////////////////////////////////////////////////////////////////////

	private void values(final Promise<Values> values) {
		values.then(new Handler<Values>() {
			@Override public void value(final Values values) {
				if ( values.isSampled() ) { root().<Bus>as().sampling(true); }
			}
		});
	}

	private void ranges(final Promise<Ranges> ranges) {
		ranges.then(new Handler<Ranges>() {
			@Override public void value(final Ranges ranges) {
				if ( ranges.isSampled() ) { root().<Bus>as().sampling(true); }
			}
		});
	}


	//// Actions ///////////////////////////////////////////////////////////////////////////////////////////////////////

	private void filter(final String keywords) { // ;( firing specs directly would reset lens to auto
		root().fire(report.updated().setSpecs(report.getSpecs().setPattern(keywords)));
	}

	private void insert(final Path path) {
		insert(path.setExpanded(Boolean.TRUE), -1);
	}

	private void insert(final Path facet, final int target) {

		final Specs original=report.getSpecs();
		final Specs modified=original.copy().insertFacet(facet, target);

		root().fire(new Command.Change<Specs>(original, modified) {

			@Override protected boolean set(final Specs value) {
				return root().fire(report.updated().setSpecs(value));
			}

			@Override public String label() {
				return "Add facet '"+facet.label()+"'";
			}
		});
	}

	private void move(final Path facet, final int target, final int source) {
		root().fire(new Command.Change<Integer>(source, target) {

			@Override protected boolean set(final Integer value) {
				return root().fire(report.updated().setSpecs(report.getSpecs().insertFacet(facet, value)));
			}

			@Override public String label() {
				return "Move facet '"+facet.label()+"'";
			}
		});
	}


	//// View //////////////////////////////////////////////////////////////////////////////////////////////////////////

	private FacetsView render() {

		final Report report=report();
		final Tuples tuples=tuples();

		if ( report != null ) {
			if ( tuples == null ) { // updating report >> update facets

				final boolean locked=report.isLocked();

				pattern.enabled(!locked).value(report.getSpecs().getPattern());
				add.enabled(!locked);

				status.text("");

				// create facets reusing existing ones (to preserve local configuration)

				port.clear();

				final Map<Path, PathView> facets=new HashMap<>();

				for (final Path path : report.getSpecs().getFacets()) {

					PathView facet=this.facets.get(path);

					if ( facet == null ) {
						facet=new PathView();
					}

					facets.put(path, facet);

					port.append(facet // expand after report() cleared facet model to avoid transients with old values
							.report(report)
							.path(path)
							.expanded(path.getExpanded()));
				}

				// store facets for future use

				this.facets.clear();
				this.facets.putAll(facets);

				// reset warnings

				root().<Bus>as()

						.sampling(false)
						.slicing(false);

			} else { // updated report >> update status

				final int matches=tuples.getEntries().size();
				final int ceiling=tuples.getLimit(); // !!! review (assumes offset == 0)

				status.text(matches == 0 ? "no matches"
						: matches == 1 ? "1 match"
						: ceiling == 0 || matches < ceiling ? format(matches)+" matches"
						: "more than "+format(ceiling)+" matches");

			}
		}

		return this;
	}


	private void samplingWarning() {
		new Dialog()

				.message("Sampled Result Set")
				.details("The current result set is very large: "
						+"matches and facet values are estimated on a smaller sample "
						+"and may change as further constraints are introduced.")

				.action("OK")

				.open();
	}

	private void slicingWarning() {
		new Dialog()

				.message("Aggregate Filters")
				.details("The current result set is filtered on aggregate values: "
						+"some facet values are estimated "
						+"and may change as further constraints are introduced.")

				.action("OK")

				.open();
	}


	private String format(final int number) {
		return NumberFormat.getDecimalFormat().format(number);
	}


	private final class PathDrop extends Action.Drop {

		private PathView field;

		private Tile tile; // the dragged tile
		private int source; // < 0 : insertion / >= 0 : reordering (the original index of the field)


		@Override protected void dragenter(final Event e) {

			final PathView field=e.data(PathView.class);

			if ( field != null && e.cancel() ) {

				e.mode("move");

				if ( e.current().children().any($(field)) ) { // reordering > move the original field

					this.field=field;
					this.tile=$(this.field);
					this.source=this.tile.index();

				} else { // insertion > insert a copy

					this.field=new PathView().expanded(Boolean.FALSE).report(field.report()).path(field.path());
					this.tile=$(this.field).is("dragging", true); // emulates dragging on copy
					this.source=-1;

				}
			}
		}

		@Override protected void dragover(final Event e) {
			if ( field != null && e.cancel() ) {

				e.mode("move");

				final int source=tile.index();
				final int target=target(e);

				// insert if not already a child or if actually changing position

				if ( source < 0 ) {
					e.current().insert(tile, target);
				} else if ( target != source && target != source+1 ) { // compensate index if moving downward
					e.current().insert(tile, source < target ? target-1 : target);
				}

			}
		}

		@Override protected void dragleave(final Event e) {
			if ( field != null && e.cancel() ) {

				if ( source >= 0 ) { // reordering

					e.current().insert(tile, source); // restore the original position

				} else { // insertion

					tile.remove(); // remove

				}

				field=null;
				tile=null;
				source=0;
			}
		}

		@Override protected void drop(final Event e) {
			if ( field != null && e.cancel() ) {

				final Path path=field.path();
				final int target=tile.index();

				if ( source >= 0 ) { // reordering

					move(path, target, source);

				} else { // insertion

					insert(path.copy()
							.setSort(0)
							.setExpanded(Boolean.TRUE), target);

				}

				field=null;
				tile=null;
				source=0;
			}
		}


		private int target(final Event e) { // return the insertion index for field dnd operations

			int index=0;
			float delta=Float.MAX_VALUE;

			final int y=e.y(true);
			final Tile children=e.current().children();

			for (int i=0, size=children.size(); i < size; ++i) {

				final Box box=children.node(i).box();

				final float top=Math.abs(y-box.top());

				if ( top < delta ) {
					index=i;
					delta=top;
				}

				final float bottom=Math.abs(y-box.bottom());

				if ( bottom < delta ) {
					index=i+1;
					delta=bottom;
				}
			}

			return index;
		}
	}

}
