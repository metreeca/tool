#
# Copyright © 2013-2015 Metreeca srl. All Rights Reserved.
#

deps = node_modules
bins = node_modules/.bin
tmps = packs

main = units/info.js
pack = packs/info.js

browsers = PhantomJS


########################################################################################################################

all : build

build : packs specs/webpack.js $(deps) $(shell find $(dir $(main)))

	$(bins)/webpack -d --config specs/webpack.js $(main) $(pack)
	$(bins)/webpack -p --config specs/webpack.js $(main) $(basename $(pack)).min.js # !!! add automatic meta/copy prefix

test : $(deps)

	$(bins)/karma start --single-run --browsers $(browsers) specs/karma.js

watch: $(deps)

	$(bins)/webpack-dev-server -d --config specs/webpack.js $(main)

setup :

	npm link metreeca-core

clean :

	rm -rf $(deps)
	rm -rf $(tmps)


########################################################################################################################

$(deps): package.json

	npm install

$(tmps) :

	mkdir -p $(@)


