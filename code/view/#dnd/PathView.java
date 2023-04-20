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

import com.metreeca._tile.client.*;
import com.metreeca._tile.client.plugins.Editable;
import com.metreeca._tile.client.plugins.Menu;
import com.metreeca.self.client.Self.Bus;
import com.metreeca.self.client.filters.OptionsView;
import com.metreeca.self.client.filters.RangeView;
import com.metreeca.self.shared.Command;
import com.metreeca.self.shared.Report;
import com.metreeca.self.shared.async.Handler;
import com.metreeca.self.shared.beans.Constraint;
import com.metreeca.self.shared.beans.Path;
import com.metreeca.self.shared.beans.Path.Summary;
import com.metreeca.self.shared.beans.Path.Transform;
import com.metreeca.self.shared.beans.Specs;
import com.metreeca.self.shared.forms.Values;

import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;

import java.util.List;

import static com.metreeca._tile.client.Tile.$;
import static com.metreeca._tile.client.plugins.Overlay.Align;
import static com.metreeca.self.shared.beans.Constraint.Options;
import static com.metreeca.self.shared.beans.Constraint.Range;


/**
 * Field/facet widget.
 */
public final class PathView extends View {

	private static final Resources resources=GWT.create(Resources.class);


	public static interface Resources extends ClientBundle {

		@Source("PathView.css") TextResource skin();

	}


	private Report report;

	private Path path;
	private Values baseline;

	private Boolean expanded; // null > header only / true > expanded / false > collapsed

	private final Tile toggle;
	private final Tile label;
	private final Tile action;
	private final Tile port;


