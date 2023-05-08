SHELL:=$(PREFIX)/bin/sh

TS_SRC:=$(wildcard src/*.ts src/*/*.ts src/*/*/*.ts src/*/*/*/*.ts src/*/*/*/*/*.ts)
JS_OUT:=$(patsubst src/%.ts,out/%.js,$(TS_SRC))
DTS_OUT:=$(patsubst src/%.ts,out/%.d.ts,$(TS_SRC))

PACKAGE:=array-with-ref simple-object string-or-boolean
PACKAGE_DST:=$(patsubst %,.package/%,$(PACKAGE))

rebuild: clean build

build: \
	$(JS_OUT) \
	$(DTS_OUT) \
	$(PACKAGE_DST) \

clean:
	rm -rf out .package

$(JS_OUT) $(DTS_OUT): tsconfig.json $(TS_SRC)
	npx tsc --project $<

.package/%: fixtures/schema/%.json $(JS_OUT)
	node out/program.js \
		package file://$(PWD)/$< \
		--package-directory $@ \
		--package-name $* \
		--package-version 0.0.0 \

	( cd $@ ; npm install )

.PHONY: \
	rebuild \
	build \
	clean \

.NOTPARALLEL: $(JS_OUT) $(DTS_OUT)
