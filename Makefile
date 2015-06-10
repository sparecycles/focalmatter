tsc = node typescript/tsc.js
r.js = node node_modules/.bin/r.js

all: focal.js depends

.PHONY: depends
depends: require.js raphael.js

typescripts = $(filter-out typescript/%, $(wildcard *.ts */*.ts */*/*.ts))
compiled = $(patsubst %.ts, build/%.js, $(typescripts))

require.js : node_modules/requirejs/require.js
	cp "$<" "$@"

focal.js : build/timestamps/compiled
	echo typescripts: $(typescripts)
	echo compiled: $(compiled)
	$(r.js) -o build.js

build/timestamps/typescripts : $(typescripts)
	@mkdir -p build/timestamps
	@touch $@

build/timestamps/compiled : build/timestamps/typescripts
	$(tsc) --module amd index.ts --outDir build/
	@touch $@

.PHONY: clean
clean:
	@rm -rf build/
	@rm -rf focal.js

.PHONY: server
server: FORCE
	server --execute /build/index.js:make --execute /focal.js:make

.PHONY: FORCE
FORCE : ;
