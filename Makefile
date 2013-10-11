SRC = $(wildcard lib/*.js)

build: components index.js $(SRC) livechart.css
	@component build
	@touch build

start:
	@component serve &

components: component.json
	@component install --dev

standalone:
	@component build --standalone livechart -o .
	@mv build.js livechart.js

clean:
	rm -fr build components template.js

.PHONY: clean start standalone
