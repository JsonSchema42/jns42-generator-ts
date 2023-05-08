SHELL:=$(PREFIX)/bin/sh

TS_SRC:=$(wildcard src/*.ts src/*/*.ts src/*/*/*.ts src/*/*/*/*.ts src/*/*/*/*/*.ts)
JS_OUT:=$(patsubst src/%.ts,out/%.js,$(TS_SRC))
DTS_OUT:=$(patsubst src/%.ts,out/%.d.ts,$(TS_SRC))


rebuild: clean build

build: \
	$(JS_OUT) \
	$(DTS_OUT) \

clean:
	rm -rf out

$(JS_OUT) $(DTS_OUT): tsconfig.json $(TS_SRC)
	npx tsc --project $<

.PHONY: \
	rebuild \
	build \
	clean \

.NOTPARALLEL: $(JS_OUT) $(DTS_OUT)