	public PathView() {
		root("<div/>")

				.skin(resources.skin().getText())

				.append($("<header/>")

						.append(toggle=$("<button/>").is("fa toggle", true)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) {
										toggle();
									}
								}))

						// ;(ff) don't use inline elements for contenteditable (http://stackoverflow.com/a/7527050/739773)

						.append((label=$("<div/>").<Editable>as().wire().as())

								.bind("click", new Action<Event>() {
									@Override public void execute(final Event e) {
										if ( !report.isLocked() && !label.editable() ) {
											menu(path).open().align(label.parent(), Align.Fill, Align.Aside);
										}
									}
								})

								.change(new Action<Event>() {
									@Override public void execute(final Event e) {
										rename(label.text().trim());
									}
								}))

						.append(action=$("<button/>").is("fa action", true)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) {
										if ( focus() ) { open(); } else { remove(); }
									}
								})))

				.append(port=$("<section/>"))

				.change(new Action<Event>() {
					@Override public void execute(final Event e) {
						root().attribute("draggable", "true"); // !!! ;( force restore dragging }(blur event is lost)
					}
				})

				.drag(new Action.Drag() {

					@Override public void dragstart(final Event e) {
						if ( report.isLocked() ) { e.mode("none"); } else {
							e.mode("move")
									.data("text", path.label()) // ;(ie) text/plain not supported
									.data(PathView.class, PathView.this);
						}
					}

				});
	}


	private Menu menu(final Path path) {
		return $("<menu/>")

				.style("min-width", "8.5em")
				// !!! .style("font-size", "90%")

				.append($("<section/>")

						.append($("<command/>").attribute("label", "Rename…")

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { rename(); }
								})))

				.append($("<section/>").when(expanded == null)

						.append($("<command/>")

								.attribute("label", "Ascending")
								.selected(path.getSort() > 0)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { sort(1); }
								}))

						.append($("<command/>")

								.attribute("label", "Descending")
								.selected(path.getSort() < 0)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { sort(-1); }
								})))

				.append($("<section/>").when(expanded != null)

						.append($("<command/>")

								.attribute("label", "Present")
								.selected(path.getExisting() == Boolean.TRUE)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) {
										filter(path.getExisting() == Boolean.TRUE ? null : Boolean.TRUE);
									}
								}))

						.append($("<command/>")

								.attribute("label", "Missing")
								.selected(path.getExisting() == Boolean.FALSE)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) {
										filter(path.getExisting() == Boolean.FALSE ? null : Boolean.FALSE);
									}
								})))

				.append($("<section/>")

						.append($summary(path.getSummary()))
						.append($transform(path.getTransform())))

				.append($("<section/>")

						.append($("<command/>").attribute("label", "Duplicate")

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { duplicate(); }
								}))

						.append($("<command/>").attribute("label", "Expand…")

								.title("Add a related "+role())

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { expand(); }
								})))

				.append($("<section/>").when(expanded == null)

						.append($("<command/>").attribute("label", "Open…")

								.title("Open a related set")

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { open(); }
								})))

				.append($("<section/>")

						.append($("<command/>")

								.enabled(!singleton()) // prevent removal of last field

								.attribute("label", "Remove")

								.click(new Action<Event>() {
									@Override public void execute(final Event e) {
										remove();
									}
								})))

				.as();
	}

	private Tile $summary(final Summary summary) {
		return $("<menu/>")

				.attribute("label", summary == null ? "Summary" : summary.label())

				.append($("<section/>")

						.append($("<command/>")

								.attribute("label", "None")
								.selected(summary == null)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { summarize(null); }
								})))


				.append($("<section/>")

						.append($("<command/>")

								.attribute("label", Summary.Count.label())
								.selected(summary == Summary.Count)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { summarize(Summary.Count); }
								})))

				.append($("<section/>")

						.append($("<command/>")

								.attribute("label", Summary.Sum.label())
								.selected(summary == Summary.Sum)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { summarize(Summary.Sum); }
								}))

						.append($("<command/>")

								.attribute("label", Summary.Avg.label())
								.selected(summary == Summary.Avg)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { summarize(Summary.Avg); }
								}))

						.append($("<command/>")

								.attribute("label", Summary.Min.label())
								.selected(summary == Summary.Min)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { summarize(Summary.Min); }
								}))

						.append($("<command/>")

								.attribute("label", Summary.Max.label())
								.selected(summary == Summary.Max)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { summarize(Summary.Max); }
								}))

				);
	}

	private Tile $transform(final Transform transform) {
		return $("<menu/>")

				.attribute("label", transform == null ? "Transform" : transform.label())

				.append($("<section/>")

						.append($("<command/>")

								.attribute("label", "None")
								.selected(transform == null)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { transform(null); }
								})))

				.append($("<section/>")

						.append($("<command/>")

								.attribute("label", Transform.Year.label())
								.selected(transform == Transform.Year)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { transform(Transform.Year); }
								}))

						.append($("<command/>")

								.attribute("label", Transform.Quarter.label())
								.selected(transform == Transform.Quarter)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { transform(Transform.Quarter); }
								}))

						.append($("<command/>")

								.attribute("label", Transform.Month.label())
								.selected(transform == Transform.Month)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { transform(Transform.Month); }
								}))

						.append($("<command/>")

								.attribute("label", Transform.Day.label())
								.selected(transform == Transform.Day)

								.click(new Action<Event>() {
									@Override public void execute(final Event e) { transform(Transform.Day); }
								})))

				.append($("<section/>")

								.append($("<command/>")

										.attribute("label", Transform.Number.label())
										.selected(transform == Transform.Number)

										.click(new Action<Event>() {
											@Override public void execute(final Event e) { transform(Transform.Number); }
										}))

								.append($("<command/>")

										.attribute("label", Transform.Abs.label())
										.selected(transform == Transform.Abs)

										.click(new Action<Event>() {
											@Override public void execute(final Event e) { transform(Transform.Abs); }
										}))

								.append($("<command/>")

										.attribute("label", Transform.Round.label())
										.selected(transform == Transform.Round)

										.click(new Action<Event>() {
											@Override public void execute(final Event e) { transform(Transform.Round); }
										}))

						//.append($("<command/>")
						//
						//		.attribute("label", Transform.Ceil.label())
						//		.selected(transform == Transform.Ceil)
						//
						//		.click(new Action<Event>() {
						//			@Override public void execute(final Event e) { transform(Transform.Ceil); }
						//		}))

						//.append($("<command/>")
						//
						//		.attribute("label", Transform.Floor.label())
						//		.selected(transform == Transform.Floor)
						//
						//		.click(new Action<Event>() {
						//			@Override public void execute(final Event e) { transform(Transform.Floor); }
						//		}))

				);
	}


	//// Model /////////////////////////////////////////////////////////////////////////////////////////////////////////

	public Report report() {
		return report != null && !report.getEndpoint().isEmpty() ? report : null;
	}

	public PathView report(final Report report) {

		if ( report == null ) {
			throw new NullPointerException("null report");
		}

		this.report=report;
		this.path=null;
		this.baseline=null;

		return render();
	}


	public Path path() {
		return path;
	}

	public PathView path(final Path path) {

		if ( path == null ) {
			throw new NullPointerException("null path");
		}

		this.path=path;
		this.baseline=null;

		return render();
	}


	public Boolean expanded() {
		return expanded;
	}

	public PathView expanded(final Boolean expanded) {

		this.expanded=expanded;

		return render();
	}


	private Values baseline() {

		if ( report() != null && path() != null && baseline == null ) {
			root().fire(baseline=new Values()

					.setEndpoint(report.getEndpoint())
					.setSpecs(report.getSpecs().copy().setPaths(() -> report.getSpecs().getPaths().stream()
							.filter(path -> !path.isFacet()) // baseline ignores facets
							.iterator()
					))
					.setPath(path)
					.setLabel(true)

					.then(new Handler<Values>() {
						@Override public void value(final Values values) { render(); }
					}));
		}

		return baseline != null && baseline.fulfilled() ? baseline : null;
	}


	private boolean singleton() {
		return report() != null && path() != null && report().getSpecs().getFields().size() == 1;
	}

	private boolean focus() {
		return report() != null && path() != null && report().getSpecs().getFields().indexOf(path()) == 0;
	}

	private String role() {
		return expanded == null ? "field" : "filter";
	}


	//// Actions ///////////////////////////////////////////////////////////////////////////////////////////////////////

	private void toggle() {
		root().fire(report.setSpecs(report.arrayed().getSpecs().insertPath(
				path.setExpanded(expanded() == null ? null : !expanded()))));
	}

	private void rename() {
		if ( report.arrayed() != null ) {
			label.<Editable>as().editable(true);
		}
	}

	private void rename(final String label) {
		root().fire(new Command.Change<String>(path.label(), label) {

			@Override protected boolean set(final String value) {

				final Specs specs=report.getSpecs();

				if ( !path.isRoot() ) {

					path.setLabel(value);

				} else if ( value.isEmpty() ) {

					path.setLabel(specs.label());

				} else {

					for (final Path p : specs.getPaths()) {
						if ( p.isRoot() && p.getLabel().equals(specs.label()) ) { p.setLabel(value); }
					}

					specs.setLabel(value);
				}

				return root().fire(report.arrayed().setSpecs(specs.insertPath(path)));
			}

			@Override public String label() {
				return "Rename field '"+path.label()+"'";
			}
		});
	}

	private void sort(final int sort) {

		final List<Path> fields=report.getSpecs().getFields();

		final int[] memo=new int[fields.size()];

		for (int i=0; i < memo.length; i++) {
			memo[i]=fields.get(i).getSort();
		}

		root().fire(new Command() {

			@Override public boolean exec() {

				report.updated();

				for (int i=0; i < memo.length; i++) {
					if ( !fields.get(i).equals(path) ) {
						fields.get(i).setSort(0);
					}
				}

				path.setSort(sort > 0 ? path.getSort() > 0 ? 0 : sort // toggle asc/none
						: sort < 0 ? path.getSort() < 0 ? 0 : sort // toggle desc/none
						: path.getSort() > 0 ? -1 : +1); // toggle asc/desc


				return root().fire(report);
			}

			@Override public boolean undo() {

				report().updated();

				for (int i=0; i < memo.length; i++) {
					fields.get(i).setSort(memo[i]);
				}

				return root().fire(report);
			}

			@Override public String label() {
				return "Sort on field '"+path.label()+"'";
			}
		});
	}

	private void summarize(final Summary summary) {
		root().fire(new Command.Change<Path>(
				new Path().setSummary(path.getSummary()).setConstraint(path.getConstraint()),
				new Path().setSummary(summary).setConstraint(null) // clear constraint on summary change
		) {

			@Override protected boolean set(final Path value) {
				return root().fire(report.updated().setSpecs(report.getSpecs()
						.insertPath(path.setSummary(value.getSummary()).setConstraint(value.getConstraint()))));
			}

			@Override public String label() {
				return "Summarize field '"+path.label()+"'";
			}

		});
	}

	private void transform(final Transform transform) {
		root().fire(new Command.Change<Path>(
				new Path().setTransform(path.getTransform()).setConstraint(path.getConstraint()),
				new Path().setTransform(transform).setConstraint(null) // clear constraint on transform change
		) {

			@Override protected boolean set(final Path value) {
				return root().fire(report.updated().setSpecs(report.getSpecs()
						.insertPath(path.setTransform(value.getTransform()).setConstraint(value.getConstraint()))));
			}

			@Override public String label() {
				return "Transform field '"+path.label()+"'";
			}

		});
	}

	private void filter(final Boolean required) {
		root().fire(new Command.Change<Boolean>(path.getExisting(), required) {

			@Override protected boolean set(final Boolean value) {
				return root().fire(report.updated().setSpecs(report.getSpecs().insertPath(path.setExisting(value))));
			}

			@Override public String label() {
				return "Filter field '"+path.label()+"'";
			}

		});
	}

	private void filter(final Constraint constraint) {
		root().fire(new Command.Change<Constraint>(path.getConstraint(), constraint) {

			@Override protected boolean set(final Constraint value) {
				return root().fire(report.updated().setSpecs(report.getSpecs().insertPath(path.setConstraint(value))));
			}

			@Override public String label() {
				return "Filter field '"+path.label()+"'";
			}

		});
	}

	private void duplicate() {
		root().fire(new Command() {

			private final Path target=new Path()
					.setExpanded(expanded == null ? null : Boolean.TRUE)
					.setLabel(path.getLabel())
					.setSummary(path.getSummary())
					.setTransform(path.getTransform())
					.setSteps(path.getSteps());


			@Override public boolean exec() {
				return root().fire(report.updated().setSpecs(report.getSpecs().insertPath(target, path)));
			}

			@Override public boolean undo() {
				return root().fire(report.updated().setSpecs(report.getSpecs().removePath(target)));
			}

			@Override public String label() {
				return "Add "+role()+" '"+target.label()+"'";
			}
		});
	}

	private void expand() {
		$(new PathPicker().open(report.arrayed(), path)).change(new Action<Event>() {
			@Override public void execute(final Event e) {
				if ( e.cancel() ) { expand(e.<Path>data()); }
			}
		});
	}

	private void expand(final Path path) {

		final Path target=path.setExpanded(expanded == null ? null : Boolean.TRUE);

		root().fire(new Command() {

			@Override public boolean exec() {
				return root().fire(report.updated().setSpecs(report.getSpecs().insertPath(target, PathView.this.path)));
			}

			@Override public boolean undo() {
				return root().fire(report.updated().setSpecs(report.getSpecs().removePath(target)));
			}

			@Override public String label() {
				return "Add "+role()+" '"+target.label()+"'";
			}
		});
	}

	private void open() {
		$(new PathPicker().open(report.arrayed(), path)).change(new Action<Event>() {
			@Override public void execute(final Event e) {
				if ( e.cancel() ) { root().async(e.<Path>data()); }
			}
		});
	}

	private void remove() {

		final Specs original=report.getSpecs();
		final Specs modified=original.copy().removePath(path);

		final List<Path> originals=original.getFields();
		final List<Path> modifieds=modified.getFields();

		if ( originals.indexOf(path) == 0 && !modifieds.isEmpty() ) { // pivoting
			modified.center(modifieds.get(0));
		}

		root().fire(new Command.Change<Specs>(original, modified) {

			@Override protected boolean set(final Specs value) {
				return root().fire(report.updated().setSpecs(value));
			}

			@Override public String label() {
				return "Remove "+role()+" '"+path.label()+"'";
			}
		});
	}


	//// View //////////////////////////////////////////////////////////////////////////////////////////////////////////

	private PathView render() {

		final Report report=report();
		final Path path=path();

		if ( report != null && path != null ) {

			final boolean locked=report.isLocked();

			final boolean focus=focus();
			final String text=path.label();

			toggle.enabled(!locked)

					.visible(expanded != null)

					.is("fa-caret-right", expanded == Boolean.FALSE)
					.is("fa-caret-down", expanded == Boolean.TRUE);

			label.enabled(!locked)

					.is("ascending", path.getSort() > 0)
					.is("descending", path.getSort() < 0)

					.is("present", Boolean.TRUE.equals(path.getExisting()))
					.is("missing", Boolean.FALSE.equals(path.getExisting()))

					.text(text)
					.title(text); // show complete label as tooltip if text is truncated // !!! vs show path as tooltip if field is renamed

			action.enabled(!locked)

					.is("open fa-share-alt", focus)
					.is("remove fa-remove", !focus)

					.title(focus ? "Open a related set" : "Remove "+role());

			if ( Boolean.TRUE.equals(expanded) ) {

				final Values baseline=baseline();

				if ( baseline != null ) {
					port.is("small busy", false).clear().append(filter(path, baseline));
				} else {
					port.is("small busy", port.children().size() == 0); // preserve facet until updates are ready
				}

				port.show();

			} else {
				port.clear().hide();
			}

			// report active aggregate filters

			if ( path.isFacet() && !path.isAggregate()
					&& !report.getSpecs().isProjected(path.getSteps()) && report.getSpecs().isSliced() ) {

				root().<Bus>as().slicing(true);

			}
		}

		return this;
	}


	private Tile filter(final Path path, final Values baseline) { // preserve current constraint if non-empty
		return path.getConstraint() instanceof Options && !path.getConstraint().isEmpty() ? options(path, baseline)
				: path.getConstraint() instanceof Range && !path.getConstraint().isEmpty() ? range(path, baseline)

				: baseline.getStats().isNumeric() ? range(path.setConstraint(new Range()), baseline)
				: baseline.getStats().isTemporal() ? range(path.setConstraint(new Range()), baseline)

				: options(path.setConstraint(new Options()), baseline);
	}

	private Tile options(final Path path, final Values baseline) {

		final OptionsView options=new OptionsView()
				.report(report)
				.selection(((Options)path.getConstraint()).getValues())
				.baseline(baseline);

		return $(options).change(new Action<Event>() {
			@Override public void execute(final Event e) {
				filter(new Options(options.selection()));
			}
		});
	}

	private Tile range(final Path path, final Values baseline) {

		final RangeView range=new RangeView()
				.report(report)
				.lower(((Range)path.getConstraint()).getLower())
				.upper(((Range)path.getConstraint()).getUpper())
				.baseline(baseline);

		return $(range).change(new Action<Event>() {
			@Override public void execute(final Event e) {
				filter(new Range(range.lower(), range.upper()));
			}
		});
	}

}
